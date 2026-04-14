# 🚀 Quick Start - Fix in 5 Minutes

## Error You're Getting
```
❌ Failed to download remote update
❌ java.io.IOException: [Error Message]
```

## What I Fixed
✅ Backend path issue  
✅ Network detection for real devices  
✅ Better error messages  

---

## 5-Minute Fix

### Step 1: Start Backend Server
```bash
# Open Command Prompt
cd c:\Flutter_Projects\MyProject\backend
python app.py
```

**Wait until you see:**
```
🚀🚀 MODEL READY FOR PREDICTIONS!
Running on http://0.0.0.0:5000
```

### Step 2: Get Your PC's IP
```bash
# In a new Command Prompt
ipconfig
```

**Look for:** `IPv4 Address: 192.168.x.x` or `10.0.x.x`
(Save this number - you'll need it)

### Step 3: Enable USB Debugging on Phone
1. Settings → About Phone
2. Tap "Build Number" 7 times
3. Settings → Developer Options
4. Turn ON "USB Debugging"
5. Connect phone via USB to PC
6. Tap "Allow" on phone when prompted

### Step 4: Verify Device Connection
```bash
adb devices
```

**Should show your device:**
```
List of attached devices
ABC123XYZ    device
```

### Step 5: Rebuild App
```bash
# In another Command Prompt
cd c:\Flutter_Projects\MyProject
npx expo start --android
```

**Watch the console - you should see:**
```
[API] Android debuggerHost: 192.168.1.100:19000
[API] Using detected PC IP from real device: http://192.168.1.100:5000
```

---

## ✅ Done!

The app should now:
- ✅ Connect to your PC backend
- ✅ Load without "Failed to download" error
- ✅ Allow photo uploads for disease detection
- ✅ Show prediction results

---

## If Still Having Issues

### Check #1: Is Backend Running?
```bash
curl http://localhost:5000/
# Should return: <h1>Backend is Running!</h1>
```

### Check #2: Is Firewall Allowing Port 5000?

**Windows Firewall:**
```powershell
# Run as Admin:
New-NetFirewallRule -DisplayName "Flask Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

### Check #3: Is Device on Same WiFi?
- Check WiFi name on phone
- Check WiFi name on PC
- They MUST be identical

### Check #4: View App Logs
```bash
adb logcat | grep API
```

Should show your PC's IP address being used.

---

## Detailed Guides

- 📖 [Full Setup Guide](MOBILE_SETUP_FIX.md) - Step-by-step instructions
- 🔍 [Debug Reference](DEBUG_REAL_DEVICE.md) - Checking & testing
- 🔧 [Advanced Troubleshooting](ADVANCED_TROUBLESHOOTING.md) - Deep dive

---

**That's it!** Your app should work now. 🎉

