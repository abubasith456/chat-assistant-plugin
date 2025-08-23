# WebSocket Integration Guide for Hugging Face Deployment

Your backend is now deployed on Hugging Face Spaces!

**Base URL:** `https://abubasith86-chat-agent-plugin.hf.space`

**WebSocket URL:** `wss://abubasith86-chat-agent-plugin.hf.space/ws/{client_id}`

## Available Endpoints

| Endpoint | URL | Description |
|----------|-----|-------------|
| API Info | `https://abubasith86-chat-agent-plugin.hf.space/` | Basic API information |
| Status | `https://abubasith86-chat-agent-plugin.hf.space/status` | Server status and model config |
| Health | `https://abubasith86-chat-agent-plugin.hf.space/health` | Health check |
| WebSocket | `wss://abubasith86-chat-agent-plugin.hf.space/ws/user123` | Real-time chat |

## JavaScript Integration

### Vanilla JavaScript
```javascript
// Connect to your Hugging Face WebSocket
const ws = new WebSocket('wss://abubasith86-chat-agent-plugin.hf.space/ws/user123');

ws.onopen = function() {
    console.log('Connected to Hugging Face backend!');
};

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Received:', data);
    
    if (data.type === 'typing') {
        // Show typing indicator
        showTypingIndicator();
    } else if (data.type === 'assistant') {
        // Hide typing and show response
        hideTypingIndicator();
        displayMessage(data.message, 'bot');
    }
};

// Send a message
function sendMessage(message) {
    ws.send(JSON.stringify({
        message: message,
        user_id: "web_user",
        session_id: "web_session"
    }));
}
```

### React Integration
```jsx
const WS_URL = 'wss://abubasith86-chat-agent-plugin.hf.space/ws/';

useEffect(() => {
    if (isOpen) {
        // Connect to Hugging Face WebSocket
        ws.current = new WebSocket('wss://abubasith86-chat-agent-plugin.hf.space/ws/react_user');
        
        ws.current.onopen = () => {
            console.log('Connected to Hugging Face backend');
            setIsConnected(true);
        };
        
        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'typing') {
                setIsTyping(true);
            } else if (data.type === 'assistant') {
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: data.message,
                    sender: 'bot',
                    timestamp: new Date()
                }]);
            }
        };
    }
}, [isOpen]);
```

## Testing

### Quick API Test
```bash
# Test API endpoint
curl "https://abubasith86-chat-agent-plugin.hf.space/"

# Check status
curl "https://abubasith86-chat-agent-plugin.hf.space/status"

# Health check
curl "https://abubasith86-chat-agent-plugin.hf.space/health"
```

### WebSocket Test
```bash
python test_codespace.py
```

## Frontend Configuration

Update your frontend to use the production URL:
```javascript
const BACKEND_WS_URL = 'wss://abubasith86-chat-agent-plugin.hf.space/ws/';
```

## Important Notes

1. **URL Stability**: Hugging Face URLs are stable and don't change
2. **HTTPS Required**: Hugging Face uses HTTPS, so WebSocket must use WSS
3. **No Authentication**: Currently open for testing
4. **CORS**: Already configured for all origins
5. **Auto-scaling**: Hugging Face automatically manages the server

## Features Available

- ✅ Real-time WebSocket chat
- ✅ Nvidia OpenAI LLM integration
- ✅ Typing indicators
- ✅ Message history
- ✅ Health monitoring
- ✅ CORS enabled
- ✅ Auto-scaling
- ✅ 24/7 availability
