# 🛡️ DriverGuard — AI-Powered Driver Safety Monitoring

Real-time driver drowsiness and distraction detection using AI deep learning models with a modern React dashboard.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-green.svg)
![React](https://img.shields.io/badge/react-19-blue.svg)

---

## 📋 Overview

DriverGuard is a comprehensive driver monitoring system that uses:
- **Computer Vision** to detect drowsiness (eyes closed, yawning)
- **Deep Learning** to identify driver distractions
- **Real-time Processing** for immediate safety alerts
- **Modern UI** with React-based dashboard

### Architecture

```
Browser Camera
      │
      ▼ (JPEG frames ~30 FPS)
React Frontend (localhost:5173)
      │
      ▼ HTTP/API
Flask Backend (localhost:5000)
      │
      ├─► Drowsiness Model (MobileNetV2)
      │   └─ Eyes: Open/Closed, Yawn: Yes/No
      │
      └─► Distraction Model (ResNet-18)
          └─ 10 distraction behaviors
      │
      ▼
JSON Response
      │
      └─ Live Dashboard Updates
```

---

## 🏗️ Project Structure (NEW - Organized)

```
driver-drowsiness-model/
│
├── backend/                    ← Flask API Server
│   ├── app.py                 ← Main Flask application
│   ├── requirements.txt       ← Python dependencies
│   ├── utils/                 ← Detection modules
│   │   ├── drowsiness.py     ← Drowsiness detector
│   │   ├── distraction.py    ← Distraction detector
│   │   └── resnet.py         ← ResNet architecture
│   └── README.md              ← Backend documentation
│
├── frontend/                   ← React Application
│   ├── src/
│   │   ├── components/       ← React components
│   │   ├── hooks/            ← Custom hooks
│   │   ├── App.jsx           ← Main app
│   │   └── ...
│   ├── package.json          ← Node dependencies
│   └── README.md             ← Frontend documentation
│
├── models/                     ← AI Model Weights
│   ├── best_finetuned.keras                    ← Drowsiness model (~24MB)
│   ├── driver_distraction_resnet18_complete.pth ← Distraction model (~45MB)
│   ├── class_names.json                         ← Class labels
│   └── README.md                                ← Models documentation
│
├── Driver_Drowsiness.ipynb     ← Training notebook (drowsiness)
├── driver_distraction.ipynb    ← Training notebook (distraction)
├── README.md                   ← This file
└── .gitignore
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 16+** and npm
- **Webcam**
- **4GB RAM** minimum (8GB recommended)

### Installation

1. **Clone the repository:**
```bash
cd "d:\Dev\Projects\Driver_Drowsyness project\driver-drowsiness-model"
```

2. **Backend Setup:**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Or macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

cd ..
```

3. **Frontend Setup:**
```bash
cd frontend

# Install dependencies
npm install

cd ..
```

---

## ▶️ Running the Application

You need **TWO terminal windows**:

### Terminal 1: Backend (Flask API)

```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
python app.py
```

**Expected Output:**
```
======================================================================
  DRIVER MONITORING SYSTEM  --  Starting up
======================================================================
✓ Drowsiness model loaded (4 classes)
✓ Distraction model loaded (10 classes)

Dashboard  ->  http://127.0.0.1:5000
```

### Terminal 2: Frontend (React Dev Server)

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v8.3.2  ready in 358 ms
  ➜  Local:   http://127.0.0.1:5173/
```

### Access the Application

Open your browser and navigate to: **http://localhost:5173**

---

## 🎯 Features

### Frontend (React Dashboard)
- ✅ **Dashboard** - Overview with key safety metrics
- ✅ **Live Monitor** - Real-time camera feed with AI detection
- ✅ **Analytics** - Charts and session statistics
- ✅ **Alerts** - Safety event history
- ✅ **Reports** - Export PDF/CSV reports
- ✅ **History** - Previous monitoring sessions
- ✅ **Settings** - Configure alerts and preferences
- ✅ **Help** - User guide and documentation

### Backend (Flask API)
- ✅ Real-time frame processing (~30 FPS)
- ✅ Dual AI model inference (drowsiness + distraction)
- ✅ RESTful API endpoints
- ✅ CORS support for cross-origin requests
- ✅ Session management and state tracking

### AI Models
- ✅ **Drowsiness Detection** (MobileNetV2)
  - Eyes: Open/Closed
  - Yawn: Yes/No
  - Face detection with OpenCV Haar Cascade
  
- ✅ **Distraction Detection** (ResNet-18)
  - 10 distraction behaviors from State Farm dataset
  - Safe driving baseline recognition

---

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns backend status and model information.

### Prediction
```
POST /api/predict
```
Send camera frame, receive AI predictions.

**Request:** FormData with 'frame' field (JPEG)

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
Resets all session counters and state.

---

## 🤖 Model Details

### Drowsiness Model
- **Architecture:** MobileNetV2 (fine-tuned)
- **Framework:** TensorFlow/Keras
- **Input:** 224×224 RGB
- **Classes:** 4 (Eyes Open, Eyes Closed, No Yawn, Yawn)
- **Training:** Custom dataset with face detection

### Distraction Model
- **Architecture:** ResNet-18
- **Framework:** PyTorch
- **Input:** 224×224 RGB
- **Classes:** 10 distraction behaviors
- **Dataset:** State Farm Distracted Driver Detection

**Distraction Classes:**
1. Safe Driving
2. Texting - Right Hand
3. Phone Call - Right Hand
4. Texting - Left Hand
5. Phone Call - Left Hand
6. Operating Radio
7. Drinking
8. Reaching Behind
9. Hair / Makeup
10. Talking to Passenger

---

## 🎨 Design System

### Color Palette
- **Primary:** #F97316 (Orange) - Brand accent
- **Secondary:** #172033 (Navy) - Text and contrast
- **Background:** #F7F8FA (Light gray)
- **Safe:** #16A34A (Green)
- **Warning:** #F59E0B (Amber)
- **Critical:** #DC2626 (Red)

### Layout
- Fixed left sidebar (260px, collapsible)
- 8 page navigation system
- Mobile responsive with drawer navigation
- Premium card-based design

---

## 🛠️ Development

### Backend Development
```bash
cd backend
python app.py
# Flask debug mode enabled by default in development
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload enabled
npm run lint # Run linter
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
# Output: dist/ folder
npm run preview  # Preview production build
```

**Backend:**
Configure production WSGI server (Gunicorn, uWSGI, etc.)

---

## 📊 System Requirements

### Minimum
- **CPU:** Dual-core 2.0 GHz
- **RAM:** 4 GB
- **Storage:** 500 MB
- **Camera:** 720p webcam

### Recommended
- **CPU:** Quad-core 3.0 GHz
- **RAM:** 8 GB
- **GPU:** CUDA-capable GPU (optional)
- **Camera:** 1080p webcam

---

## 🔧 Troubleshooting

### Backend Issues

**Models not found:**
```
[FATAL] Drowsiness model not found
```
✅ Solution: Verify files exist in `models/` directory

**Port already in use:**
```
OSError: Address already in use
```
✅ Solution: Change port in `backend/app.py` or kill process on port 5000

### Frontend Issues

**Dependencies installation fails:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**API connection errors:**
✅ Solution: Ensure backend is running at `http://localhost:5000`

### Camera Issues

**Camera access denied:**
✅ Solution: Allow camera permissions in browser settings

**No camera detected:**
✅ Solution: Ensure webcam is connected and not used by another application

---

## 📚 Documentation

Detailed documentation for each component:

- **Backend:** See `backend/README.md`
- **Frontend:** See `frontend/README.md`
- **Models:** See `models/README.md`

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] Camera access granted
- [ ] Live detection working (eyes, yawn, distraction)
- [ ] Safety score updates in real-time
- [ ] Alerts appear correctly
- [ ] Navigation between pages works
- [ ] Export reports (PDF/CSV)
- [ ] Settings persist

---

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional distraction classes
- GPU acceleration optimization
- Mobile app version
- Cloud deployment guides
- Multi-camera support
- Advanced analytics

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **State Farm Distracted Driver Dataset** for distraction model training
- **MobileNetV2** architecture for efficient drowsiness detection
- **React** and **Flask** communities

---

## 📞 Support

For issues and questions:
1. Check the documentation in each folder's README
2. Review troubleshooting section
3. Verify all dependencies are installed
4. Check browser console for frontend errors
5. Check terminal for backend errors

---

## 🎉 Ready to Go!

Run the commands above and access:
### **http://localhost:5173**

**Stay Safe on the Road with DriverGuard!** 🚗💨
