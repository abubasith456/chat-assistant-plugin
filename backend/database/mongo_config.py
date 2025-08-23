"""
MongoDB Database Configuration and Connection
"""
import os
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure
import logging

logger = logging.getLogger(__name__)

class DatabaseConfig:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.database: Optional[AsyncIOMotorDatabase] = None
        self.connection_url: Optional[str] = None
        self.database_name: str = "chat_assistant_db"
    
    async def connect_to_mongo(self, connection_url: str = None):
        """Connect to MongoDB"""
        try:
            if connection_url:
                self.connection_url = connection_url
            else:
                self.connection_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
            
            # Create MongoDB client
            self.client = AsyncIOMotorClient(
                self.connection_url,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
            )
            
            # Test the connection
            await self.client.admin.command('ping')
            logger.info("Successfully connected to MongoDB")
            
            # Get database
            self.database = self.client[self.database_name]
            
            # Create indexes
            await self._create_indexes()
            
            return True
            
        except ConnectionFailure as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error connecting to MongoDB: {e}")
            return False
    
    async def _create_indexes(self):
        """Create database indexes for better performance"""
        try:
            # Users collection indexes
            await self.database.users.create_index("email", unique=True)
            await self.database.users.create_index("created_at")
            
            # Projects collection indexes
            await self.database.projects.create_index("user_id")
            await self.database.projects.create_index("client_id", unique=True)
            await self.database.projects.create_index("created_at")
            
            # Chat history collection indexes
            await self.database.chat_history.create_index([("project_id", 1), ("created_at", -1)])
            await self.database.chat_history.create_index("session_id")
            
            logger.info("Database indexes created successfully")
            
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")
    
    async def close_mongo_connection(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")
    
    def get_database(self) -> AsyncIOMotorDatabase:
        """Get database instance"""
        if not self.database:
            raise RuntimeError("Database not connected. Call connect_to_mongo first.")
        return self.database
    
    def is_connected(self) -> bool:
        """Check if database is connected"""
        return self.database is not None

# Global database instance
db_config = DatabaseConfig()

# Convenience function to get database
def get_db() -> AsyncIOMotorDatabase:
    return db_config.get_database()
