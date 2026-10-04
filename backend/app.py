"""
Driver Drowsiness & Distraction Detection — Flask Backend (API only)
=====================================================================

Loads both models ONCE at startup, then serves every camera frame
through both simultaneously via POST /api/predict.

Single-camera pipeline
----------------------
Browser → JPEG frame → POST /api/predict
                             ├─► DrowsinessDetector  (best_finetuned.keras)
                             └─► DistractionDetector (driver_distraction_resnet18_complete.pth)
                       ◄─── JSON  { drowsiness: {...}, distraction: {...}, ... }

Endpoints
---------
GET  /api/health    → System status JSON
POST /api/predict   → Accept JPEG frame, return both model predictions
POST /api/reset     → Reset all temporal state and counters

Frontend is served separately by Vite dev server (npm run dev) in the
frontend/ directory.  This backend serves only JSON API endpoints.
"""

from __future__ import annotations

import base64
import io
import os
import sys
import time
import traceback
from pathlib import Path

# Fix Windows console encoding for Unicode characters
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError

# ---------------------------------------------------------------------------
# Path setup
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = ROOT.parent  # Go up one level to project root
sys.path.insert(0, str(ROOT))

from utils.drowsiness   import DrowsinessDetector
from utils.distraction  import DistractionDetector

# ---------------------------------------------------------------------------
# Model file paths
# ---------------------------------------------------------------------------
MODELS_DIR = PROJECT_ROOT / "models"

DROWSINESS_MODEL   = MODELS_DIR / "best_finetuned.keras"
DISTRACTION_MODEL  = MODELS_DIR / "driver_distraction_resnet18_complete.pth"
CLASS_NAMES_JSON   = MODELS_DIR / "class_names.json"

# Confidence thresholds (configurable here)
DROWSINESS_THRESHOLD  = 0.40   # below this → "Low Confidence"
DISTRACTION_THRESHOLD = 0.45   # below this → "Uncertain"

# Alert debounce settings
DROWSY_FRAME_LIMIT      = 10   # consecutive drowsy frames before alarm
DISTRACTED_FRAME_LIMIT  = 10
ALARM_SECONDS           = 2.0  # OR this many seconds of continuous state

# ---------------------------------------------------------------------------
# Validate model files before starting
# ---------------------------------------------------------------------------
def _check_model(path: Path, label: str) -> None:
    if not path.exists():
        print(f"\n[FATAL] {label} not found:\n  {path}")
        print("  -> Place the model file in the models/ directory and restart.\n")
        sys.exit(1)

_check_model(DROWSINESS_MODEL,  "Drowsiness model (best_finetuned.keras)")
_check_model(DISTRACTION_MODEL, "Distraction model (driver_distraction_resnet18_complete.pth)")

# ---------------------------------------------------------------------------
# Flask app
# ---------------------------------------------------------------------------
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ---------------------------------------------------------------------------
# Load both models once at startup
# ---------------------------------------------------------------------------
print("Loading models...")

try:
    drowsiness_detector = DrowsinessDetector(
        model_path=DROWSINESS_MODEL,
        class_names_path=CLASS_NAMES_JSON if CLASS_NAMES_JSON.exists() else None,
        confidence_threshold=DROWSINESS_THRESHOLD,
        smoothing_window=5,
        drowsy_frame_limit=DROWSY_FRAME_LIMIT,
        alarm_time_seconds=ALARM_SECONDS,
    )
except Exception as exc:
    print(f"Could not load drowsiness model: {exc}")
    traceback.print_exc()
    sys.exit(1)

try:
    distraction_detector = DistractionDetector(
        model_path=DISTRACTION_MODEL,
        confidence_threshold=DISTRACTION_THRESHOLD,
        smoothing_window=5,
        distracted_frame_limit=DISTRACTED_FRAME_LIMIT,
        alarm_time_seconds=ALARM_SECONDS,
    )
except Exception as exc:
    print(f"Could not load distraction model: {exc}")
    traceback.print_exc()
    sys.exit(1)

print("Both models loaded successfully")


# ---------------------------------------------------------------------------
# Helper — decode incoming image (multipart, base64-JSON, or raw bytes)
# ---------------------------------------------------------------------------

