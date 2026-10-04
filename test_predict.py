import urllib.request
import io
import json
from PIL import Image

# Create synthetic frame
img = Image.new('RGB', (640, 480), color=(120, 140, 160))
buf = io.BytesIO()
img.save(buf, format='JPEG')
img_bytes = buf.getvalue()

boundary = 'WebKitFormBoundary1234567890'
body = (
    b'--' + boundary.encode() + b'\r\n'
    b'Content-Disposition: form-data; name="frame"; filename="frame.jpg"\r\n'
    b'Content-Type: image/jpeg\r\n\r\n'
    + img_bytes + b'\r\n'
    b'--' + boundary.encode() + b'--\r\n'
)

req = urllib.request.Request(
    'http://127.0.0.1:5000/api/predict',
    data=body,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)

with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print(json.dumps(data, indent=2))
