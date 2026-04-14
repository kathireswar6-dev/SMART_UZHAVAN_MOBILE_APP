# ✅ Verification & Testing Guide

## Pre-Flight Checklist

Before testing your real device, verify everything is ready.

### Backend Readiness (5 min)

```bash
# 1. Check Python is installed
python --version
# Expected: Python 3.8+

# 2. Install dependencies
cd c:\Flutter_Projects\MyProject\backend
pip install -r requirements.txt

# 3. Start backend
python app.py

# 4. In another terminal, test backend is running
curl http://localhost:5000/

# Expected output:
# <h1>Backend is Running!</h1>
```

**Troubleshooting:**
- If `python` not found: Install Python from python.org
- If `pip install` fails: `python -m pip install --upgrade pip`
- If models not loading: Check `Models/best_model_saved/` folder exists

---

### Network Setup (3 min)

```bash
# 1. Find your PC's IP address
ipconfig

# Look for IPv4 Address (something like 192.168.1.100)
# Note this down as YOUR_PC_IP

# 2. Test connectivity from PC
curl http://YOUR_PC_IP:5000/
# Should return the HTML page

# 3. Check firewall
# Search "Firewall" in Windows → Advanced Settings
# Check port 5000 is allowed
```

**Troubleshooting:**
- If firewall blocks: See [ADVANCED_TROUBLESHOOTING.md](ADVANCED_TROUBLESHOOTING.md#firewall-configuration)
- If wrong IP: Run `ipconfig | findstr /R "IPv4.*192\|IPv4.*10"`

---

### Mobile Device Setup (5 min)

```bash
# 1. Enable USB Debugging
# On phone: Settings → About Phone → Build Number (tap 7 times)
# Settings → Developer options → USB Debugging (turn ON)

# 2. Connect via USB cable

# 3. Verify connection
adb devices

# Expected output:
# List of attached devices
# ABC123XYZ        device
```

**Troubleshooting:**
- If device not showing: Try different USB port or cable
- If ADB not found: Install Android SDK tools
- If permission denied: `adb kill-server` then `adb start-server`

---

## Testing Sequence

### Phase 1: Backend Testing (2 min)

**In Terminal 1:**
```bash
cd c:\Flutter_Projects\MyProject\backend
python app.py

# Watch for these messages:
# ✅ DATABASE INITIALIZED
# ✅ MODEL READY FOR PREDICTIONS!
# WARNING in app.runserver
# Running on http://0.0.0.0:5000
```

**In Terminal 2:**
```bash
# Test the backend
curl http://localhost:5000/
curl http://192.168.1.100:5000/crop-list

# Both should return JSON or HTML
```

**Expected Result:** ✅ Backend is accessible locally and from your PC IP

---

### Phase 2: Network Testing (2 min)

**On Phone via ADB:**
```bash
# Test if phone can reach backend
adb shell curl http://192.168.1.100:5000/

# Should return the same HTML page
```

**If this fails:**
- Phone not on same WiFi as PC
- Firewall blocking port 5000
- Incorrect PC IP address

---

### Phase 3: App Build Testing (5 min)

**In Terminal 3:**
```bash
cd c:\Flutter_Projects\MyProject

# Clear old builds
npm run reset-project

# Start Expo
npx expo start --android

# Watch the terminal output for IP detection
```

**Expected Output:**
```
expo-device: Making "expo" command available in PATH...
Packager started.
...
Started dev server on http://[...]
To open the app on your phone, point it there and scan the QR code above.
```

---

### Phase 4: Runtime Testing (3 min)

**On Phone:**
1. Scan QR code or tap "Open iOS app" / "Open Android app"
2. Wait for app to load
3. Open browser dev tools OR check `adb logcat`

**In Terminal 3 (watch for these logs):**
```
[API] Android debuggerHost: 192.168.1.100:19000
[API] Using detected PC IP from real device: http://192.168.1.100:5000
[API] Resolved BASE_URL: http://192.168.1.100:5000
```

**On Terminal 1 (backend):**
```
Should see new log entries as app makes requests
```

---

## Full Integration Test

Once phases 1-4 pass, do a full test:

```
1. Open app on phone
2. Navigate to Disease Prediction screen
3. Tap "Take Photo" or "Choose from Gallery"
4. Select a crop image
5. Select a crop type (e.g., "Rice", "Tomato")
6. Watch Terminal 1 (backend) for:
   - "🔍 Result: [Disease Name]"
   - "✅ Prediction saved to DB"
7. App should display prediction result
```

**Success Indicators:**
- ✅ App doesn't crash with network error
- ✅ Backend shows prediction was processed
- ✅ App displays disease name and confidence score
- ✅ History screen shows the prediction

---

## Log Analysis

### Backend Logs (Terminal 1)
```bash
# Look for these in backend output:
✅ MODEL READY                 # Model loaded successfully
✅ CORS enabled               # Can accept requests from app
✅ Prediction saved to DB     # Data stored successfully

❌ Failed to load model       # Fix: Check Models/ folder
❌ Connection refused         # Fix: Firewall blocking
❌ No attribute               # Fix: JSON files missing
```

### App Logs (Terminal 3 / adb)
```bash
# Run this to capture app logs:
adb logcat | grep -E "\[API\]|Error|Network|Backend"

# Look for:
✅ [API] Using detected PC IP  # Correct IP resolution
✅ [API] Prediction successful # Request completed
❌ Failed to download          # Network connectivity issue
❌ Cannot reach backend        # Wrong IP or backend down
```

---

## Troubleshooting Matrix

| Symptom | Check | Fix |
|---------|-------|-----|
| "Failed to download" on app | Is backend running? | `python app.py` |
| App gets timeout | Is firewall blocking? | Allow port 5000 |
| Wrong IP detected | Is phone connected via USB? | Connect USB cable |
| "Cannot reach 192.168.x.x" | Is phone on same WiFi? | Connect to same WiFi |
| Backend crashes | Are models loaded? | Check Models/ folder |
| Prediction shows "Unknown" | Check treatment JSON | See diseases-treatment.json |

---

## Performance Expectations

- App load: 2-3 seconds
- Photo upload: 3-5 seconds
- Disease prediction: 5-10 seconds (depends on model)
- Result display: <1 second

If slower:
1. Check backend CPU usage
2. Reduce image resolution before upload
3. Use production WSGI server (gunicorn)

---

## Success Confirmation

```
✅ All phases complete
✅ App connects without "Failed to download" error
✅ Photo uploads work
✅ Predictions display
✅ History saves
✅ Logs show correct IP being used

🎉 Issue is FIXED!
```

---

## Still Having Issues?

1. **Read:** [ADVANCED_TROUBLESHOOTING.md](ADVANCED_TROUBLESHOOTING.md)
2. **Collect:**
   - Full backend error output (copy/paste terminal)
   - App console logs (`adb logcat`)
   - Your PC IP address
   - Phone IP address (`adb shell ifconfig`)
3. **Check:** Firewall rules are correct
4. **Verify:** Both devices on same WiFi