def _decode_image(req: "request") -> Image.Image:
    """
    Try three strategies in order:
      1. multipart/form-data  →  req.files["frame"]
      2. JSON body            →  { "frame": "<base64 data-url or raw>" }
      3. Raw binary body      →  req.data
    Raises ValueError with a user-friendly message if nothing works.
    """
    # 1. Multipart
    if "frame" in req.files:
        f = req.files["frame"]
        try:
            img = Image.open(f.stream)
            img.load()
            return img
        except (UnidentifiedImageError, Exception) as exc:
            raise ValueError(f"Invalid multipart image: {exc}") from exc

    # 2. JSON / base64
    if req.is_json:
        body    = req.get_json(silent=True) or {}
        b64_str = body.get("frame") or body.get("image") or ""
        if b64_str:
            if "," in b64_str:                        # strip data-URL prefix
                b64_str = b64_str.split(",", 1)[1]
            try:
                raw = base64.b64decode(b64_str)
                img = Image.open(io.BytesIO(raw))
                img.load()
                return img
            except Exception as exc:
                raise ValueError(f"Invalid base64 image: {exc}") from exc

    # 3. Raw binary
    if req.data:
        try:
            img = Image.open(io.BytesIO(req.data))
            img.load()
            return img
        except Exception:
            pass

    raise ValueError(
        "No valid image received. "
        "Send a JPEG/PNG as multipart 'frame' field, "
        "JSON {frame: '<base64>'}, or raw binary body."
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health():
    """Return system status and model metadata."""
    return jsonify({
        "status":  "online",
        "service": "Driver Drowsiness & Distraction Monitoring System",
        "models": {
            "drowsiness": {
                "loaded":  True,
                "file":    DROWSINESS_MODEL.name,
                "classes": drowsiness_detector.class_names,
                "num_classes": drowsiness_detector.num_classes,
            },
            "distraction": {
                "loaded":  True,
                "file":    DISTRACTION_MODEL.name,
                "classes": distraction_detector.class_names,
                "num_classes": distraction_detector.num_classes,
            },
        },
        "single_camera_pipeline": True,
        "thresholds": {
            "drowsiness":  DROWSINESS_THRESHOLD,
            "distraction": DISTRACTION_THRESHOLD,
        },
    })


@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Accept a camera frame and return predictions from both models.

    Response JSON shape:
    {
        "success": true,
        "safety_level": "SAFE" | "DROWSY" | "DISTRACTED" | "CRITICAL" | "NO_FACE",
        "safety_message": "...",
        "alarm": false,
        "inference_time_ms": 42.1,
        "drowsiness": { prediction, raw_prediction, confidence, status, is_drowsy,
                        alarm, face_detected, drowsy_frame_count,
                        drowsy_elapsed_seconds, total_frames, drowsy_events,
                        probabilities },
        "distraction": { prediction, raw_prediction, confidence, status, is_distracted,
                         alarm, distracted_frame_count, distracted_elapsed_seconds,
                         total_frames, distracted_events, top_classes, probabilities }
    }
    """
    t_start = time.perf_counter()

    # --- Decode image ---
    try:
        pil_image = _decode_image(request)
    except ValueError as exc:
        return jsonify({"success": False, "error": str(exc)}), 400

    # --- Convert to RGB (handles RGBA, L, etc.) ---
    pil_image = pil_image.convert("RGB")

    # --- Run both models on the same frame ---
    try:
        drowsiness_result  = drowsiness_detector.predict(pil_image)
        distraction_result = distraction_detector.predict(pil_image)
    except Exception as exc:
        print(f"[Error] Prediction failed: {exc}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(exc)}), 500

    # --- Unified safety assessment ---
    is_drowsy     = drowsiness_result.get("is_drowsy", False)
    is_distracted = distraction_result.get("is_distracted", False)
    face_detected = drowsiness_result.get("face_detected", True)
    alarm_active  = (
        drowsiness_result.get("alarm", False)
        or distraction_result.get("alarm", False)
    )

    if is_drowsy and is_distracted:
        safety_level   = "CRITICAL"
        safety_message = "CRITICAL: Driver is Drowsy AND Distracted!"
    elif is_drowsy:
        safety_level   = "DROWSY"
        safety_message = "DANGER: Drowsiness Detected!"
    elif is_distracted:
        safety_level   = "DISTRACTED"
        safety_message = f"WARNING: Distraction Detected ({distraction_result.get('prediction', '')})!"
    elif not face_detected:
        safety_level   = "NO_FACE"
        safety_message = "Driver face not detected"
    else:
        safety_level   = "SAFE"
        safety_message = "Driver is Attentive & Alert"

    inference_ms = round((time.perf_counter() - t_start) * 1000, 1)

    return jsonify({
        "success":          True,
        "safety_level":     safety_level,
        "safety_message":   safety_message,
        "alarm":            alarm_active,
        "inference_time_ms": inference_ms,
        "drowsiness":       drowsiness_result,
        "distraction":      distraction_result,
    })


@app.route("/api/reset", methods=["POST"])
def reset():
    """Reset all temporal state, counters, and smoothing history."""
    drowsiness_detector.reset_all()
    distraction_detector.reset_all()
    return jsonify({
        "success": True,
        "message": "All detectors reset successfully.",
    })


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import logging

    # Silence all Flask/Werkzeug startup and request logs
    log = logging.getLogger("werkzeug")
    log.setLevel(logging.ERROR)
    logging.getLogger("flask.app").setLevel(logging.ERROR)

    # Suppress Flask's own "* Serving Flask app" / "* Debug mode" banner
    import flask.cli
    flask.cli.show_server_banner = lambda *args, **kwargs: None

    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "5000"))

    print("Backend running successfully")
    print()

    app.run(host=host, port=port, debug=False, threaded=True, use_reloader=False)
