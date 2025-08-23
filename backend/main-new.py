"""
FastAPI Main Application with MongoDB Integration
"""
import os
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database.mongo_config import db_config
from api.auth import router as auth_router
from api.projects import router as projects_router
from services.websocket.connection_manager import ConnectionManager
from services.websocket.message_handler import MessageHandler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# WebSocket connection manager
connection_manager = ConnectionManager()
message_handler = MessageHandler(connection_manager)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    
    # Connect to MongoDB - will use environment variable or prompt for connection URL
    mongodb_url = os.getenv("MONGODB_URL")
    if not mongodb_url:
        print("\n" + "="*50)
        print("MONGODB CONNECTION REQUIRED")
        print("="*50)
        print("Please provide your MongoDB connection URL.")
        print("Example: mongodb+srv://username:password@cluster.mongodb.net/database")
        print("Or set MONGODB_URL environment variable")
        print("="*50)
        
        # For now, we'll use a default connection that will likely fail
        # This allows the app to start so you can provide the URL via API or environment
        mongodb_url = "mongodb://localhost:27017"
    
    # Try to connect to MongoDB
    connected = await db_config.connect_to_mongo(mongodb_url)
    if not connected:
        logger.warning("Failed to connect to MongoDB. Some features may not work.")
        logger.info("Please ensure MongoDB is running or provide a valid connection URL")
    else:
        logger.info("Successfully connected to MongoDB")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    await db_config.close_mongo_connection()

# Create FastAPI app with lifespan
app = FastAPI(
    title="Chat Assistant API",
    description="API for AI Chat Assistant with Project Management",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router)
app.include_router(projects_router)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Chat Assistant API", 
        "version": "1.0.0",
        "status": "running",
        "database_connected": db_config.is_connected()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database_connected": db_config.is_connected(),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/config/mongodb")
async def configure_mongodb(connection_data: dict):
    """Configure MongoDB connection at runtime"""
    connection_url = connection_data.get("mongodb_url")
    if not connection_url:
        raise HTTPException(status_code=400, detail="mongodb_url is required")
    
    try:
        connected = await db_config.connect_to_mongo(connection_url)
        if connected:
            return {"message": "MongoDB connected successfully", "status": "connected"}
        else:
            raise HTTPException(status_code=400, detail="Failed to connect to MongoDB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection error: {str(e)}")

# WebSocket endpoint for chat
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for chat communication"""
    await connection_manager.connect(websocket, client_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            await message_handler.handle_message(client_id, data)
            
    except WebSocketDisconnect:
        connection_manager.disconnect(client_id)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
