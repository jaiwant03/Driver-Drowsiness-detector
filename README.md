# DriverGuard — Driver Drowsiness & Distraction Detection System

Real-time driver monitoring using **one webcam** and **two independent deep-learning models**, served through a local Flask backend with a live browser dashboard.

---

## Overview

```
Browser webcam
      │
      ▼  (JPEG frame, ~640 px wide)
POST /api/predict
      │
      ├─► DrowsinessDetector  →  best_finetuned.keras
      │     MobileNetV2 + face crop (Haar cascade)
      │     Classes: Closed / Open / no_yawn / yawn
      │     Drowsy = Closed or yawn
      │
      └─► DistractionDetector → driver_distraction_resnet18_complete.pth
            ResNet-18 (pure PyTorch, no torchvision)
            10 classes from State Farm Distracted Driver dataset
            Distracted = any class except "Safe Driving"
      │
      ▼
JSON  { drowsiness: {...}, distraction: {...}, safety_level, alarm }
      │
      ▼
Dashboard  (live video · dual prediction cards · alerts)
```

Both models run on every frame. They share the same raw camera image but use completely separate preprocessing pipelines.

---

## Project Structure

```
driver-drowsiness-model/
│
├── app.py                          ← Flask backend (entry point)
│
├── models/
│   ├── best_finetuned.keras        ← Drowsiness model
│   ├── driver_distraction_resnet18_complete.pth  ← Distraction model
│   └── class_names.json            ← Drowsiness class index map
│
├── utils/
│   ├── drowsiness.py               ← DrowsinessDetector class
│   ├── distraction.py              ← DistractionDetector class
│   ├── resnet.py                   ← Pure-PyTorch ResNet-18 (no torchvision)
│   └── __init__.py
│
├── templates/
│   └── index.html                  ← Dashboard HTML (served by Flask)
│
├── static/
│   ├── css/style.css               ← Dark-theme dashboard styles
│   └── js/app.js                   ← Camera capture + UI update logic
│
├── requirements.txt
└── README.md
```

---

## Model Details

### Drowsiness Model — `best_finetuned.keras`

| Property | Value |
|---|---|
| Architecture | MobileNetV2 (fine-tuned) |
| Framework | TensorFlow / Keras |
| Input size | 224 × 224 × 3 |
| Input range | `[0, 255]` float32 — the `.keras` file contains a built-in `Rescaling(1/127.5, −1)` layer |
| Pre-processing | Resize → float32 cast (model rescales internally) |
| Face detection | OpenCV Haar cascade (`haarcascade_frontalface_default.xml`) |
| Output | 4-class softmax |
| Classes | `{0: Closed, 1: Open, 2: no_yawn, 3: yawn}` |
| Drowsy classes | `Closed`, `yawn` |
| Alert classes | `Open`, `no_yawn` |

**Preprocessing code (matches notebook `predict_image()`):**
```python
img = image.resize((224, 224), Image.Resampling.BILINEAR)
arr = np.asarray(img, dtype=np.float32)       # [0, 255] — NOT divided
batch = np.expand_dims(arr, axis=0)           # (1, 224, 224, 3)
probs = model.predict(batch)[0]               # built-in Rescaling applies
```

---

### Distraction Model — `driver_distraction_resnet18_complete.pth`

| Property | Value |
|---|---|
| Architecture | ResNet-18 |
| Framework | PyTorch |
| Input size | 224 × 224 × 3 |
| Input range | ImageNet-normalised float32 |
| Normalization mean | `[0.485, 0.456, 0.406]` |
| Normalization std | `[0.229, 0.224, 0.225]` |
| Checkpoint format | Full dict: `{model_state_dict, class_names, image_size, num_classes, test_accuracy, test_macro_f1}` |
| Output | 10-class logits → softmax |

**Preprocessing code (matches notebook `val_transform`):**
```python
img  = image.resize((224, 224), Image.Resampling.BILINEAR)
arr  = np.asarray(img, dtype=np.float32) / 255.0
arr  = (arr - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
tensor = torch.from_numpy(arr.transpose(2, 0, 1)).unsqueeze(0)
```

**Classes (from checkpoint `class_names`, State Farm Distracted Driver dataset):**

| Index | Class |
|---|---|
| 0 | Safe Driving |
| 1 | Texting - Right Hand |
| 2 | Phone Call - Right Hand |
| 3 | Texting - Left Hand |
| 4 | Phone Call - Left Hand |
| 5 | Operating Radio |
| 6 | Drinking |
| 7 | Reaching Behind |
| 8 | Hair / Makeup |
| 9 | Talking to Passenger |

Class 0 = not distracted. Any other class = distracted.

---

## Installation

### 1. Clone / open the project

```bash
cd driver-drowsiness-model
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

**Windows:**
```bash
venv\Scripts\activate
```

**macOS / Linux:**
```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

> **Windows note:** If you see an `optree` error from TensorFlow, uncomment the `optree==0.14.0` line in `requirements.txt` and re-run.

### 4. Verify model files are in place

```
models/best_finetuned.keras
models/driver_distraction_resnet18_complete.pth
```

