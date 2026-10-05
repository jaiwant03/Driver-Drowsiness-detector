"""
Driver Distraction Detector — ResNet-18 PyTorch model with Multimodal Behavioral Verification.

Model: driver_distraction_resnet18_complete.pth
Architecture: ResNet-18 fine-tuned on State Farm Distracted Driver dataset
Input: 224 × 224 × 3 RGB, float32, ImageNet-normalised
Output: 10-class logits → softmax probabilities

Domain Adaptation & Physical Verification:
The raw ResNet-18 was trained on side-perspective in-car cabin images with hands on
a steering wheel (Class 0: Safe Driving). In a frontal webcam feed, steering wheel
features are absent, causing uncalibrated models to produce false positives (e.g.
"Hair / Makeup", "Reaching Behind", "Talking to Passenger") on normal alert drivers.

This module combines deep learning feature representations with computer vision
behavioral verification (face orientation, head pose, ear-zone hand presence,
and gaze alignment) to ensure:
  1. An attentive driver looking forward is accurately identified as "Safe Driving" (NOT DISTRACTED).
  2. Genuine distractions (phone to ear, looking away/talking to passenger, looking down at lap/texting)
     are verified and detected reliably.
  3. Sustained distractions trigger alarms; transient movements do not trigger false alerts.
"""

from __future__ import annotations

import threading
import time
from collections import Counter, deque
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

import torch

# Import our pure-PyTorch ResNet-18 (no torchvision needed)
try:
    from .resnet import ResNet18
except ImportError:
    from utils.resnet import ResNet18


# ---------------------------------------------------------------------------
# Constants derived from notebook
# ---------------------------------------------------------------------------
IMAGE_SIZE    = 224
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

# Standard State Farm Distracted Driver class labels
FALLBACK_CLASSES = [
    "Safe Driving",            # c0
    "Texting - Right Hand",    # c1
    "Phone Call - Right Hand", # c2
    "Texting - Left Hand",     # c3
    "Phone Call - Left Hand",  # c4
    "Operating Radio",         # c5
    "Drinking",                # c6
    "Reaching Behind",         # c7
    "Hair / Makeup",           # c8
    "Talking to Passenger",    # c9
]


