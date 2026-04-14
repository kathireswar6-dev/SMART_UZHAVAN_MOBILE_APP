# 🔧 Advanced Troubleshooting - "Failed to download remote update"

## Root Cause Analysis

The error `java.io.IOException: Failed to download remote update` occurs when:

| Issue | Symptom | Fix |
|-------|---------|-----|
| **Backend not running** | App crashes immediately | Start backend: `python app.py` |
| **Wrong IP/Port** | Timeout or connection refused | Check PC IP with `ipconfig` |
| **Firewall blocking** | Silent timeout (no response) | Allow port 5000 in Windows Firewall |
| **Wrong network** | Can't resolve hostname | Ensure phone & PC on same WiFi |
| **Backend crashed** | Works then fails | Check Python error in terminal |
| **Model not loaded** | Backend returns 500 error | Ensure `Models/` folder exists |

---

## Network Diagram

```
┌─────────────────────────────────────────┐
│  Windows PC (192.168.1.100)             │
│  ┌──────────────────────────────────┐   │
│  │ Flask Backend (localhost:5000)   │◄──┼─── Port 5000 (Open in Firewall)
│  │ - Load ML Models                 │   │
│  │ - Predict diseases               │   │
│  │ - Save to SQLite DB              │   │
│  └──────────────────────────────────┘   │
└──────────────┬──────────────────────────┘
               │ WiFi Connection
               │ (Must be SAME network)
┌──────────────▼──────────────────────────┐
│  Android Phone (192.168.1.50)           │
│  ┌──────────────────────────────────┐   │
│  │ Expo App                         │   │
│  │ - api.ts resolves to:            │   │
│  │   http://192.168.1.100:5000      │   │
│  │ - Sends prediction request ──────┼───┼──→ Backend
│  │ - Displays results from response │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Step-by-Step Verification

### 1️⃣ Backend Process
```bash
# Terminal 1: Start backend
cd c:\Flutter_Projects\MyProject\backend
python app.py

# Expected output:
# [INFO] Loading model...
# ✅ MODEL READY FOR PREDICTIONS!
# 🚀🚀 MODEL READY FOR PREDICTIONS!
# WARNING: This is a development server. Do not use it in production.
# Running on http://0.0.0.0:5000
```

**If this fails:** Check Python installation and dependencies
```bash
pip install -r requirements.txt
python -m flask run --host 0.0.0.0 --port 5000
```

### 2️⃣ Firewall Configuration

**Windows Defender Firewall:**
1. Press `Win + R` → Type `firewall.cpl` → Press Enter
2. Click **"Allow an app through firewall"** (left panel)
3. Click **"Change settings"** (if grayed out)
4. Click **"Allow another app"** 
5. Browse to Python: `C:\Users\YourName\AppData\Local\Programs\Python\Python310\python.exe`
6. Click **"Add"** → **"OK"**

**Or via PowerShell (Run as Admin):**
```powershell
# Create inbound rule for port 5000
netsh advfirewall firewall add rule name="Flask Backend Port 5000" dir=in action=allow protocol=tcp localport=5000

# Verify rule was added
netsh advfirewall firewall show rule name="Flask Backend Port 5000"
```

### 3️⃣ Network Verification

**Get PC IP:**
```bash
# Command Prompt
ipconfig | findstr /R "IPv4.*192\|IPv4.*10"

# PowerShell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notmatch "127.0.0.1"}
```

**Expected output:** Something like `192.168.1.100` or `10.0.0.50`

**Test from PC:**
```bash
# Should return the HTML page
curl http://localhost:5000/
curl http://192.168.1.100:5000/

# Test the API endpoint
curl http://192.168.1.100:5000/crop-list
```

**Test from phone (Android via ADB):**
```bash
# Get device IP first
adb shell ifconfig

