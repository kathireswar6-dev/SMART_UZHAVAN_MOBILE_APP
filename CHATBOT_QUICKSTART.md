# 🚀 DeepSeek Chatbot - Quick Start

## What You Got
A fully functional AI farming chatbot integrated into your Smart Uzhavan app using **DeepSeek API**.

## 3 Quick Steps to Activate

### Step 1: Set Your API Key
```bash
# PowerShell (Windows):
$env:DEEPSEEK_API_KEY = "sk_your_actual_key_here"

# Linux/Mac:
export DEEPSEEK_API_KEY="sk_your_actual_key_here"
```

### Step 2: Restart Backend
```bash
# Kill current backend and restart:
cd c:\Flutter_Projects\MyProject\backend
python app.py
```

### Step 3: Open App & Chat
- Tap the new "💬 AI Chatbot" button on home screen
- Ask farming questions and get instant AI responses

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `backend/app.py` | Modified | Added DeepSeek client & updated /chat endpoint |
| `backend/requirements.txt` | Modified | Added `requests` package |
| `app/chatbot.tsx` | ✨ Created | Beautiful chat UI |
| `app/api.ts` | Modified | Added `sendChatMessage()` function |
| `app/home.tsx` | Modified | Added chatbot button to home screen |

## Test It Works
```bash
# Test command:
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"How do I grow tomatoes?\"}"
```

## Features
- ✅ Real-time AI responses
- ✅ Beautiful chat UI with themes
- ✅ Fallback mode if no API key
- ✅ Dark/light mode support
- ✅ Multi-language ready

## Troubleshooting
| Issue | Solution |
|-------|----------|
| "Chat not responding" | Check backend is running on port 5000 |
| "Invalid key" | Verify DEEPSEEK_API_KEY is set correctly |
| "Network error" | Phone and PC must be on same WiFi |

## Next Level Features (Optional)
- Save chat history to database
- Remember user's crop/location for context
- Add voice input
- Create quick-tip suggestions

---

**That's it! Your farming AI chatbot is ready. 🌾**

See `DEEPSEEK_CHATBOT_SETUP.md` for detailed documentation.
