"""
verify_models.py — Quick sanity check for both models.
Run with:  python verify_models.py
"""
import sys
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
os.chdir(ROOT)

from PIL import Image

# ── Test image ────────────────────────────────────────────────
test_img_path = os.path.join(ROOT, "test_frame.jpg")
if not os.path.exists(test_img_path):
    print(f"[WARN] test_frame.jpg not found at {test_img_path}")
    print("       Creating a blank 640x480 RGB image for testing...")
    import numpy as np
    img = Image.fromarray(np.random.randint(80, 180, (480, 640, 3), dtype="uint8"))
else:
    img = Image.open(test_img_path).convert("RGB")
    print(f"[OK] Test image loaded: {img.size[0]}x{img.size[1]} px")

print()

# ─────────────────────────────────────────────────────────────
# TEST 1 — Distraction Model (PyTorch ResNet-18)
# ─────────────────────────────────────────────────────────────
print("=" * 60)
print("TEST 1 — Distraction Model (PyTorch ResNet-18)")
print("=" * 60)

from utils.distraction import DistractionDetector

distraction_detector = DistractionDetector(
    model_path=os.path.join(ROOT, "models", "driver_distraction_resnet18_complete.pth"),
    confidence_threshold=0.10,   # low threshold so we always get a result on a test image
)

r1 = distraction_detector.predict(img)
print(f"  Prediction  : {r1['prediction']}")
print(f"  Raw         : {r1['raw_prediction']}")
print(f"  Confidence  : {r1['confidence']}%")
print(f"  Status      : {r1['status']}")
print(f"  Distracted  : {r1['is_distracted']}")
print(f"  Top-3:")
for t in r1.get("top_classes", []):
    print(f"    {t['rank']}. {t['class_name']} — {t['confidence']}%")
assert r1["success"], "Distraction predict() returned success=False"
assert len(r1["probabilities"]) == 10, f"Expected 10 classes, got {len(r1['probabilities'])}"
print("[PASS] Distraction model test passed.")

print()

# ─────────────────────────────────────────────────────────────
# TEST 2 — Drowsiness Model (Keras MobileNetV2)
# ─────────────────────────────────────────────────────────────
print("=" * 60)
print("TEST 2 — Drowsiness Model (Keras MobileNetV2)")
print("=" * 60)

from utils.drowsiness import DrowsinessDetector

drowsiness_detector = DrowsinessDetector(
    model_path=os.path.join(ROOT, "models", "best_finetuned.keras"),
    class_names_path=os.path.join(ROOT, "models", "class_names.json"),
    confidence_threshold=0.10,   # low threshold for test
)

r2 = drowsiness_detector.predict(img)
print(f"  Prediction   : {r2['prediction']}")
print(f"  Raw          : {r2['raw_prediction']}")
print(f"  Confidence   : {r2['confidence']}%")
print(f"  Status       : {r2['status']}")
print(f"  Is Drowsy    : {r2['is_drowsy']}")
print(f"  Face Detected: {r2['face_detected']}")
print(f"  Probabilities:")
for cls, prob in r2.get("probabilities", {}).items():
    print(f"    {cls}: {round(prob * 100, 2)}%")
assert r2["success"], "Drowsiness predict() returned success=False"
assert len(r2["probabilities"]) == 4, f"Expected 4 classes, got {len(r2['probabilities'])}"
print("[PASS] Drowsiness model test passed.")

print()
print("=" * 60)
print("ALL VERIFICATION TESTS PASSED")
print("Run the app with:  python app.py")
print("=" * 60)
