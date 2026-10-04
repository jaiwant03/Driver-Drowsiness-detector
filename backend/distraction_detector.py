"""
Driver Distraction Detector using trained ResNet-18 PyTorch model.
Monitors driver behaviors (safe driving vs phone, texting, radio, drinking, etc.).
"""

from pathlib import Path
from collections import deque, Counter
import threading
import time
import numpy as np
from PIL import Image
import torch

try:
    from .resnet import ResNet18
except ImportError:
    from resnet import ResNet18


class DistractionDetector:
    def __init__(
        self,
        model_path: Path,
        confidence_threshold: float = 0.50,
        smoothing_window: int = 5,
        distracted_frame_limit: int = 12,
        alarm_time_seconds: float = 2.0,
        device: str = None,
    ):
        self.model_path = Path(model_path)
        self.confidence_threshold = confidence_threshold
        self.smoothing_window = smoothing_window
        self.distracted_frame_limit = distracted_frame_limit
        self.alarm_time_seconds = alarm_time_seconds

        if device is None:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = torch.device(device)

        self.lock = threading.Lock()
        self.prediction_history = deque(maxlen=smoothing_window)

        self.distracted_frame_count = 0
        self.distracted_start_time = None
        self.alarm_active = False

        self.total_frames = 0
        self.distracted_events = 0

        self.last_prediction = "Waiting"
        self.last_raw_prediction = "Waiting"
        self.last_confidence = 0.0
        self.last_status = "WAITING"

        # ImageNet normalization constants as used during training
        self.mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        self.std = np.array([0.229, 0.224, 0.225], dtype=np.float32)

        # Load checkpoint
        if not self.model_path.exists():
            raise FileNotFoundError(f"Distraction model not found at {self.model_path}")

        print(f"[Distraction] Loading checkpoint from: {self.model_path} onto {self.device}")
        checkpoint = torch.load(self.model_path, map_location=self.device)

        if isinstance(checkpoint, dict) and "class_names" in checkpoint:
            self.class_names = [str(c).strip() for c in checkpoint["class_names"]]
            self.num_classes = checkpoint.get("num_classes", len(self.class_names))
            state_dict = checkpoint.get("model_state_dict", checkpoint)
        else:
            # Fallback default classes for State Farm Distracted Driver dataset
            self.class_names = [
                "Safe Driving",
                "Texting - Right Hand",
                "Phone Call - Right Hand",
                "Texting - Left Hand",
                "Phone Call - Left Hand",
                "Operating Radio",
                "Drinking",
                "Reaching Behind",
                "Hair / Makeup",
                "Talking to Passenger"
            ]
            self.num_classes = len(self.class_names)
            state_dict = checkpoint

        # Instantiate pure PyTorch ResNet18
        self.model = ResNet18(num_classes=self.num_classes)
        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()

        print(f"[Distraction] ResNet-18 loaded successfully with {self.num_classes} classes.")
        print(f"[Distraction] Classes: {self.class_names}")

    def preprocess_image(self, image: Image.Image) -> torch.Tensor:
        """
        Preprocess full camera frame as done in training:
        1. Convert to RGB
        2. Resize to 224x224
        3. Convert to float32 [0.0, 1.0]
        4. Normalize with ImageNet mean and std
        5. Convert to PyTorch tensor shape (1, 3, 224, 224)
        """
        img = image.convert("RGB").resize((224, 224), Image.Resampling.BILINEAR)
        arr = np.asarray(img, dtype=np.float32) / 255.0
        arr = (arr - self.mean) / self.std
        tensor = torch.from_numpy(arr.transpose((2, 0, 1))).unsqueeze(0).to(self.device)
        return tensor

    def smooth_prediction(self, class_id: int) -> int:
        self.prediction_history.append(class_id)
        if len(self.prediction_history) < 2:
            return class_id
        counts = Counter(self.prediction_history)
        dominant, count = counts.most_common(1)[0]
        return dominant

    def reset_state(self, clear_history: bool = True):
        with self.lock:
            if clear_history:
                self.prediction_history.clear()
            self.distracted_frame_count = 0
            self.distracted_start_time = None
            self.alarm_active = False

    def reset_all(self):
        with self.lock:
            self.reset_state(clear_history=True)
            self.total_frames = 0
            self.distracted_events = 0
            self.last_prediction = "Waiting"
            self.last_raw_prediction = "Waiting"
            self.last_confidence = 0.0
            self.last_status = "WAITING"

    def predict(self, pil_image: Image.Image) -> dict:
        with self.lock:
            tensor = self.preprocess_image(pil_image)

            with torch.no_grad():
                outputs = self.model(tensor)
                probs_tensor = torch.softmax(outputs, dim=1)[0]
                probabilities = probs_tensor.cpu().numpy()

            predicted_idx = int(np.argmax(probabilities))
            raw_prediction = self.class_names[predicted_idx]
            confidence = float(probabilities[predicted_idx])

            self.total_frames += 1
            current_time = time.monotonic()
            alarm = False

            if confidence < self.confidence_threshold:
                self.reset_state(clear_history=True)
                final_class_idx = -1
                final_prediction = "Uncertain"
                status = "UNCERTAIN"
                is_distracted = False
            else:
                final_class_idx = self.smooth_prediction(predicted_idx)
                final_prediction = self.class_names[final_class_idx]

                # Class 0 is "Safe Driving". Any class > 0 is a distraction.
                is_distracted = (final_class_idx != 0)

                if is_distracted:
                    if self.distracted_start_time is None:
                        self.distracted_start_time = current_time
                    self.distracted_frame_count += 1
                    elapsed = current_time - self.distracted_start_time

                    if (
                        self.distracted_frame_count >= self.distracted_frame_limit
                        or elapsed >= self.alarm_time_seconds
                    ) and not self.alarm_active:
                        self.alarm_active = True
                        self.distracted_events += 1
                        alarm = True

                    status = "DISTRACTED"
                else:
                    self.reset_state(clear_history=False)
                    status = "NOT DISTRACTED"

            self.last_prediction = final_prediction
            self.last_raw_prediction = raw_prediction
            self.last_confidence = confidence
            self.last_status = status

            elapsed_seconds = 0.0
            if self.distracted_start_time is not None:
                elapsed_seconds = round(time.monotonic() - self.distracted_start_time, 2)

            # Top 3 predictions
            top3_indices = np.argsort(probabilities)[::-1][:3]
            top_classes = [
                {
                    "rank": i + 1,
                    "class_name": self.class_names[idx],
                    "class_id": int(idx),
                    "confidence": round(float(probabilities[idx]) * 100, 2),
                    "confidence_decimal": round(float(probabilities[idx]), 4),
                }
                for i, idx in enumerate(top3_indices)
            ]

            prob_dict = {
                self.class_names[i]: round(float(probabilities[i]), 4)
                for i in range(len(self.class_names))
            }

            return {
                "success": True,
                "prediction": final_prediction,
                "raw_prediction": raw_prediction,
                "class_id": final_class_idx,
                "confidence": round(confidence * 100, 2),
                "confidence_decimal": round(confidence, 4),
                "status": status,
                "is_distracted": is_distracted,
                "alarm": alarm,
                "distracted_frame_count": self.distracted_frame_count,
                "distracted_elapsed_seconds": elapsed_seconds,
                "total_frames": self.total_frames,
                "distracted_events": self.distracted_events,
                "top_classes": top_classes,
                "probabilities": prob_dict,
            }
