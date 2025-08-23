"""
FastAPI WebSocket Chat Server with Nvidia OpenAI LLM
Simple chat assistant backend with real-time messaging
"""

import json
import logging
import os
from datetime import datetime
from typing import Dict, List

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Chat Assistant Backend",
    description="WebSocket-based chat server with Nvidia OpenAI LLM",
    version="1.0.0"
)

# CORS middleware for frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Nvidia OpenAI client setup
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "nvidia/llama-3.1-nemotron-70b-instruct")

# Model parameters from environment
MODEL_TEMPERATURE = float(os.getenv("MODEL_TEMPERATURE", "0.7"))
MODEL_MAX_TOKENS = int(os.getenv("MODEL_MAX_TOKENS", "1024"))
MODEL_TOP_P = float(os.getenv("MODEL_TOP_P", "1.0"))

if not NVIDIA_API_KEY:
    logger.warning("NVIDIA_API_KEY not found. Please set environment variable.")

client = OpenAI(
    api_key=NVIDIA_API_KEY,
    base_url=NVIDIA_BASE_URL
) if NVIDIA_API_KEY else None

# Models
class StatusResponse(BaseModel):
    status: str
    timestamp: str
    nvidia_api_connected: bool
    active_connections: int
    model: str
    model_settings: dict

class ChatMessage(BaseModel):
    message: str
    user_id: str = "anonymous"
    session_id: str = "default"

# Connection manager for WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        
        # Close existing connection for this client if it exists
        if client_id in self.active_connections:
            try:
                old_ws = self.active_connections[client_id]
                if old_ws.client_state != websockets.ConnectionState.CLOSED:
                    await old_ws.close()
            except Exception as e:
                logger.warning(f"Error closing old connection for {client_id}: {e}")
        
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected. Total connections: {len(self.active_connections)}")
        
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected. Total connections: {len(self.active_connections)}")
            
    async def send_personal_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            await websocket.send_text(json.dumps(message))

# Initialize connection manager
manager = ConnectionManager()

# API Routes
@app.get("/")
async def root():
    return {
        "message": "Chat Assistant Backend API", 
        "version": "1.0.0",
        "endpoints": {
            "status": "/status",
            "websocket": "/ws/{client_id}"
        }
    }

@app.get("/status", response_model=StatusResponse)
async def get_status():
    """Health check and status endpoint"""
    return StatusResponse(
        status="online",
        timestamp=datetime.now().isoformat(),
        nvidia_api_connected=client is not None and NVIDIA_API_KEY is not None,
        active_connections=len(manager.active_connections),
        model=NVIDIA_MODEL,
        model_settings={
            "temperature": MODEL_TEMPERATURE,
            "max_tokens": MODEL_MAX_TOKENS,
            "top_p": MODEL_TOP_P,
            "base_url": NVIDIA_BASE_URL
        }
    )

async def get_llm_response(message: str, conversation_history: List[dict] = None) -> str:
    """Get response from Nvidia OpenAI LLM"""
    
    if not client:
        return "Sorry, the AI service is not available at the moment. Please check if NVIDIA_API_KEY is configured."
    
    try:
        # Prepare conversation context
        messages = [
            {
                "role": "system", 
                "content": "You are a helpful and friendly AI assistant. Keep your responses conversational, concise, and natural. Avoid using markdown formatting like **bold** or *italic*. Respond in a warm, human-like way as if you're having a casual conversation."
            }
        ]
        
        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history[-10:])  # Keep last 10 messages for context
            
        # Add current user message
        messages.append({"role": "user", "content": message})
        
        # Call Nvidia OpenAI API
        response = client.chat.completions.create(
            model=NVIDIA_MODEL,
            messages=messages,
            temperature=MODEL_TEMPERATURE,
            max_tokens=MODEL_MAX_TOKENS,
            top_p=MODEL_TOP_P,
            stream=False
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        logger.error(f"LLM API Error: {str(e)}")
        return f"Sorry, I encountered an error: {str(e)}"

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time chat"""
    
    await manager.connect(websocket, client_id)
    conversation_history = []
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                user_message = message_data.get("message", "")
                
                if not user_message.strip():
                    continue
                    
                logger.info(f"Received from {client_id}: {user_message}")
                
                # Echo user message back (optional, for UI confirmation)
                user_msg = {
                    "type": "user",
                    "message": user_message,
                    "timestamp": datetime.now().isoformat(),
                    "sender": "user"
                }
                await manager.send_personal_message(user_msg, client_id)
                
                # Add to conversation history
                conversation_history.append({"role": "user", "content": user_message})
                
                # Send typing indicator
                typing_msg = {
                    "type": "typing",
                    "message": "Assistant is typing...",
                    "timestamp": datetime.now().isoformat(),
                    "sender": "assistant"
                }
                await manager.send_personal_message(typing_msg, client_id)
                
                # Get LLM response
                ai_response = await get_llm_response(user_message, conversation_history)
                
                # Add AI response to conversation history
                conversation_history.append({"role": "assistant", "content": ai_response})
                
                # Send AI response
                ai_msg = {
                    "type": "assistant",
                    "message": ai_response,
                    "timestamp": datetime.now().isoformat(),
                    "sender": "assistant"
                }
                await manager.send_personal_message(ai_msg, client_id)
                
            except json.JSONDecodeError:
                error_msg = {
                    "type": "error",
                    "message": "Invalid message format. Please send valid JSON.",
                    "timestamp": datetime.now().isoformat(),
                    "sender": "system"
                }
                await manager.send_personal_message(error_msg, client_id)
                
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {str(e)}")
        manager.disconnect(client_id)

# Additional health check endpoint
@app.get("/health")
async def health_check():
    """Simple health check"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    # Get port from environment variable (for Hugging Face) or default to 8000
    port = int(os.getenv("PORT", 8000))
    
    # Run server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
