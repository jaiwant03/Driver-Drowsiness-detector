# Backend - Flask API Server

This folder contains the Flask backend API server for DriverGuard.

## Structure

```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
└── utils/              # Detection modules
    ├── __init__.py
    ├── drowsiness.py   # Drowsiness detection (MobileNetV2)
    ├── distraction.py  # Distraction detection (ResNet-18)
    └── resnet.py       # ResNet model architecture
```

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running

From the **backend** folder:

```bash
python app.py
```

The server will start at: **http://localhost:5000**

## API Endpoints

### Health Check
```
GET /api/health
```
Returns backend status and model information.

### Prediction
```
POST /api/predict
```
Send a camera frame (JPEG) and receive drowsiness + distraction predictions.

**Request:** FormData with 'frame' field (JPEG image)

**Response:**
```json
{
  "success": true,
  "safety_level": "SAFE",
  "safety_message": "Driver is Attentive & Alert",
  "alarm": false,
  "inference_time_ms": 42.1,
  "drowsiness": { ... },
  "distraction": { ... }
}
```

### Reset Session
```
POST /api/reset
```
Resets all session counters and temporal state.

## Dependencies

Key Python packages:
- Flask - Web server
- TensorFlow/Keras - Drowsiness model
- PyTorch - Distraction model
- OpenCV - Image processing
- Pillow - Image handling
- NumPy - Numerical operations
- Flask-CORS - CORS support

## Model Files

The backend requires model files from the `../models/` directory:
- `best_finetuned.keras` - Drowsiness detection model
- `driver_distraction_resnet18_complete.pth` - Distraction detection model
- `class_names.json` - Class names (optional)

## Configuration

Key settings in `app.py`:
- `DROWSINESS_THRESHOLD = 0.40` - Confidence threshold for drowsiness
- `DISTRACTION_THRESHOLD = 0.45` - Confidence threshold for distraction
- `DROWSY_FRAME_LIMIT = 10` - Consecutive frames before alarm
- `ALARM_SECONDS = 2.0` - Duration threshold for alarm

## Troubleshooting

**Models not found:**
```
[FATAL] Drowsiness model not found
```
Solution: Ensure model files exist in `../models/` directory

**Port already in use:**
```
OSError: [Errno 48] Address already in use
```
Solution: Change port in app.py or kill the process using port 5000

**Module import errors:**
```
ModuleNotFoundError: No module named 'tensorflow'
```
Solution: Install dependencies with `pip install -r requirements.txt`
