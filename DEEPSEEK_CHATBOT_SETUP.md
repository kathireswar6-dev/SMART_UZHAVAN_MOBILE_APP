# DeepSeek Chatbot Integration Setup

## ✅ What's Been Done

Your Smart Uzhavan app now has full DeepSeek AI chatbot integration! Here's what has been implemented:

### Backend Changes (`backend/app.py`)
- ✅ Added DeepSeek API client initialization
- ✅ Updated `/chat` endpoint to use DeepSeek as primary provider (with OpenAI fallback)
- ✅ Enhanced system prompt for agricultural assistance
- ✅ Added error handling and logging
- ✅ Added new dependencies to `requirements.txt`

### Frontend Changes
1. **Created** `app/chatbot.tsx` - Full-featured chatbot UI with:
   - Real-time message streaming
   - User/bot message bubbles with timestamps
   - Loading indicators
   - Keyboard handling
   - Dark/Light theme support
   - Responsive design

2. **Updated** `app/api.ts`:
   - Added `sendChatMessage()` function
   - Integrated with backend `/chat` endpoint

3. **Updated** `app/home.tsx`:
   - Added "AI Chatbot" button to home screen
   - Added navigation route to chatbot
   - Added translations support

## 🔧 Setup Required

### 1. Set Environment Variable
You need to add your DeepSeek API key to your environment:

**Option A: Using `.env` file (Backend)**
```bash
# In the backend directory, create/edit .env:
DEEPSEEK_API_KEY=sk_your_deepseek_api_key_here
```

**Option B: System Environment Variables**
```bash
# Windows PowerShell:
$env:DEEPSEEK_API_KEY = "sk_your_deepseek_api_key_here"

# Linux/Mac:
export DEEPSEEK_API_KEY="sk_your_deepseek_api_key_here"
```

### 2. Install Dependencies
```bash
# In backend directory:
pip install -r requirements.txt

# Make sure you have:
# - requests==2.31.0 (newly added)
```

### 3. Restart Backend Server
```bash
# Kill any running backend process
# Start fresh:
python app.py
```

## 🧪 Testing the Chatbot

### Test 1: Check Backend Setup
```bash
# Test health endpoint:
curl http://localhost:5000/

# Output should show backend is running
```

### Test 2: Manual Chat Test
```bash
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the best crop for sandy soil in summer?"}'

# Response should return AI-generated farming advice
```

### Test 3: App Testing
1. Make sure backend is running on port 5000
2. Open the app
3. Tap "AI Chatbot" button on home screen
4. Send a farming question
5. Get instant AI responses

## 🤖 Sample Prompts to Try

- "How do I prevent leaf spot in tomatoes?"
- "What crops grow well in black soil?"
- "How often should I irrigate rice crops?"
- "Which government schemes are available for organic farming?"
- "What's the best fertilizer for mango orchards?"
- "How do I identify early blight in potatoes?"

## 📊 Features

| Feature | Status | Details |
|---------|--------|---------|
| DeepSeek Integration | ✅ Active | Primary AI provider |
| OpenAI Fallback | ✅ Available | If OpenAI key is set |
| Fallback Mode | ✅ Built-in | Generic responses if no API key |
| Real-time Chat | ✅ Enabled | Instant AI responses |
| Multi-language | ✅ Ready | Uses app's language context |
| Dark Mode | ✅ Supported | Theme-aware UI |
| Message History | ✅ Stored | Shows chat history in session |
| Offline Fallback | ✅ Available | Basic responses without API |

## 🔐 Security Notes

- API key is stored in environment variables (never in code)
- Never commit `.env` file to git
- Rotate API keys periodically
- Monitor API usage via DeepSeek console: https://platform.deepseek.com

## 🐛 Troubleshooting

### "Chat is not responding"
1. Check if backend is running: `http://localhost:5000/`
2. Verify `DEEPSEEK_API_KEY` is set
3. Check backend logs for errors
4. If using fallback mode, check error messages

### "Network Error"
1. Ensure phone and PC are on same WiFi
2. Disable firewall temporarily for port 5000
3. Check backend console for connection errors

### "Invalid API Key"
1. Verify key is correct in environment
2. Check DeepSeek console for key status
3. Try generating a new key

## 📱 User Experience

Users visiting the app will now see:
1. **Home Screen** - New "AI Chatbot" button with 💬 icon
2. **Chat Screen** - Clean modern interface to chat with farming AI
3. **Quick Help** - Initial greeting explains capabilities
4. **Real-time Responses** - Get farming advice instantly

## 🚀 Next Steps (Optional)

Consider adding:
1. Chat history persistence (save to database)
2. Context awareness (remember user's crop/location)
3. Voice input support
4. Chat export functionality
5. Suggestion chips for quick prompts
6. Rate limiting per user
7. Analytics on popular questions

## 📞 Support

If you encounter issues:
1. Check the console logs in both frontend and backend
2. Verify environment variables are set
3. Ensure backend is accessible from your device
4. Test with the manual curl commands above
5. Check DeepSeek API status: https://status.deepseek.com

---

**Enjoy your new AI Farming Assistant! 🌾**
