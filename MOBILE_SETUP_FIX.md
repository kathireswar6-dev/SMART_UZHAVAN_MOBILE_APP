5DFIKJUVY # 🔧 Mobile Real Device Connection - Troubleshooting Guide

## Problem
Your real mobile device shows "Failed to download remote update" with `java.io.IOException` when trying to connect to the backend.

## Root Causes Identified

### 1. **Hardcoded Backend Path Issue** 
`backend/app.py` line 35:
```python
BASE_DIR = r"K:\MyProject\crop-disease-app\backend"  # ❌ Wrong path on your system
```

### 2. **Backend Not Running or Accessible**
The Flask backend must be running and accessible from your phone's network.

### 3. **API URL Resolution Problem**
`app/api.ts` uses heuristics that may not work correctly on real devices.

---

## Solution Steps

### Step 1: Fix Backend Path
Edit `backend/app.py` and change the BASE_DIR to your actual project path:

**Current (Line 35):**
```python
BASE_DIR = r"K:\MyProject\crop-disease-app\backend"
```

**Replace with:**
```python
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # ✅ Auto-detect current directory
```

### Step 2: Configure Backend for Real Devices

Your backend needs to accept connections from your phone's IP address. 

**Option A: Find Your PC's IP Address**
```bash
# Windows - Open Command Prompt and run:
ipconfig

# Look for "IPv4 Address" - should be something like 192.168.1.100
```

**Option B: Configure Flask to Accept All Connections**
Edit `backend/app.py` at the end (around line 840+):

Replace:
```python
if __name__ == '__main__':
    app.run(debug=True)
```

With:
```python
if __name__ == '__main__':
    # Accept connections from any IP on port 5000
    app.run(host='0.0.0.0', port=5000, debug=False)
```

### Step 3: Update Mobile App to Use Correct Backend URL

Edit `app/api.ts` and modify the `resolveBaseUrl()` function:

**Replace the entire function with:**
```typescript
function resolveBaseUrl() {
  // 1. Check environment variable first
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;

  // 2. For Web
  if (typeof window !== 'undefined') {
    try {
      const origin = window.location.origin;
      if (origin && origin.startsWith('http')) return `${origin}`;
    } catch (e) {}
    return 'http://localhost:5000';
  }

  // 3. For Real Android Devices - Use your PC's actual IP
  if (Platform.OS === 'android') {
    // ⚠️ IMPORTANT: Replace with your PC's IP address (from ipconfig)
    // Example: '192.168.1.100' or '10.0.0.50'
    const YOUR_PC_IP = '192.168.1.100'; // 👈 CHANGE THIS!
    return `http://${YOUR_PC_IP}:5000`;
  }

  // 4. For iOS Simulator
  if (Platform.OS === 'ios') {
    return 'http://localhost:5000';
  }

  return 'http://10.0.2.2:5000';
}
```

**For Testing Locally:**
Replace `YOUR_PC_IP` with your actual PC IP from `ipconfig` command.

### Step 4: Ensure Backend Permissions (Windows Firewall)

Windows Firewall may block the backend:

1. **Open Windows Defender Firewall**
2. **Go to: Advanced Settings → Inbound Rules → New Rule**
3. **Create rule:**
   - Rule Type: Port
   - TCP, Port: 5000
   - Action: Allow
   - Apply to: Domain, Private, Public

Or run in PowerShell as Admin:
```powershell
New-NetFirewallRule -DisplayName "Allow Backend Port 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

### Step 5: Start the Backend Server

```bash
cd c:\Flutter_Projects\MyProject\backend

# Install dependencies (if not done):
pip install -r requirements.txt

# Run the server:
python app.py
```

You should see:
```
✅ Server running on port 5000
WARNING in app.runserver: This is a development server...
```

### Step 6: Verify Backend Accessibility

**From Windows Command Prompt:**
```bash
# Get your IP
ipconfig

# Test if port 5000 responds (replace 192.168.1.100 with your IP)
curl http://192.168.1.100:5000/
```

Should return: `<h1>Backend is Running!</h1>`

### Step 7: Rebuild and Test Mobile App

```bash
# Clear any old builds
cd c:\Flutter_Projects\MyProject
npm run reset-project

# Rebuild for Android
npm run android

# Or if already installed, restart:
npx expo start --android
```

---

## Network Connection Checklist

- [ ] Backend Python server is running (`python app.py`)
- [ ] No Windows Firewall blocking port 5000
- [ ] Phone and PC are on the **same WiFi network**
- [ ] You've replaced `YOUR_PC_IP` in `api.ts` with your actual IP
- [ ] `app.py` runs with `host='0.0.0.0'` (accepts all connections)
- [ ] Backend path in `app.py` is correct: `BASE_DIR = os.path.dirname(os.path.abspath(__file__))`

---

## Testing Quick Steps

1. **On PC:** `python backend/app.py`
2. **Get PC IP:** Run `ipconfig` → copy IPv4 Address
3. **On Mobile:** Edit `app/api.ts` → Update IP
4. **Rebuild:** `npm run android`
5. **Open App** → Should load without "Failed to download" error

---

## If Still Getting Error

**Check these in order:**
1. Is backend running? (see terminal output)
2. Is phone on same WiFi as PC?
3. Can you ping your PC from phone?
4. Is Windows Firewall blocking?
5. Is the IP address correct in `api.ts`?
6. Check backend logs for detailed error

