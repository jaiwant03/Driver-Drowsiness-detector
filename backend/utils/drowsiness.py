"""
Driver Drowsiness Detector — MobileNetV2 Keras model.

Model: best_finetuned.keras
Architecture: MobileNetV2 fine-tuned classifier
Input: 224 x 224 x 3 RGB, float32 in range [0, 255]
       (the saved .keras file contains a built-in Rescaling(1/127.5, -1) layer
        that converts [0,255] → [-1,1] internally)
Output: softmax probabilities over 4 classes
Classes (index → name, from class_names.json and notebook):
  0 → Closed   (eyes closed  → DROWSY)
  1 → Open     (eyes open    → ALERT)
  2 → no_yawn  (no yawn      → ALERT)
  3 → yawn     (yawning      → DROWSY)

Drowsy determination: predicted class in {"Closed", "yawn"}
Alert determination:  predicted class in {"Open", "no_yawn"}

Preprocessing (from notebook cell predict_image()):
  image.resize((224, 224), BILINEAR)
  np.asarray(image, dtype=np.float32)          # [0, 255]
  np.expand_dims(arr, axis=0)                  # (1, 224, 224, 3)
  model.predict(batch)                         # built-in rescaling applies

Temporal smoothing: majority vote over last N predictions.
Alarm: triggered after M consecutive drowsy frames OR T seconds of drowsiness.
"""

from __future__ import annotations

import json
import threading
import time
from collections import deque
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

# ---------------------------------------------------------------------------
# Lazy Keras import — avoids TF startup noise in module scope
# ---------------------------------------------------------------------------
_keras = None


def _patch_keras_layers(keras_mod):
    """Ensure backwards compatibility when loading models saved across Keras versions."""
    import inspect
    for layer_name in ("Dense", "Conv2D", "DepthwiseConv2D", "BatchNormalization"):
        if hasattr(keras_mod.layers, layer_name):
            layer_cls = getattr(keras_mod.layers, layer_name)
            orig_init = layer_cls.__init__
            try:
                sig = inspect.signature(orig_init)
                if "quantization_config" not in sig.parameters:
                    def make_init(orig):
                        def init(self, *args, **kwargs):
                            kwargs.pop("quantization_config", None)
                            return orig(self, *args, **kwargs)
                        return init
                    layer_cls.__init__ = make_init(orig_init)
            except Exception:
                pass


def _get_keras():
    global _keras
    if _keras is None:
        try:
            import keras as _k
            _keras = _k
        except ImportError:
            from tensorflow import keras as _k
            _keras = _k
        _patch_keras_layers(_keras)
    return _keras


# ---------------------------------------------------------------------------
# Constants derived from notebook
# ---------------------------------------------------------------------------
IMAGE_SIZE = 224                          # from notebook: IMAGE_SIZE = 224
DROWSY_CLASSES = frozenset({"Closed", "yawn"})
ALERT_CLASSES  = frozenset({"Open", "no_yawn"})
DEFAULT_CLASS_NAMES = ["Closed", "Open", "no_yawn", "yawn"]  # index 0-3


