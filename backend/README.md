# Chat Assistant Backend

FastAPI WebSocket server with Nvidia OpenAI LLM integration for real-time chat assistance.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your Nvidia API key
NVIDIA_API_KEY=your_nvidia_api_key_here
```

### 3. Run Server

**For GitHub Codespaces:**
```bash
# The port will be automatically forwarded
python main.py

# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**For Local Development:**
```bash
# Development mode (with auto-reload)
python main.py

# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Access Your Server

**In GitHub Codespaces:**
- Codespaces automatically forwards port 8000
- Look for the "Ports" tab in VS Code 
- Click on the forwarded port 8000 to access your API
- The URL will look like: `https://your-codespace-name-8000.preview.app.github.dev`

**Local Development:**
- Access at: `http://localhost:8000`

### 5. Test Server
```bash
# Check the main endpoint (shows API info)
curl https://your-codespace-url/

# Check status (replace with your actual Codespaces URL)
curl https://your-codespace-url/status

# Health check
curl https://your-codespace-url/health
```

## 📡 API Endpoints

### REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info and available endpoints |
| `/status` | GET | Server status and connection count |
| `/health` | GET | Simple health check |

### WebSocket Endpoint

| Endpoint | Protocol | Description |
|----------|----------|-------------|
| `/ws/{client_id}` | WebSocket | Real-time chat connection |

## 🔌 WebSocket Usage

### Connect to WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/user123');

ws.onopen = function(event) {
    console.log('Connected to chat server');
};

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log('Received:', message);
};

// Send message
ws.send(JSON.stringify({
    message: "Hello, how can you help me?",
    user_id: "user123",
    session_id: "session_abc"
}));
```

### Message Format

**Outgoing (Client → Server):**
```json
{
    "message": "Your question here",
    "user_id": "optional_user_id",
    "session_id": "optional_session_id"
}
```

**Incoming (Server → Client):**
```json
{
    "type": "assistant|user|system|typing|error",
    "message": "Response message",
    "timestamp": "2025-08-23T10:30:00",
    "sender": "assistant|user|system"
}
```

## 🤖 Nvidia OpenAI Integration

### Supported Models
- `nvidia/llama-3.1-nemotron-70b-instruct` (default)
- You can change the model in `main.py`

### API Configuration
```python
# In main.py
client = OpenAI(
    api_key=NVIDIA_API_KEY,
    base_url="https://integrate.api.nvidia.com/v1"
)
```

## ⚙️ Configuration

### Environment Variables
```bash
# Required
NVIDIA_API_KEY=your_nvidia_api_key

# Optional
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Server Settings
```python
# In main.py - modify these as needed
uvicorn.run(
    "main:app",
    host="0.0.0.0",      # Change for production
    port=8000,           # Change port if needed
    reload=True,         # Set to False for production
    log_level="info"
)
```

## 🔒 Production Deployment

### 1. Security Settings
```python
# Update CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific domains only
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### 2. Environment Variables
```bash
# Production .env
NVIDIA_API_KEY=your_production_key
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=https://yourdomain.com
```

### 3. Run with Gunicorn
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 🧪 Testing

### Test WebSocket Connection
```python
import asyncio
import websockets
import json

async def test_chat():
    uri = "ws://localhost:8000/ws/test_user"
    async with websockets.connect(uri) as websocket:
        # Send message
        await websocket.send(json.dumps({
            "message": "Hello, can you help me?",
            "user_id": "test_user"
        }))
        
        # Receive response
        response = await websocket.recv()
        print(json.loads(response))

asyncio.run(test_chat())
```

### Test Status Endpoint
```bash
curl -X GET http://localhost:8000/status
```

Expected response:
```json
{
    "status": "online",
    "timestamp": "2025-08-23T10:30:00",
    "nvidia_api_connected": true,
    "active_connections": 0
}
```

## 🛠️ Troubleshooting

### Common Issues

**1. Nvidia API Key Error:**
```bash
# Make sure your API key is valid
export NVIDIA_API_KEY="your_key_here"
```

**2. Port Already in Use:**
```bash
# Change port in main.py or kill existing process
lsof -ti:8000 | xargs kill -9
```

**3. CORS Issues:**
```python
# Update CORS origins in main.py
allow_origins=["http://localhost:3000", "your-frontend-url"]
```

## 📊 Features

✅ **WebSocket Real-time Chat** - Instant messaging  
✅ **Nvidia OpenAI LLM** - Powered by advanced AI models  
✅ **Connection Management** - Multiple concurrent users  
✅ **Conversation History** - Context-aware responses  
✅ **Typing Indicators** - Better UX feedback  
✅ **Error Handling** - Graceful error management  
✅ **Health Monitoring** - Status and health endpoints  
✅ **CORS Support** - Frontend integration ready  

## 📄 License

MIT License
