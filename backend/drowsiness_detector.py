"""
Driver Drowsiness Detector using trained Keras MobileNetV2 model.
Analyzes driver facial features (eyes, mouth) to identify drowsy states.
"""

from pathlib import Path
from collections import deque
import threading
import json
import time
import cv2
import numpy as np
from PIL import Image
import keras


class DrowsinessDetector:
    def __init__(
        self,
        model_path: Path,
        class_names_path: Path = None,
        confidence_threshold: float = 0.40,
        smoothing_window: int = 5,
        drowsy_frame_limit: int = 12,
        alarm_time_seconds: float = 2.0,
    ):
        self.model_path = Path(model_path)
        self.confidence_threshold = confidence_threshold
        self.smoothing_window = smoothing_window
        self.drowsy_frame_limit = drowsy_frame_limit
        self.alarm_time_seconds = alarm_time_seconds

        self.drowsy_classes = {"Closed", "yawn"}
        self.alert_classes = {"Open", "no_yawn"}

        self.lock = threading.Lock()
        self.prediction_history = deque(maxlen=smoothing_window)

        self.drowsy_frame_count = 0
        self.drowsy_start_time = None
        self.alarm_active = False

        self.total_frames = 0
        self.drowsy_events = 0

        self.last_prediction = "Waiting"
        self.last_raw_prediction = "Waiting"
        self.last_confidence = 0.0
        self.last_status = "WAITING"

        # Load class names
        self.class_names = self._load_class_names(class_names_path)

        # Load Haar cascade face detector
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_detector = cv2.CascadeClassifier(cascade_path)
        if self.face_detector.empty():
            raise RuntimeError(f"Could not load OpenCV face cascade from {cascade_path}")

        # Load Keras model
        if not self.model_path.exists():
            raise FileNotFoundError(f"Drowsiness model not found at {self.model_path}")

        print(f"[Drowsiness] Loading model from: {self.model_path}")
        self.model = keras.models.load_model(self.model_path, compile=False)
        print(f"[Drowsiness] Model loaded. Input: {self.model.input_shape}, Output: {self.model.output_shape}")

        expected_count = int(self.model.output_shape[-1])
        if expected_count != len(self.class_names):
            print(f"[Drowsiness] Warning: Output count {expected_count} != class count {len(self.class_names)}")

    def _load_class_names(self, class_names_path):
        default_classes = ["Closed", "Open", "no_yawn", "yawn"]
        if class_names_path and Path(class_names_path).exists():
            try:
                with open(class_names_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if isinstance(data, list):
                    return [str(c).strip() for c in data]
                elif isinstance(data, dict):
                    if all(str(k).isdigit() for k in data.keys()):
                        return [str(data[str(i)]).strip() for i in range(len(data))]
                    return [str(v).strip() for v in data.values()]
            except Exception as e:
                print(f"[Drowsiness] Could not parse class_names.json: {e}")
        return default_classes

    def detect_face(self, pil_image: Image.Image):
        """
        Detect the largest frontal face and return a padded crop.
        Returns: (face_crop_pil, True) or (None, False)
        """
        rgb_arr = np.asarray(pil_image.convert("RGB"))
        frame = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)

        faces = self.face_detector.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=4,
            minSize=(50, 50)
        )

        if len(faces) == 0:
            return None, False

        # Pick largest face
        x, y, w, h = max(faces, key=lambda r: r[2] * r[3])

        # Add 15% margin
        padding = int(0.15 * max(w, h))
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(frame.shape[1], x + w + padding)
        y2 = min(frame.shape[0], y + h + padding)

        face_bgr = frame[y1:y2, x1:x2]
        if face_bgr.size == 0:
            return None, False

        face_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
        return Image.fromarray(face_rgb), True

    def preprocess_image(self, image: Image.Image) -> np.ndarray:
        """
        Resize to 224x224 RGB and cast to float32 in range [0, 255].
        (MobileNetV2 has built-in Rescaling layer in best_finetuned.keras)
        """
        img = image.convert("RGB").resize((224, 224), Image.Resampling.BILINEAR)
        arr = np.asarray(img, dtype=np.float32)
        return np.expand_dims(arr, axis=0)

    def smooth_prediction(self, raw_pred: str) -> str:
        self.prediction_history.append(raw_pred)
        if len(self.prediction_history) < 2:
            return raw_pred
        counts = {}
        for item in self.prediction_history:
            counts[item] = counts.get(item, 0) + 1
        return max(counts, key=counts.get)

    def reset_state(self, clear_history: bool = True):
        with self.lock:
            if clear_history:
                self.prediction_history.clear()
            self.drowsy_frame_count = 0
            self.drowsy_start_time = None
            self.alarm_active = False

    def reset_all(self):
        with self.lock:
            self.reset_state(clear_history=True)
            self.total_frames = 0
            self.drowsy_events = 0
            self.last_prediction = "Waiting"
            self.last_raw_prediction = "Waiting"
            self.last_confidence = 0.0
            self.last_status = "WAITING"

    def predict(self, pil_image: Image.Image) -> dict:
        with self.lock:
            # 1. Face detection
            face_img, face_detected = self.detect_face(pil_image)

            if not face_detected:
                # If no face is detected, we do not increment drowsy counters
                self.reset_state(clear_history=True)
                self.last_prediction = "No Face"
                self.last_raw_prediction = "No Face"
                self.last_confidence = 0.0
                self.last_status = "NO FACE"

                return {
                    "success": True,
                    "prediction": "No Face",
                    "raw_prediction": "No Face",
                    "confidence": 0.0,
                    "confidence_decimal": 0.0,
                    "status": "NO FACE",
                    "is_drowsy": False,
                    "alarm": False,
                    "face_detected": False,
                    "drowsy_frame_count": 0,
                    "drowsy_elapsed_seconds": 0.0,
                    "total_frames": self.total_frames,
                    "drowsy_events": self.drowsy_events,
                    "probabilities": {cls: 0.0 for cls in self.class_names},
                }

            # 2. Model inference
            input_tensor = self.preprocess_image(face_img)
            predictions = self.model.predict(input_tensor, verbose=0).squeeze()

            # Ensure 1D probabilities array
            predictions = np.asarray(predictions, dtype=np.float32)
            prob_sum = float(np.sum(predictions))
            if np.any(predictions < 0) or np.any(predictions > 1) or not np.isclose(prob_sum, 1.0, atol=0.02):
                shifted = predictions - np.max(predictions)
                exp_v = np.exp(shifted)
                predictions = exp_v / np.sum(exp_v)

            pred_idx = int(np.argmax(predictions))
            raw_prediction = self.class_names[pred_idx]
            confidence = float(predictions[pred_idx])

            self.total_frames += 1

            # 3. Confidence threshold & Temporal smoothing
            current_time = time.monotonic()
            alarm = False

            if confidence < self.confidence_threshold:
                self.reset_state(clear_history=True)
                final_prediction = "Uncertain"
                status = "LOW CONFIDENCE"
                is_drowsy = False
            else:
                final_prediction = self.smooth_prediction(raw_prediction)
                is_drowsy = final_prediction in self.drowsy_classes

                if is_drowsy:
                    if self.drowsy_start_time is None:
                        self.drowsy_start_time = current_time
                    self.drowsy_frame_count += 1
                    elapsed = current_time - self.drowsy_start_time

                    if (
                        self.drowsy_frame_count >= self.drowsy_frame_limit
                        or elapsed >= self.alarm_time_seconds
                    ) and not self.alarm_active:
                        self.alarm_active = True
                        self.drowsy_events += 1
                        alarm = True

                    status = "DROWSY"
                else:
                    self.reset_state(clear_history=False)
                    status = "ALERT" if final_prediction in self.alert_classes else "UNCERTAIN"

            self.last_prediction = final_prediction
            self.last_raw_prediction = raw_prediction
            self.last_confidence = confidence
            self.last_status = status

            elapsed_seconds = 0.0
            if self.drowsy_start_time is not None:
                elapsed_seconds = round(time.monotonic() - self.drowsy_start_time, 2)

            prob_dict = {
                self.class_names[i]: round(float(predictions[i]), 4)
                for i in range(len(self.class_names))
            }

            return {
                "success": True,
                "prediction": final_prediction,
                "raw_prediction": raw_prediction,
                "confidence": round(confidence * 100, 2),
                "confidence_decimal": round(confidence, 4),
                "status": status,
                "is_drowsy": is_drowsy,
                "alarm": alarm,
                "face_detected": True,
                "drowsy_frame_count": self.drowsy_frame_count,
                "drowsy_elapsed_seconds": elapsed_seconds,
                "total_frames": self.total_frames,
                "drowsy_events": self.drowsy_events,
                "probabilities": prob_dict,
            }