class DrowsinessDetector:
    """
    Wraps best_finetuned.keras for real-time drowsiness detection.

    Thread-safe: a single instance can be called from the Flask
    request thread without additional locking from the caller.
    """

    def __init__(
        self,
        model_path: str | Path,
        class_names_path: str | Path | None = None,
        confidence_threshold: float = 0.40,
        smoothing_window: int = 5,
        drowsy_frame_limit: int = 10,
        alarm_time_seconds: float = 2.0,
    ) -> None:
        self.model_path          = Path(model_path)
        self.confidence_threshold = confidence_threshold
        self.smoothing_window    = smoothing_window
        self.drowsy_frame_limit  = drowsy_frame_limit
        self.alarm_time_seconds  = alarm_time_seconds

        self._lock = threading.Lock()

        # Temporal state
        self._history: deque[str] = deque(maxlen=smoothing_window)
        self._drowsy_frame_count  = 0
        self._drowsy_start: float | None = None
        self._alarm_active        = False

        # Counters (for UI stats)
        self._total_frames        = 0
        self._drowsy_events       = 0

        # Last result cache
        self.last_prediction      = "Waiting"
        self.last_confidence      = 0.0
        self.last_status          = "WAITING"

        # --- Load class names ---
        self.class_names = self._load_class_names(class_names_path)

        # --- Load OpenCV face and eye detectors ---
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self._face_cascade = cv2.CascadeClassifier(cascade_path)
        if self._face_cascade.empty():
            raise RuntimeError(
                f"OpenCV Haar cascade not found at: {cascade_path}\n"
                "Install opencv-python: pip install opencv-python"
            )

        eye_cascade_path = cv2.data.haarcascades + "haarcascade_eye.xml"
        self._eye_cascade = cv2.CascadeClassifier(eye_cascade_path)

        # --- Load Keras model ---
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Drowsiness model not found: {self.model_path}\n"
                "Place best_finetuned.keras in the models/ directory."
            )

        keras = _get_keras()
        self.model = keras.models.load_model(
            str(self.model_path), compile=False
        )
        in_shape  = self.model.input_shape
        out_shape = self.model.output_shape

        expected_n = int(out_shape[-1])
        if expected_n != len(self.class_names):
            pass  # class count mismatch — silently continue

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @property
    def num_classes(self) -> int:
        return len(self.class_names)

    def predict(self, pil_image: Image.Image) -> dict:
        """
        Run drowsiness inference on *pil_image* (any size, any mode).
        Returns a dict with prediction details safe to JSON-serialize.
        """
        with self._lock:
            # 1. Face detection
            face_img, face_bgr, face_detected = self._detect_face(pil_image)

            if not face_detected or face_img is None or face_bgr is None:
                self._reset_state(clear_history=True)
                self.last_prediction = "No Face"
                self.last_confidence = 0.0
                self.last_status     = "NO FACE"
                return self._no_face_result()

            # 2. Extract eye crops (the model was trained on cropped eyes for Closed/Open)
            eye_crops = self._extract_eye_crops(face_bgr)

            # Preprocess face and eye crops for batched inference
            batches = [self._preprocess(face_img)]
            for crop in eye_crops:
                crop_rgb = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
                batches.append(self._preprocess(Image.fromarray(crop_rgb)))

            all_batch = np.concatenate(batches, axis=0)
            all_probs = self.model.predict(all_batch, verbose=0)

            face_probs = self._normalise_probs(np.asarray(all_probs[0], dtype=np.float32))
            eye_probs_list = [
                self._normalise_probs(np.asarray(all_probs[i], dtype=np.float32))
                for i in range(1, len(all_probs))
            ]

            # Probabilities mapping: 0: Closed, 1: Open, 2: no_yawn, 3: yawn
            yawn_p    = float(face_probs[3])
            no_yawn_p = float(face_probs[2])

            if eye_probs_list:
                avg_closed_p = float(np.mean([p[0] for p in eye_probs_list]))
                avg_open_p   = float(np.mean([p[1] for p in eye_probs_list]))
            else:
                avg_closed_p = float(face_probs[0])
                avg_open_p   = float(face_probs[1])

            # Combined probabilities dictionary for frontend display
            combined_raw = {
                "Closed":  avg_closed_p,
                "Open":    avg_open_p,
                "no_yawn": no_yawn_p,
                "yawn":    yawn_p,
            }
            total_prob = sum(combined_raw.values()) or 1.0
            norm_probs = {k: round(v / total_prob, 4) for k, v in combined_raw.items()}

            # 3. Decision logic:
            # - Yawn state: driver is yawning if yawn probability is high and exceeds eye closure
            if yawn_p >= 0.65 and yawn_p > avg_closed_p:
                raw_class = "yawn"
                confidence = float(norm_probs["yawn"])
            # - Eye closed state: driver has eyes closed only if Closed strictly exceeds Open and is significant
            elif avg_closed_p > avg_open_p and avg_closed_p >= 0.50:
                raw_class = "Closed"
                confidence = float(norm_probs["Closed"])
            # - Alert / Eyes open state: eyes are open
            else:
                raw_class = "Open"
                confidence = float(norm_probs["Open"])

            self._total_frames += 1

            # 4. Confidence gate + temporal smoothing
            now   = time.monotonic()
            alarm = False

            if confidence < self.confidence_threshold:
                self._reset_state(clear_history=True)
                final_class = "Uncertain"
                status      = "LOW CONFIDENCE"
                is_drowsy   = False
            else:
                final_class = self._smooth(raw_class)
                is_drowsy   = final_class in DROWSY_CLASSES

                if is_drowsy:
                    if self._drowsy_start is None:
                        self._drowsy_start = now
                    self._drowsy_frame_count += 1
                    elapsed = now - self._drowsy_start

                    if (
                        (
                            self._drowsy_frame_count >= self.drowsy_frame_limit
                            or elapsed >= self.alarm_time_seconds
                        )
                        and not self._alarm_active
                    ):
                        self._alarm_active = True
                        self._drowsy_events += 1
                        alarm = True

                    status = "DROWSY"
                else:
                    self._reset_state(clear_history=False)
                    status = "ALERT" if final_class in ALERT_CLASSES else "UNCERTAIN"

            self.last_prediction = final_class
            self.last_confidence = confidence
            self.last_status     = status

            elapsed_s = 0.0
            if self._drowsy_start is not None:
                elapsed_s = round(now - self._drowsy_start, 2)

            return {
                "success":                True,
                "prediction":             final_class,
                "raw_prediction":         raw_class,
                "confidence":             round(confidence * 100, 2),
                "confidence_decimal":     round(confidence, 4),
                "status":                 status,
                "is_drowsy":              is_drowsy,
                "alarm":                  alarm,
                "face_detected":          True,
                "drowsy_frame_count":     self._drowsy_frame_count,
                "drowsy_elapsed_seconds": elapsed_s,
                "total_frames":           self._total_frames,
                "drowsy_events":          self._drowsy_events,
                "probabilities":          norm_probs,
            }

    def reset_all(self) -> None:
        """Reset all counters and state (called from /api/reset endpoint)."""
        with self._lock:
            self._reset_state(clear_history=True)
            self._total_frames   = 0
            self._drowsy_events  = 0
            self.last_prediction = "Waiting"
            self.last_confidence = 0.0
            self.last_status     = "WAITING"

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _load_class_names(self, path: str | Path | None) -> list[str]:
        """Load class names from JSON; fall back to notebook defaults."""
        if path is not None:
            p = Path(path)
            if p.exists():
                try:
                    with open(p, encoding="utf-8") as f:
                        data = json.load(f)
                    if isinstance(data, list):
                        return [str(c).strip() for c in data]
                    if isinstance(data, dict):
                        # {"0": "Closed", "1": "Open", ...}
                        if all(str(k).isdigit() for k in data):
                            return [str(data[str(i)]).strip() for i in range(len(data))]
                        return [str(v).strip() for v in data.values()]
                except Exception:
                    pass
        return list(DEFAULT_CLASS_NAMES)

    def _detect_face(self, pil_image: Image.Image) -> tuple[Image.Image | None, np.ndarray | None, bool]:
        """
        Detect the largest frontal face in *pil_image* and return a padded crop.
        Returns: (face_pil, face_bgr, face_detected)
        """
        rgb = np.asarray(pil_image.convert("RGB"), dtype=np.uint8)
        bgr  = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)

        faces = self._face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=4,
            minSize=(50, 50),
            flags=cv2.CASCADE_SCALE_IMAGE,
        )

        if not isinstance(faces, np.ndarray) or len(faces) == 0:
            return None, None, False

        # Pick the largest face by area
        x, y, w, h = max(faces, key=lambda r: r[2] * r[3])

        # 15 % padding around the face
        pad  = int(0.15 * max(w, h))
        x1   = max(0, x - pad)
        y1   = max(0, y - pad)
        x2   = min(bgr.shape[1], x + w + pad)
        y2   = min(bgr.shape[0], y + h + pad)

        face_bgr = bgr[y1:y2, x1:x2]
        if face_bgr.size == 0:
            return None, None, False

        face_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
        return Image.fromarray(face_rgb), face_bgr, True

    def _extract_eye_crops(self, face_bgr: np.ndarray) -> list[np.ndarray]:
        """
        Extract eye crops from a detected face image.
        Uses OpenCV eye cascade with fallback to anatomical facial eye regions.
        """
        fh, fw = face_bgr.shape[:2]
        gray_face = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2GRAY)
        gray_face = cv2.equalizeHist(gray_face)

        # Upper region of face where eyes reside (18% to 58% of face height)
        y_start = int(fh * 0.18)
        y_end   = int(fh * 0.58)
        upper_gray = gray_face[y_start:y_end, :]

        detected_eyes = []
        if self._eye_cascade and not self._eye_cascade.empty():
            eyes = self._eye_cascade.detectMultiScale(
                upper_gray,
                scaleFactor=1.1,
                minNeighbors=3,
                minSize=(int(fw * 0.10), int(fh * 0.10)),
                maxSize=(int(fw * 0.50), int(fh * 0.45)),
            )
            if isinstance(eyes, np.ndarray) and len(eyes) > 0:
                for (ex, ey, ew, eh) in eyes[:2]:
                    pad_w = int(ew * 0.15)
                    pad_h = int(eh * 0.15)
                    ey1 = max(0, y_start + ey - pad_h)
                    ey2 = min(fh, y_start + ey + eh + pad_h)
                    ex1 = max(0, ex - pad_w)
                    ex2 = min(fw, ex + ew + pad_w)
                    crop = face_bgr[ey1:ey2, ex1:ex2]
                    if crop.size > 0:
                        detected_eyes.append(crop)

        if len(detected_eyes) > 0:
            return detected_eyes

        # Fallback to anatomical left & right eye regions
        left_eye  = face_bgr[int(fh * 0.20) : int(fh * 0.52), int(fw * 0.12) : int(fw * 0.50)]
        right_eye = face_bgr[int(fh * 0.20) : int(fh * 0.52), int(fw * 0.50) : int(fw * 0.88)]
        crops = []
        if left_eye.size > 0:
            crops.append(left_eye)
        if right_eye.size > 0:
            crops.append(right_eye)
        return crops

    def _preprocess(self, image: Image.Image) -> np.ndarray:
        """
        Resize to 224×224, convert to float32 [0, 255].
        The .keras model contains a built-in Rescaling(1/127.5, -1) layer
        that maps [0,255] → [-1,1] internally (MobileNetV2 requirement).
        We must NOT pre-divide by 127.5 here — the model does it.

        From notebook cell predict_image():
            image.resize((IMAGE_SIZE, IMAGE_SIZE), BILINEAR)
            image_array = np.asarray(image, dtype=np.float32)
            batch = np.expand_dims(image_array, axis=0)
            probabilities = model.predict(batch, verbose=0)[0]
        """
        img = image.convert("RGB").resize(
            (IMAGE_SIZE, IMAGE_SIZE), Image.Resampling.BILINEAR
        )
        arr = np.asarray(img, dtype=np.float32)          # (224, 224, 3) [0-255]
        return np.expand_dims(arr, axis=0)               # (1, 224, 224, 3)

    @staticmethod
    def _normalise_probs(probs: np.ndarray) -> np.ndarray:
        """Ensure probabilities are valid; apply softmax if needed."""
        if (
            np.any(probs < 0)
            or np.any(probs > 1)
            or not np.isclose(float(np.sum(probs)), 1.0, atol=0.05)
        ):
            shifted = probs - float(np.max(probs))
            exp_v   = np.exp(shifted)
            probs   = exp_v / np.sum(exp_v)
        return probs

    def _smooth(self, raw_class: str) -> str:
        """Majority-vote smoothing over the recent prediction window."""
        self._history.append(raw_class)
        if len(self._history) < 2:
            return raw_class
        counts: dict[str, int] = {}
        for item in self._history:
            counts[item] = counts.get(item, 0) + 1
        return max(counts, key=counts.get)  # type: ignore[arg-type]

    def _reset_state(self, *, clear_history: bool) -> None:
        if clear_history:
            self._history.clear()
        self._drowsy_frame_count = 0
        self._drowsy_start       = None
        self._alarm_active       = False

    def _no_face_result(self) -> dict:
        return {
            "success":                True,
            "prediction":             "No Face",
            "raw_prediction":         "No Face",
            "confidence":             0.0,
            "confidence_decimal":     0.0,
            "status":                 "NO FACE",
            "is_drowsy":              False,
            "alarm":                  False,
            "face_detected":          False,
            "drowsy_frame_count":     0,
            "drowsy_elapsed_seconds": 0.0,
            "total_frames":           self._total_frames,
            "drowsy_events":          self._drowsy_events,
            "probabilities":          {c: 0.0 for c in self.class_names},
        }