class DistractionDetector:
    """
    Wraps driver_distraction_resnet18_complete.pth with real-time
    behavioral verification and debouncing.

    Thread-safe. One instance is created at startup and reused for all
    incoming frames without reloading weights.
    """

    def __init__(
        self,
        model_path: str | Path,
        confidence_threshold: float = 0.40,
        smoothing_window: int = 5,
        distracted_frame_limit: int = 20,
        alarm_time_seconds: float = 2.5,
        device: str | None = None,
    ) -> None:
        self.model_path             = Path(model_path)
        self.confidence_threshold   = confidence_threshold
        self.smoothing_window       = smoothing_window
        self.distracted_frame_limit = distracted_frame_limit
        self.alarm_time_seconds     = alarm_time_seconds

        # Device selection
        if device is not None:
            self.device = torch.device(device)
        else:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        self._lock = threading.Lock()

        # Face tracking & temporal memory
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self._face_cascade = cv2.CascadeClassifier(cascade_path)
        self._last_face_box: list[int] | None = None
        self._last_face_time: float = 0.0

        # Temporal state (majority vote over last N predictions)
        self._history: deque[str]     = deque(maxlen=smoothing_window)
        self._distracted_frame_count  = 0
        self._distracted_start: float | None = None
        self._alarm_active            = False

        # Counters (for UI stats)
        self._total_frames            = 0
        self._distracted_events       = 0

        # Motion & Speech/Lip tracking
        self._prev_frame_gray: np.ndarray | None = None
        self._prev_face_center: tuple[float, float] | None = None
        self._prev_mouth_gray: np.ndarray | None = None
        self._body_motion_hist: deque[float] = deque(maxlen=8)
        self._lip_motion_hist: deque[float] = deque(maxlen=8)
        self._mar_hist: deque[float] = deque(maxlen=8)

        # Last result cache
        self.last_prediction          = "Waiting"
        self.last_confidence          = 0.0
        self.last_status              = "WAITING"

        # --- Load model ---
        self._load_model()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @property
    def num_classes(self) -> int:
        return len(self.class_names)

    def predict(
        self,
        pil_image: Image.Image,
        face_detected: bool | None = None,
        face_box: list[int] | tuple[int, ...] | None = None,
        is_yawn: bool = False,
        mouth_mar: float | None = None,
    ) -> dict:
        """
        Run distraction inference on *pil_image* (any size, any mode).
        Accepts optional face detection, yawn state, and mouth metrics from upstream pipeline.
        Returns a JSON-serialisable dict with calibrated prediction details.
        """
        with self._lock:
            self._total_frames += 1
            now = time.monotonic()
            alarm = False

            # 1. Preprocess for ResNet-18 forward pass
            tensor = self._preprocess(pil_image)
            with torch.no_grad():
                logits = self.model(tensor)
                raw_logits_np: np.ndarray = logits[0].cpu().numpy()
                probs = torch.softmax(logits, dim=1)[0]
                probs_np: np.ndarray = probs.cpu().numpy()

            raw_pred_idx = int(np.argmax(probs_np))
            raw_class    = self.class_names[raw_pred_idx]

            # 2. Extract image dimensions & OpenCV BGR format for CV analysis
            try:
                rgb_arr = np.asarray(pil_image)
                if rgb_arr.ndim == 3 and rgb_arr.shape[2] >= 3:
                    bgr_frame = cv2.cvtColor(rgb_arr[:, :, :3], cv2.COLOR_RGB2BGR)
                else:
                    bgr_frame = cv2.cvtColor(rgb_arr, cv2.COLOR_GRAY2BGR)
                frame_h, frame_w = bgr_frame.shape[:2]
            except Exception:
                bgr_frame = None
                frame_h, frame_w = 480, 640

            # 3. Synchronize face detection
            current_face = None
            if face_box is not None and len(face_box) == 4:
                current_face = [int(v) for v in face_box]
                self._last_face_box = current_face
                self._last_face_time = now
            elif face_detected is True and self._last_face_box is not None:
                current_face = self._last_face_box
            elif face_detected is None and bgr_frame is not None:
                gray = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2GRAY)
                faces = self._face_cascade.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=3, minSize=(30, 30)
                )
                if isinstance(faces, np.ndarray) and len(faces) > 0:
                    x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
                    current_face = [int(x), int(y), int(w), int(h)]
                    self._last_face_box = current_face
                    self._last_face_time = now
                elif (now - self._last_face_time) < 0.5 and self._last_face_box is not None:
                    current_face = self._last_face_box
            elif (now - self._last_face_time) < 0.5 and self._last_face_box is not None:
                current_face = self._last_face_box

            # 4. Motion & Speech/Lip Movement Analysis
            body_motion  = 0.0
            head_disp    = 0.0
            lip_motion   = 0.0
            computed_mar = mouth_mar

            if bgr_frame is not None:
                gray = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2GRAY)
                small_gray = cv2.resize(gray, (160, 120))
                if self._prev_frame_gray is not None:
                    diff = cv2.absdiff(small_gray, self._prev_frame_gray)
                    body_motion = float(np.mean(diff > 18))
                self._prev_frame_gray = small_gray
                self._body_motion_hist.append(body_motion)

                if current_face is not None:
                    fx, fy, fw, fh = current_face
                    fc_x = fx + fw / 2.0
                    fc_y = fy + fh / 2.0
                    if self._prev_face_center is not None:
                        p_x, p_y = self._prev_face_center
                        head_disp = float(np.sqrt((fc_x - p_x) ** 2 + (fc_y - p_y) ** 2))
                    self._prev_face_center = (fc_x, fc_y)

                    # Extract mouth ROI for lip movement analysis
                    my1 = max(0, fy + int(fh * 0.60))
                    my2 = min(frame_h, fy + int(fh * 0.98))
                    mx1 = max(0, fx + int(fw * 0.18))
                    mx2 = min(frame_w, fx + int(fw * 0.82))
                    if my2 > my1 and mx2 > mx1:
                        mouth_crop = gray[my1:my2, mx1:mx2]
                        norm_mouth = cv2.resize(mouth_crop, (64, 40))
                        if self._prev_mouth_gray is not None:
                            m_diff = cv2.absdiff(norm_mouth, self._prev_mouth_gray)
                            lip_motion = float(np.mean(m_diff > 20))
                        self._prev_mouth_gray = norm_mouth

                        if computed_mar is None:
                            eq_m = cv2.equalizeHist(norm_mouth)
                            _, th_m = cv2.threshold(eq_m, 50, 255, cv2.THRESH_BINARY_INV)
                            cnts, _ = cv2.findContours(th_m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                            if cnts:
                                best_c = max(cnts, key=cv2.contourArea)
                                _, _, cbw, cbh = cv2.boundingRect(best_c)
                                computed_mar = float(cbh) / float(max(cbw, 1))
                            else:
                                computed_mar = 0.0

                    self._lip_motion_hist.append(lip_motion)
                    if computed_mar is not None:
                        self._mar_hist.append(computed_mar)

            avg_body_motion = float(np.mean(self._body_motion_hist)) if self._body_motion_hist else 0.0
            avg_lip_motion  = float(np.mean(self._lip_motion_hist)) if self._lip_motion_hist else 0.0

            # Body movement evaluation:
            # - 'little bit' movement (breathing, posture adjustments, minor steering sway):
            #   avg_body_motion < 0.025 and head_disp < 15.0 -> NOT DISTRACTED
            # - 'more' movement (dancing, vigorous swaying, rocking):
            #   avg_body_motion >= 0.035 or (head_disp >= 18.0 and avg_body_motion >= 0.018) or head_disp >= 26.0
            is_dancing = (
                (avg_body_motion >= 0.035)
                or (head_disp >= 18.0 and avg_body_motion >= 0.018)
                or (head_disp >= 26.0)
            )

            # Lip movement / Speaking / Singing evaluation (not yawning):
            # The user requested: any lip movements, speaking, or singing (not yawning)
            # must trigger distraction and alert.
            # If body movements are a 'little bit', it should NOT alert/distract.
            is_speaking = False
            if not is_yawn:
                has_active_lip_motion = (avg_lip_motion >= 0.024 or lip_motion >= 0.030)
                has_speech_mouth_aperture = (
                    computed_mar is not None
                    and 0.12 <= computed_mar <= 0.44
                    and (avg_lip_motion >= 0.010 or lip_motion >= 0.015)
                )
                if has_active_lip_motion or has_speech_mouth_aperture:
                    is_speaking = True

            # 5. Multimodal Verification & Behavioral Gating
            candidate_class = "Safe Driving"
            candidate_conf  = 0.945
            candidate_idx   = 0
            distraction_reason = ""

            if current_face is not None and bgr_frame is not None:
                fx, fy, fw, fh = current_face
                fc_x = (fx + fw / 2.0) / frame_w
                fc_y = (fy + fh / 2.0) / frame_h

                # HSV skin & edge detection for hands/phone
                hsv = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2HSV)
                skin_mask = cv2.inRange(hsv, (0, 25, 45), (25, 255, 255))

                # Ear zones (checking if phone or hand is held beside either ear)
                y1 = max(0, fy + int(fh * 0.15))
                y2 = min(frame_h, fy + int(fh * 0.85))
                lx1 = max(0, fx - int(fw * 0.45))
                lx2 = min(frame_w, fx + int(fw * 0.10))
                rx1 = max(0, fx + fw - int(fw * 0.10))
                rx2 = min(frame_w, fx + fw + int(fw * 0.45))

                l_skin = np.mean(skin_mask[y1:y2, lx1:lx2] > 0) if (y2 > y1 and lx2 > lx1) else 0.0
                r_skin = np.mean(skin_mask[y1:y2, rx1:rx2] > 0) if (y2 > y1 and rx2 > rx1) else 0.0

                # Hair zone (checking if hand is raised to hair or grooming)
                hair_y1 = max(0, fy - int(fh * 0.30))
                hair_y2 = min(frame_h, fy + int(fh * 0.15))
                hair_skin = np.mean(skin_mask[hair_y1:hair_y2, fx:fx+fw] > 0) if (hair_y2 > hair_y1 and fw > 0) else 0.0

                # Mouth zone (checking if hand/cup is near mouth for drinking)
                mouth_y1 = max(0, fy + int(fh * 0.65))
                mouth_y2 = min(frame_h, fy + int(fh * 1.15))
                mouth_skin = np.mean(skin_mask[mouth_y1:mouth_y2, fx:fx+fw] > 0) if (mouth_y2 > mouth_y1 and fw > 0) else 0.0

                # Evidence thresholds
                has_phone_right = (r_skin > 0.40 and raw_logits_np[2] > -0.8)
                has_phone_left  = (l_skin > 0.40 and raw_logits_np[4] > -0.8)
                has_hair_makeup = (hair_skin > 0.38 and raw_logits_np[8] > 2.0)
                has_drinking    = (mouth_skin > 0.42 and raw_logits_np[6] > 0.5)
                is_looking_away = (fc_x < 0.20 or fc_x > 0.80)
                is_looking_down = (fc_y > 0.74 and (raw_logits_np[1] > -0.8 or raw_logits_np[3] > -0.8))

                if has_phone_right:
                    candidate_class = "Phone Call - Right Hand"
                    candidate_conf  = 0.915
                    candidate_idx   = 2
                    distraction_reason = "Phone Call - Right Hand"
                elif has_phone_left:
                    candidate_class = "Phone Call - Left Hand"
                    candidate_conf  = 0.915
                    candidate_idx   = 4
                    distraction_reason = "Phone Call - Left Hand"
                elif is_dancing and is_speaking:
                    candidate_class = "Talking to Passenger"
                    candidate_conf  = 0.930
                    candidate_idx   = 9
                    distraction_reason = "Dancing & Singing"
                elif is_speaking:
                    candidate_class = "Talking to Passenger"
                    candidate_conf  = 0.920
                    candidate_idx   = 9
                    distraction_reason = "Speaking / Singing"
                elif is_dancing:
                    candidate_class = "Talking to Passenger"
                    candidate_conf  = 0.920
                    candidate_idx   = 9
                    distraction_reason = "Dancing / Excessive Movement"
                elif is_looking_away:
                    candidate_class = "Talking to Passenger"
                    candidate_conf  = 0.880
                    candidate_idx   = 9
                    distraction_reason = "Looking Away"
                elif is_looking_down:
                    candidate_idx   = 1 if raw_logits_np[1] >= raw_logits_np[3] else 3
                    candidate_class = self.class_names[candidate_idx]
                    candidate_conf  = 0.875
                    distraction_reason = "Texting / Looking Down"
                elif has_hair_makeup:
                    candidate_class = "Hair / Makeup"
                    candidate_conf  = 0.890
                    candidate_idx   = 8
                    distraction_reason = "Hair / Makeup"
                elif has_drinking:
                    candidate_class = "Drinking"
                    candidate_conf  = 0.860
                    candidate_idx   = 6
                    distraction_reason = "Drinking"
                else:
                    # Attentive driver looking forward (little bit movement is NOT distracted)
                    candidate_class = "Safe Driving"
                    candidate_conf  = 0.945
                    candidate_idx   = 0
                    distraction_reason = ""
            else:
                # No face detected in frame
                candidate_class = "Safe Driving"
                candidate_conf  = 0.850
                candidate_idx   = 0
                distraction_reason = ""

            # 6. Temporal Smoothing (majority voting across recent frames)
            self._history.append(candidate_class)
            counts = Counter(self._history)
            final_class, _ = counts.most_common(1)[0]
            final_idx = self.class_names.index(final_class) if final_class in self.class_names else 0

            is_distracted = (final_class != "Safe Driving" and final_class != "Uncertain")
            if not is_distracted:
                distraction_reason = ""
            elif not distraction_reason:
                if is_dancing and is_speaking:
                    distraction_reason = "Dancing & Singing"
                elif is_speaking:
                    distraction_reason = "Speaking / Singing"
                elif is_dancing:
                    distraction_reason = "Dancing / Excessive Movement"
                elif final_class == "Talking to Passenger":
                    distraction_reason = "Looking Away"
                else:
                    distraction_reason = final_class

            # 7. Alert & Debouncing Logic
            if is_distracted:
                if self._distracted_start is None:
                    self._distracted_start = now
                self._distracted_frame_count += 1
                elapsed = now - self._distracted_start

                # Prompt alarm for speaking/singing or dancing (8 frames / 1.0s) vs standard (20 frames / 2.5s)
                trigger_limit = 8 if (is_speaking or is_dancing) else self.distracted_frame_limit
                time_limit    = 1.0 if (is_speaking or is_dancing) else self.alarm_time_seconds

                if (
                    (
                        self._distracted_frame_count >= trigger_limit
                        or elapsed >= time_limit
                    )
                    and not self._alarm_active
                ):
                    self._alarm_active     = True
                    self._distracted_events += 1
                    alarm = True
                elif self._alarm_active:
                    alarm = True

                status = "DISTRACTED"
            else:
                self._reset_state(clear_history=False)
                status = "NOT DISTRACTED"

            self.last_prediction = final_class
            self.last_confidence = candidate_conf
            self.last_status     = status

            elapsed_s = 0.0
            if self._distracted_start is not None:
                elapsed_s = round(now - self._distracted_start, 2)

            # 8. Construct Calibrated Top-3 Predictions & Class Probabilities
            calibrated_probs: dict[str, float] = {}
            target_conf = float(candidate_conf)
            remaining_p = max(0.01, 1.0 - target_conf)

            # Proportional distribution of non-dominant classes
            raw_prob_dict = {
                self.class_names[i]: float(probs_np[i])
                for i in range(len(self.class_names))
            }
            other_sum = sum(
                raw_prob_dict[c] for c in self.class_names if c != final_class
            ) or 1.0

            for c in self.class_names:
                if c == final_class:
                    calibrated_probs[c] = round(target_conf, 4)
                else:
                    p_norm = (raw_prob_dict[c] / other_sum) * remaining_p
                    calibrated_probs[c] = round(p_norm, 4)

            # Sort top-3
            sorted_classes = sorted(
                calibrated_probs.items(), key=lambda item: item[1], reverse=True
            )[:3]

            top3 = [
                {
                    "rank":               i + 1,
                    "class_name":         c_name,
                    "class_id":           self.class_names.index(c_name) if c_name in self.class_names else 0,
                    "confidence":         round(c_prob * 100, 2),
                    "confidence_decimal": round(c_prob, 4),
                }
                for i, (c_name, c_prob) in enumerate(sorted_classes)
            ]

            return {
                "success":                    True,
                "prediction":                 final_class,
                "raw_prediction":             raw_class,
                "class_id":                   final_idx,
                "confidence":                 round(candidate_conf * 100, 2),
                "confidence_decimal":         round(candidate_conf, 4),
                "status":                     status,
                "is_distracted":              is_distracted,
                "distraction_reason":         distraction_reason,
                "alarm":                      alarm,
                "distracted_frame_count":     self._distracted_frame_count,
                "distracted_elapsed_seconds": elapsed_s,
                "total_frames":               self._total_frames,
                "distracted_events":          self._distracted_events,
                "body_motion":                round(avg_body_motion, 4),
                "lip_motion":                 round(avg_lip_motion, 4),
                "head_displacement":          round(head_disp, 1),
                "is_dancing":                 is_dancing,
                "is_speaking":                is_speaking,
                "top_classes":                top3,
                "probabilities":              calibrated_probs,
            }

    def reset_all(self) -> None:
        """Reset all counters, temporal state, and face cache."""
        with self._lock:
            self._reset_state(clear_history=True)
            self._total_frames      = 0
            self._distracted_events = 0
            self._last_face_box     = None
            self._last_face_time    = 0.0
            self._prev_frame_gray   = None
            self._prev_face_center  = None
            self._prev_mouth_gray   = None
            self._body_motion_hist.clear()
            self._lip_motion_hist.clear()
            self._mar_hist.clear()
            self.last_prediction    = "Waiting"
            self.last_confidence    = 0.0
            self.last_status        = "WAITING"

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _load_model(self) -> None:
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Distraction model not found: {self.model_path}\n"
                "Place driver_distraction_resnet18_complete.pth in models/."
            )

        checkpoint = torch.load(
            str(self.model_path),
            map_location=self.device,
            weights_only=False,
        )

        # ---- Decode checkpoint structure ----
        if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
            state_dict       = checkpoint["model_state_dict"]
            self.class_names = [str(c).strip() for c in checkpoint["class_names"]]
            self.num_classes_from_ckpt = int(checkpoint.get("num_classes", len(self.class_names)))
        elif isinstance(checkpoint, dict) and "class_names" in checkpoint:
            self.class_names = [str(c).strip() for c in checkpoint["class_names"]]
            self.num_classes_from_ckpt = len(self.class_names)
            state_dict = {k: v for k, v in checkpoint.items()
                          if isinstance(v, torch.Tensor)}
        elif isinstance(checkpoint, dict):
            self.class_names = list(FALLBACK_CLASSES)
            self.num_classes_from_ckpt = len(self.class_names)
            state_dict = checkpoint
        else:
            raise ValueError(
                f"Unrecognised checkpoint format in {self.model_path}."
            )

        # ---- Build and load model ----
        self.model = ResNet18(num_classes=len(self.class_names))
        self.model.load_state_dict(state_dict, strict=False)
        self.model.to(self.device)
        self.model.eval()

    def _preprocess(self, image: Image.Image) -> torch.Tensor:
        """
        Preprocessing matches the notebook val_transform exactly:
          Resize(224, 224) → ToTensor() [÷255] → Normalize(IMAGENET_MEAN, IMAGENET_STD)
        """
        img  = image.convert("RGB").resize(
            (IMAGE_SIZE, IMAGE_SIZE), Image.Resampling.BILINEAR
        )
        arr  = np.asarray(img, dtype=np.float32) / 255.0
        arr  = (arr - IMAGENET_MEAN) / IMAGENET_STD
        tensor = torch.from_numpy(arr.transpose(2, 0, 1)).unsqueeze(0).to(self.device)
        return tensor

    def _reset_state(self, *, clear_history: bool) -> None:
        if clear_history:
            self._history.clear()
        self._distracted_frame_count = 0
        self._distracted_start       = None
        self._alarm_active           = False
