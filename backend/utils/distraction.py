"""
Driver Distraction Detector — ResNet-18 PyTorch model.

Model: driver_distraction_resnet18_complete.pth
Architecture: ResNet-18 fine-tuned on State Farm Distracted Driver dataset
Input: 224 × 224 × 3  RGB,  float32,  ImageNet-normalised
Output: 10-class logits → softmax probabilities

Checkpoint format (from distraction notebook CELL 42 — SAVE COMPLETE MODEL):
  checkpoint = {
      "model_state_dict": model.state_dict(),
      "class_names":      CLASS_NAMES,        ← list of 10 strings
      "image_size":       IMAGE_SIZE,         ← 224
      "num_classes":      NUM_CLASSES,        ← 10
      "test_accuracy":    ...,
      "test_macro_f1":    ...,
      "best_validation_macro_f1": ...,
  }

Preprocessing (from notebook val_transform — inference transform):
  transforms.Resize((224, 224))
  transforms.ToTensor()              → [0.0, 1.0]
  transforms.Normalize(
      mean=[0.485, 0.456, 0.406],
      std =[0.229, 0.224, 0.225],
  )

Class 0 == "Safe Driving" (not distracted).
Classes 1-9 == distraction types (from the class_names saved in checkpoint).

Temporal smoothing: majority vote over last N predictions.
Alarm: triggered after M consecutive distracted frames OR T seconds.
"""

from __future__ import annotations

import threading
import time
from collections import Counter, deque
from pathlib import Path

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
IMAGE_SIZE   = 224
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32)

# Fallback class names if the checkpoint somehow lacks them
# (matches State Farm Distracted Driver dataset standard label order)
FALLBACK_CLASSES = [
    "Safe Driving",           # c0
    "Texting - Right Hand",   # c1
    "Phone Call - Right Hand",# c2
    "Texting - Left Hand",    # c3
    "Phone Call - Left Hand", # c4
    "Operating Radio",        # c5
    "Drinking",               # c6
    "Reaching Behind",        # c7
    "Hair / Makeup",          # c8
    "Talking to Passenger",   # c9
]


