"""
Database Models for MongoDB Collections
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class MongoBaseModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

class AgentConfig(BaseModel):
    welcome_message: str = "Hello! How can I help you today?"
    system_prompt: str = "You are a helpful assistant."
    llm_model: str = "gpt-3.5-turbo"
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    top_p: Optional[float] = None
    frequency_penalty: Optional[float] = None
    presence_penalty: Optional[float] = None

class User(MongoBaseModel):
    name: str
    email: EmailStr
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

class Project(MongoBaseModel):
    user_id: str  # Reference to user
    name: str
    description: str = ""
    client_id: str  # Unique client identifier for API access
    agent_config: AgentConfig = Field(default_factory=AgentConfig)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None

class ChatSession(MongoBaseModel):
    project_id: str  # Reference to project
    session_id: str  # Unique session identifier
    messages: List[ChatMessage] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

# Request/Response Models for API
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

class ProjectCreate(BaseModel):
    name: str
    description: str = ""
    agent_config: Optional[AgentConfig] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    agent_config: Optional[AgentConfig] = None

class ProjectResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: str
    client_id: str
    agent_config: AgentConfig
    is_active: bool
    created_at: datetime
    updated_at: datetime

class ChatMessageCreate(BaseModel):
    content: str
    session_id: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600
