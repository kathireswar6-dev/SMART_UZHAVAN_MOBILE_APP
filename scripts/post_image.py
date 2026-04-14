import sys
import traceback
try:
    import requests
except Exception as e:
    print('requests not available:', e)
    raise

if len(sys.argv) < 2:
    print('Usage: post_image.py <image-path>')
    sys.exit(1)

img_path = sys.argv[1]
url = 'http://127.0.0.1:5000/predict-disease'
print('Posting', img_path, 'to', url)
try:
    with open(img_path, 'rb') as f:
        files = {'file': (img_path.split('\\')[-1], f, 'image/jpeg')}
        resp = requests.post(url, files=files, timeout=60)
    print('Status:', resp.status_code)
    try:
        print('JSON:', resp.json())
    except Exception:
        print('Text:', resp.text)
except Exception:
    traceback.print_exc()
    sys.exit(2)