class DistractionDetector:
    """
    Wraps driver_distraction_resnet18_complete.pth for real-time
    distraction detection.

    Thread-safe. One instance is created at startup and reused for all
    incoming frames without reloading weights.
    """

    def __init__(
        self,
        model_path: str | Path,
        confidence_threshold: float = 0.45,
        smoothing_window: int = 5,
        distracted_frame_limit: int = 10,
        alarm_time_seconds: float = 2.0,
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

        # Temporal state
        self._history: deque[int]     = deque(maxlen=smoothing_window)
        self._distracted_frame_count  = 0
        self._distracted_start: float | None = None
        self._alarm_active            = False

        # Counters (for UI stats)
        self._total_frames            = 0
        self._distracted_events       = 0

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

    def predict(self, pil_image: Image.Image) -> dict:
        """
        Run distraction inference on *pil_image* (any size, any mode).
        Returns a JSON-serialisable dict with prediction details.
        """
        with self._lock:
            tensor = self._preprocess(pil_image)

            with torch.no_grad():
                logits = self.model(tensor)                        # (1, 10)
                probs  = torch.softmax(logits, dim=1)[0]           # (10,)
                probs_np: np.ndarray = probs.cpu().numpy()

            pred_idx    = int(np.argmax(probs_np))
            raw_class   = self.class_names[pred_idx]
            confidence  = float(probs_np[pred_idx])
            self._total_frames += 1
            now   = time.monotonic()
            alarm = False

            if confidence < self.confidence_threshold:
                self._reset_state(clear_history=True)
                final_idx   = -1
                final_class = "Uncertain"
                status      = "UNCERTAIN"
                is_distracted = False
            else:
                final_idx   = self._smooth(pred_idx)
                final_class = self.class_names[final_idx]
                # Class 0 = Safe Driving; any other class = distracted
                is_distracted = (final_idx != 0)

                if is_distracted:
                    if self._distracted_start is None:
                        self._distracted_start = now
                    self._distracted_frame_count += 1
                    elapsed = now - self._distracted_start

                    if (
                        (
                            self._distracted_frame_count >= self.distracted_frame_limit
                            or elapsed >= self.alarm_time_seconds
                        )
                        and not self._alarm_active
                    ):
                        self._alarm_active     = True
                        self._distracted_events += 1
                        alarm = True

                    status = "DISTRACTED"
                else:
                    self._reset_state(clear_history=False)
                    status = "NOT DISTRACTED"

            self.last_prediction = final_class
            self.last_confidence = confidence
            self.last_status     = status

            elapsed_s = 0.0
            if self._distracted_start is not None:
                elapsed_s = round(now - self._distracted_start, 2)

            # Top-3 predictions for the UI
            top3_idx = np.argsort(probs_np)[::-1][:3]
            top3 = [
                {
                    "rank":               i + 1,
                    "class_name":         self.class_names[int(idx)],
                    "class_id":           int(idx),
                    "confidence":         round(float(probs_np[idx]) * 100, 2),
                    "confidence_decimal": round(float(probs_np[idx]), 4),
                }
                for i, idx in enumerate(top3_idx)
            ]

            return {
                "success":                    True,
                "prediction":                 final_class,
                "raw_prediction":             raw_class,
                "class_id":                   final_idx,
                "confidence":                 round(confidence * 100, 2),
                "confidence_decimal":         round(confidence, 4),
                "status":                     status,
                "is_distracted":              is_distracted,
                "alarm":                      alarm,
                "distracted_frame_count":     self._distracted_frame_count,
                "distracted_elapsed_seconds": elapsed_s,
                "total_frames":               self._total_frames,
                "distracted_events":          self._distracted_events,
                "top_classes":                top3,
                "probabilities": {
                    self.class_names[i]: round(float(probs_np[i]), 4)
                    for i in range(len(self.class_names))
                },
            }

    def reset_all(self) -> None:
        """Reset all counters and temporal state."""
        with self._lock:
            self._reset_state(clear_history=True)
            self._total_frames      = 0
            self._distracted_events = 0
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

        # weights_only=False needed because the checkpoint is a full dict

        # weights_only=False needed because the checkpoint is a full dict
        # (includes non-tensor values like class_names list, accuracy floats)
        checkpoint = torch.load(
            str(self.model_path),
            map_location=self.device,
            weights_only=False,
        )

        # ---- Decode checkpoint structure ----
        if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
            # Full checkpoint saved by the notebook
            state_dict       = checkpoint["model_state_dict"]
            self.class_names = [str(c).strip() for c in checkpoint["class_names"]]
            self.num_classes_from_ckpt = int(checkpoint.get("num_classes", len(self.class_names)))
            img_size         = int(checkpoint.get("image_size", IMAGE_SIZE))
        elif isinstance(checkpoint, dict) and "class_names" in checkpoint:
            # Alternative checkpoint layout (state dict is the whole dict minus meta)
            self.class_names = [str(c).strip() for c in checkpoint["class_names"]]
            self.num_classes_from_ckpt = len(self.class_names)
            state_dict = {k: v for k, v in checkpoint.items()
                          if isinstance(v, torch.Tensor)}
        elif isinstance(checkpoint, dict):
            # Bare state_dict
            self.class_names = list(FALLBACK_CLASSES)
            self.num_classes_from_ckpt = len(self.class_names)
            state_dict = checkpoint
        else:
            raise ValueError(
                f"Unrecognised checkpoint format in {self.model_path}. "
                f"Expected a dict, got {type(checkpoint).__name__}."
            )

        # ---- Build and load model ----
        self.model = ResNet18(num_classes=len(self.class_names))
        missing, unexpected = self.model.load_state_dict(state_dict, strict=False)
        if missing:
            print(f"[Distraction] WARNING: missing keys  -> {missing}")
        if unexpected:
            print(f"[Distraction] WARNING: unexpected keys -> {unexpected}")

        self.model.to(self.device)
        self.model.eval()

        print(
            f"[Distraction] ResNet-18 loaded  | "
            f"device={self.device}  | classes={self.class_names}"
        )

    def _preprocess(self, image: Image.Image) -> torch.Tensor:
        """
        Preprocessing matches the notebook val_transform exactly:
          Resize(224, 224) → ToTensor() [÷255] → Normalize(IMAGENET_MEAN, IMAGENET_STD)

        We do NOT use random augmentation (that was only for training).
        """
        img  = image.convert("RGB").resize(
            (IMAGE_SIZE, IMAGE_SIZE), Image.Resampling.BILINEAR
        )
        arr  = np.asarray(img, dtype=np.float32) / 255.0           # [0.0, 1.0]
        arr  = (arr - IMAGENET_MEAN) / IMAGENET_STD                 # ImageNet normalised
        # HWC → CHW → add batch dim → send to device
        tensor = torch.from_numpy(arr.transpose(2, 0, 1)).unsqueeze(0).to(self.device)
        return tensor

    def _smooth(self, class_id: int) -> int:
        """Majority-vote smoothing over the recent prediction window."""
        self._history.append(class_id)
        if len(self._history) < 2:
            return class_id
        counts  = Counter(self._history)
        dominant, _ = counts.most_common(1)[0]
        return dominant

    def _reset_state(self, *, clear_history: bool) -> None:
        if clear_history:
            self._history.clear()
        self._distracted_frame_count = 0
        self._distracted_start       = None
        self._alarm_active           = False
