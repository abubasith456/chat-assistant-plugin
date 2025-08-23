# WebSocket Integration Guide for GitHub Codespaces

## 🔗 Your URLs

**Base URL:** `https://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev`

**WebSocket URL:** `wss://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev/ws/{client_id}`

## 📋 API Endpoints

| Endpoint | URL | Description |
|----------|-----|-------------|
| API Info | `https://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev/` | Basic API information |
| Status | `https://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev/status` | Server status and model config |
| Health | `https://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev/health` | Health check |
| WebSocket | `wss://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev/ws/user123` | Real-time chat |

## 🌐 Frontend Integration

### JavaScript WebSocket Client
```javascript
// Connect to your Codespace WebSocket
const ws = new WebSocket('wss://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev/ws/user123');

ws.onopen = function(event) {
    console.log('Connected to Codespace backend!');
};

ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    console.log('Received:', message);
    
    // Handle different message types
    switch(message.type) {
        case 'system':
            console.log('System:', message.message);
            break;
        case 'assistant':
            console.log('AI:', message.message);
            break;
        case 'typing':
            console.log('AI is typing...');
            break;
    }
};

// Send message
function sendMessage(text) {
    const message = {
        message: text,
        user_id: "frontend_user",
        session_id: "web_session"
    };
    ws.send(JSON.stringify(message));
}

// Example usage
sendMessage("Hello, how can you help me?");
```

### React Integration
```jsx
import React, { useState, useEffect, useRef } from 'react';

const ChatWidget = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const ws = useRef(null);
    
    useEffect(() => {
        // Connect to Codespace WebSocket
        ws.current = new WebSocket('wss://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev/ws/react_user');
        
        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setMessages(prev => [...prev, message]);
        };
        
        return () => ws.current.close();
    }, []);
    
    const sendMessage = () => {
        if (inputText.trim() && ws.current) {
            const message = {
                message: inputText,
                user_id: "react_user",
                session_id: "react_session"
            };
            ws.current.send(JSON.stringify(message));
            setInputText('');
        }
    };
    
    return (
        <div className="chat-widget">
            <div className="messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.type}`}>
                        <strong>{msg.sender}:</strong> {msg.message}
                    </div>
                ))}
            </div>
            <input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};
```

## 🧪 Testing Commands

### Test API Endpoints
```bash
# Test main endpoint
curl "https://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev/"

# Test status
curl "https://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev/status"

# Test health
curl "https://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev/health"
```

### Test WebSocket (Python)
```bash
cd backend
python test_codespace.py
```

## ⚙️ Update Your Frontend

Update your chat widget to use this WebSocket URL:

```javascript
// In your frontend configuration
const BACKEND_WS_URL = 'wss://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev/ws/';
```

## 🔒 Important Notes

1. **URL Changes**: If you restart Codespace, the URL might change
2. **HTTPS Required**: Codespaces uses HTTPS, so WebSocket must use WSS
3. **Client ID**: Replace `{client_id}` with a unique identifier for each user
4. **CORS**: Already configured for Codespace domains

## 🚀 Next Steps

1. **Test the WebSocket** using the Python test client
2. **Update your frontend** to use the WSS URL
3. **Add your Nvidia API key** to `.env` for AI responses
4. **Deploy your frontend** and connect to this backend