The server will print a clear error and exit if either file is missing.

---

## Running the Application

```bash
python app.py
```

You should see:

```
======================================================================
  DRIVER MONITORING SYSTEM  —  Starting up
======================================================================
  Drowsiness model   : models/best_finetuned.keras
  Distraction model  : models/driver_distraction_resnet18_complete.pth

[Drowsiness] Loading model → ...
[Drowsiness] OK — input=(None, 224, 224, 3)  output=(None, 4)
[Distraction] Loading checkpoint → ...
[Distraction] ResNet-18 loaded | device=cpu | classes=[...]

======================================================================
  BOTH MODELS LOADED SUCCESSFULLY
======================================================================

  Dashboard  →  http://127.0.0.1:5000
  Health API →  http://127.0.0.1:5000/api/health
```

Open **http://127.0.0.1:5000** in your browser.

---

## Camera Permissions

When you click **Start Monitoring**, the browser will ask for camera access.

- **Chrome / Edge:** A permission popup appears in the address bar. Click **Allow**.
- **Firefox:** A popup bar appears at the top. Click **Allow**.
- **If denied:** Refresh the page, click the camera icon in the address bar, and change to **Allow**.

The camera feed is processed locally through the Flask server running on your machine. No video is sent to any external service.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Dashboard HTML |
| `GET` | `/api/health` | System status + model metadata |
| `POST` | `/api/predict` | Accept camera frame, return both predictions |
| `POST` | `/api/reset` | Reset all counters and smoothing state |

### `/api/predict` — Request

Send a JPEG frame as multipart form-data:

```
POST /api/predict
Content-Type: multipart/form-data
field: frame (JPEG file)
```

### `/api/predict` — Response

```json
{
  "success": true,
  "safety_level": "SAFE",
  "safety_message": "Driver is Attentive & Alert",
  "alarm": false,
  "inference_time_ms": 38.4,
  "drowsiness": {
    "prediction": "Open",
    "raw_prediction": "Open",
    "confidence": 96.4,
    "status": "ALERT",
    "is_drowsy": false,
    "face_detected": true,
    "drowsy_frame_count": 0,
    "drowsy_elapsed_seconds": 0.0,
    "probabilities": { "Closed": 0.01, "Open": 0.96, "no_yawn": 0.02, "yawn": 0.01 }
  },
  "distraction": {
    "prediction": "Safe Driving",
    "confidence": 91.2,
    "status": "NOT DISTRACTED",
    "is_distracted": false,
    "top_classes": [
      { "rank": 1, "class_name": "Safe Driving",   "confidence": 91.2 },
      { "rank": 2, "class_name": "Operating Radio", "confidence": 4.1  },
      { "rank": 3, "class_name": "Drinking",        "confidence": 2.3  }
    ]
  }
}
```

---

## Alert System

### Thresholds (configurable in `app.py`)

```python
DROWSINESS_THRESHOLD  = 0.40   # confidence below this → "Low Confidence"
DISTRACTION_THRESHOLD = 0.45   # confidence below this → "Uncertain"
DROWSY_FRAME_LIMIT    = 10     # consecutive drowsy frames before alarm
DISTRACTED_FRAME_LIMIT= 10
ALARM_SECONDS         = 2.0    # OR this many seconds of continuous detection
```

### Temporal smoothing

Both detectors use majority-vote smoothing over a rolling window of 5 frames. A single noisy frame will **not** trigger an alarm — the dominant prediction must persist.

```
Frame 1 → Drowsy
Frame 2 → Drowsy
Frame 3 → Non-Drowsy    ← noisy frame, overridden by majority
Frame 4 → Drowsy
Frame 5 → Drowsy
                         → majority = Drowsy → alarm counter increments
```

### Safety levels

| Level | Meaning |
|---|---|
| `SAFE` | Driver alert, no distraction |
| `DROWSY` | Drowsiness confirmed |
| `DISTRACTED` | Distraction confirmed |
| `CRITICAL` | Both drowsy AND distracted simultaneously |
| `NO_FACE` | Camera cannot detect driver's face |

---

## Performance Notes

- Both models are loaded **once** at startup. No reloading per frame.
- PyTorch inference runs inside `torch.no_grad()`.
- Frames are resized to 640 px wide before sending to save bandwidth.
- `processingFrame` flag prevents parallel requests from the same client.
- GPU is used automatically if available: `torch.device("cuda" if cuda else "cpu")`.
- Typical CPU inference time: 30–80 ms per frame (both models combined).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Drowsiness model not found` | Check `models/best_finetuned.keras` exists |
| `Distraction model not found` | Check `models/driver_distraction_resnet18_complete.pth` exists |
| `optree` import error | Add `optree==0.14.0` to requirements and reinstall |
| Camera permission denied | Allow camera in browser; use `http://127.0.0.1:5000` (not `localhost`) |
| Backend Offline in UI | Ensure `python app.py` is running and no other process uses port 5000 |
| Very slow inference | Normal on CPU for first 1–2 frames; subsequent frames are faster |
| Black camera in browser | Try a different browser; ensure no other app is using the webcam |