# Test connectivity (replace 192.168.1.100 with your PC IP)
adb shell "curl http://192.168.1.100:5000/"
```

### 4️⃣ Phone Configuration

**USB Debugging Steps:**
1. On phone: Settings → About Phone
2. Tap **"Build Number"** 7 times
3. Go to Settings → System → Developer options
4. Enable: **USB Debugging**
5. Enable: **USB Debugging (Security Settings)** (if available)
6. Plug phone via USB cable to PC
7. Tap **"Allow"** when prompted on phone

**Verify connection:**
```bash
# In Command Prompt
adb devices

# Should show your device:
# List of attached devices
# ABC123XYZ device
```

### 5️⃣ Rebuild App

```bash
# Clear old builds
cd c:\Flutter_Projects\MyProject
npm run reset-project

# Install dependencies
npm install

# Rebuild for connected device
npx expo start --android

# Or if already running:
npm run android
```

### 6️⃣ Monitor Logs While Testing

**Terminal A - Backend logs:**
```bash
cd c:\Flutter_Projects\MyProject\backend
python app.py

# Watch for incoming requests and errors
```

**Terminal B - App logs:**
```bash
# In separate terminal while app is running
adb logcat | grep -E "\[API\]|Error|Exception|Backend"

# Or save to file
adb logcat > app_logs.txt
# Then search for [API] markers
```

**In App:**
- Open the app
- Navigate to the disease prediction screen
- Try uploading a photo
- Watch both terminals for messages

---

## Common Error Messages & Fixes

### ❌ "Network request failed"
```
Cause: Backend not accessible
Fix:
  1. Is backend running? (python app.py)
  2. Is firewall blocking port 5000?
  3. Are phone & PC on same WiFi?
  4. Is PC IP correct in app/api.ts logs?
```

### ❌ "HTTP 500: Internal Server Error"
```
Cause: Backend crashed or model failed to load
Fix:
  1. Check Python terminal for error traceback
  2. Ensure Models/best_model_saved/ exists
  3. Check classes and disease treatment JSON files exist
  4. Restart backend: python app.py
```

### ❌ "Connection timeout"
```
Cause: Firewall blocking or wrong IP
Fix:
  1. Verify PC IP: ipconfig
  2. Test: curl http://YOUR_IP:5000/
  3. Check Windows Firewall rules
  4. Try disabling firewall temporarily to test:
     powershell -Command "Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False"
```

### ❌ "Cannot reach backend at 192.168.x.x:5000"
```
Cause: IP address mismatch or backend not running
Fix:
  1. Get correct PC IP: ipconfig | findstr IPv4
  2. Test: curl http://192.168.1.100:5000/ (replace IP)
  3. Verify WiFi network name matches on both devices
  4. Restart WiFi router and reconnect
```

---

## Production Deployment (When Ready)

When deploying to real users (not local development):

1. **Use a real server** (AWS, Azure, Heroku, etc.)
2. **Update api.ts:**
   ```typescript
   const BACKEND_URL = "https://your-api.example.com";
   ```
3. **Or use environment variable:**
   ```bash
   BACKEND_URL=https://your-api.example.com npm run android
   ```
4. **Enable HTTPS** (required for app store submission)
5. **Configure CORS** for your domain

---

## Performance Tips

```python
# In app.py, if slowdown detected:

# 1. Disable debug mode in production
app.run(host='0.0.0.0', port=5000, debug=False)  # ← Change to False

# 2. Use production WSGI server
# pip install gunicorn
# gunicorn -w 4 -b 0.0.0.0:5000 app:app

# 3. Cache model loading
# Move load_model() outside request handler
```

---

## Support Checklist

Before asking for help, verify:

- [ ] Backend terminal shows "🚀🚀 MODEL READY FOR PREDICTIONS!"
- [ ] `curl http://192.168.1.100:5000/` returns HTML page
- [ ] `adb devices` shows your phone
- [ ] Phone shows [API] logs matching PC IP
- [ ] Windows Firewall allows port 5000
- [ ] PC and phone on same WiFi network
- [ ] No VPN/Proxy software interfering

