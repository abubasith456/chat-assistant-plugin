"""
FastAPI WebSocket Chat Server with Nvidia OpenAI LLM
Clean architecture with separated services
"""

import logging
import os
from datetime import datetime

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Import our services
from app_config import app_config
from services import AgentService, ConnectionManager, WebSocketHandler

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize services
agent_service = AgentService()
connection_manager = ConnectionManager()
websocket_handler = WebSocketHandler(connection_manager, agent_service)

# Initialize FastAPI app
app = FastAPI(
    title="Chat Assistant Backend",
    description="WebSocket-based chat server with Nvidia OpenAI LLM",
    version="1.0.0",
)

# CORS middleware for frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Validate configuration
if not app_config.api_key:
    logger.warning("API_KEY not found. Please set environment variable.")


# Models
class StatusResponse(BaseModel):
    status: str
    timestamp: str
    active_connections: int
    model: str
    model_settings: dict
    connection_stats: dict


class ChatMessage(BaseModel):
    message: str
    user_id: str = "anonymous"
    session_id: str = "default"


# API Routes
@app.get("/")
async def root():
    return {
        "message": "Chat Assistant Backend API",
        "version": "1.0.0",
        "endpoints": {"status": "/status", "websocket": "/ws/{client_id}"},
    }


@app.get("/status", response_model=StatusResponse)
async def get_status():
    """Health check and status endpoint with connection statistics"""
    connection_stats = connection_manager.get_connection_stats()
    conversation_stats = websocket_handler.get_conversation_stats()
    
    return StatusResponse(
        status="online",
        timestamp=datetime.now().isoformat(),
        active_connections=len(connection_manager.active_connections),
        model=app_config.model,
        model_settings={
            "temperature": app_config.model_temperature,
            "max_tokens": app_config.model_max_tokens,
            "top_p": app_config.model_top_p,
            "base_url": app_config.base_url,
        },
        connection_stats={
            **connection_stats,
            **conversation_stats
        }
    )


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time chat with automatic timezone detection"""
    
    await connection_manager.connect(websocket, client_id)
    
    try:
        while True:
            # Receive message from client
            raw_message = await websocket.receive_text()
            
            # Handle the message using our WebSocket handler
            await websocket_handler.handle_message(websocket, client_id, raw_message)
            
    except WebSocketDisconnect:
        connection_manager.disconnect(client_id)
        websocket_handler.cleanup_client_history(client_id)
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {str(e)}")
        connection_manager.disconnect(client_id)
        websocket_handler.cleanup_client_history(client_id)


# Health check endpoint
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
