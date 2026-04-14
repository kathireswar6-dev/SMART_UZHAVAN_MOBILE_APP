# 📱 Real Mobile Device - Quick Debug Steps

## What I Fixed Automatically ✅

1. **Backend Path** - Changed hardcoded `K:\` path to auto-detect current directory
2. **API Logging** - Added detailed console logs to debug connection issues
3. **Error Messages** - Improved error messages to show why connection failed
4. **Network Detection** - Enhanced IP detection for real Android devices

---

## 🚀 Quick Start

### Step 1: Start Backend Server
```bash
cd c:\Flutter_Projects\MyProject\backend
python app.py
```

✅ You should see:
```
✅ SERVER RUNNING on http://0.0.0.0:5000
🚀🚀 MODEL READY FOR PREDICTIONS!
```

### Step 2: Get Your PC's IP Address
```bash
# Windows Command Prompt
ipconfig

# Look for: IPv4 Address: 192.168.x.x or 10.0.x.x
```

### Step 3: Connect Physical Device
- Plug Android device via USB cable
- Enable USB Debugging: Settings → Developer Options → USB Debugging ✅
- Ensure device is on **same WiFi network** as PC

### Step 4: Rebuild Mobile App
```bash
cd c:\Flutter_Projects\MyProject
npx expo start --android
```

### Step 5: Monitor Logs
The app should automatically detect your PC's IP from debugger and connect.

**Check the console output:**
```
[API] Android debuggerHost: 192.168.1.100:19000
[API] Using detected PC IP from real device: http://192.168.1.100:5000
[API] Sending prediction request to: http://192.168.1.100:5000/predict-disease
```

---

## 🔍 Debugging: If Still Getting "Failed to Download" Error

### Check #1: Is Backend Running?
```bash
# In another terminal:
curl http://localhost:5000/

# Should return: <h1>Backend is Running!</h1>
```

### Check #2: Can You Reach Backend from PC?
```bash
# Get your PC IP first (ipconfig)
# Then test it (replace 192.168.1.100 with your IP):
curl http://192.168.1.100:5000/

# Should return: <h1>Backend is Running!</h1>
```

### Check #3: Is Firewall Blocking?
```bash
# Allow port 5000 in Windows Firewall:
# Settings → Firewall → Advanced → Inbound Rules → New Rule
# Or PowerShell (Run as Admin):

New-NetFirewallRule -DisplayName "Flask Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

### Check #4: Phone & PC on Same Network?
- Open WiFi settings on phone
- Note the WiFi network name
- On PC, check which WiFi you're connected to
- They MUST be the same network

### Check #5: Is USB Debugging Enabled?
On your Android device:
1. Settings → About Phone
2. Tap Build Number 7 times (enables Developer Options)
3. Settings → Developer Options → USB Debugging → Enable

### Check #6: View App Logs
```bash
# While app is running, see console output:
adb logcat | grep -i "API\|Error\|Failed"

# Or specific logs:
adb logcat | grep "Backend\|http\|network"
```

---

## 📱 Manual Backend Configuration (Alternative)

If auto-detection fails, you can manually set the backend URL:

### Option A: Environment Variable
```bash
# Create/edit .env file in project root:
BACKEND_URL=http://192.168.1.100:5000
```

Then rebuild the app.

### Option B: Hardcoded (Not Recommended)
Edit `app/api.ts` function `resolveBaseUrl()`:
```typescript
if (Platform.OS === 'android') {
  // For testing - replace with your PC IP
  return 'http://192.168.1.100:5000';
}
```

---

## ✅ Success Indicators

When working correctly:
- ✅ App opens without "Failed to download" error
- ✅ Can take photo for disease detection
- ✅ Backend console shows: `"🔍 Result: ..."` 
- ✅ App displays crop/disease prediction with confidence score
- ✅ History saves to backend database

---

## 🆘 Still Not Working?

1. **Check Backend Logs:**
   - Look for red error messages in terminal
   - Copy full error and share it

2. **View Mobile Logs:**
   ```bash
   adb logcat > debug.log  # Capture all logs
   # Then check for [API] messages
   ```

3. **Test Backend Directly:**
   ```bash
   # From any device on your network:
   curl -X POST http://192.168.1.100:5000/crop-list
   ```

4. **Network Troubleshooting:**
   - Restart WiFi router
   - Disconnect VPN/Proxy
   - Try Ethernet tethering as fallback

