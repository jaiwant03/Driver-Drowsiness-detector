# Models - AI Model Weights

This folder contains the trained deep learning models for driver monitoring.

## Model Files

### 1. Drowsiness Detection Model
**File:** `best_finetuned.keras`  
**Size:** ~23.7 MB  
**Architecture:** MobileNetV2 (fine-tuned)  
**Classes:** 4
- Eyes Open
- Eyes Closed
- No Yawn
- Yawn

**Input:** RGB image (preprocessed to model requirements)  
**Output:** Class probabilities for drowsiness states

**Training Notebook:** `../Driver_Drowsiness.ipynb`

---

### 2. Distraction Detection Model
**File:** `driver_distraction_resnet18_complete.pth`  
**Size:** ~44.8 MB  
**Architecture:** ResNet-18 (custom trained)  
**Classes:** 10 distraction behaviors

**Input:** RGB image (preprocessed)  
**Output:** Class probabilities for distraction types

**Training Notebook:** `../driver_distraction.ipynb`

---

### 3. Class Names (Optional)
**File:** `class_names.json`  
Contains human-readable class labels for the models.

## Model Usage

These models are automatically loaded by the Flask backend (`backend/app.py`) at startup.

### From Backend:
```python
from utils.drowsiness import DrowsinessDetector
from utils.distraction import DistractionDetector

# Models are loaded with:
drowsiness_detector = DrowsinessDetector(
    model_path="models/best_finetuned.keras"
)

distraction_detector = DistractionDetector(
    model_path="models/driver_distraction_resnet18_complete.pth"
)
```

## Model Performance

### Drowsiness Detection
- **Framework:** TensorFlow/Keras
- **Backbone:** MobileNetV2 (efficient for real-time)
- **Inference:** ~15-30ms per frame (CPU)
- **Use Case:** Real-time eye state and yawn detection

### Distraction Detection
- **Framework:** PyTorch
- **Backbone:** ResNet-18
- **Inference:** ~20-40ms per frame (CPU)
- **Use Case:** Driver behavior classification

## Version Control

⚠️ **Note:** These model files are binary and relatively large (~68.5 MB total).

### Git LFS (Recommended for Version Control)
If tracking these files in Git:
1. Install Git LFS: `git lfs install`
2. Track model files: `git lfs track "*.keras" "*.pth"`
3. Commit `.gitattributes` file

### Alternative Storage
For production, consider hosting models on:
- **GitHub Releases** (for public repos)
- **AWS S3** / **Google Cloud Storage**
- **Hugging Face Model Hub**
- **DVC** (Data Version Control)

Then download them during deployment.

## Retraining

To retrain or fine-tune the models:

1. **Drowsiness Model:**
   - Open `../Driver_Drowsiness.ipynb`
   - Update dataset paths
   - Run training cells
   - Export new `best_finetuned.keras`

2. **Distraction Model:**
   - Open `../driver_distraction.ipynb`
   - Update dataset paths
   - Run training cells
   - Export new `driver_distraction_resnet18_complete.pth`

## Model Requirements

### System Requirements
- **RAM:** 4GB minimum (8GB recommended)
- **Storage:** 100MB free space
- **CPU:** Multi-core processor recommended
- **GPU:** Optional (CUDA for faster inference)

### Python Dependencies
See `backend/requirements.txt`:
- tensorflow >= 2.x
- torch >= 1.x
- opencv-python
- pillow
- numpy

## License

⚠️ Ensure you have the right to use these trained models, especially if they were trained on proprietary datasets.

## Contact

For questions about the models or retraining, refer to the training notebooks or project documentation.
