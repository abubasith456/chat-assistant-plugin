"""
Simplified Database Models for MongoDB Collections
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr, ConfigDict

class AgentConfig(BaseModel):
    welcome_message: str = "Hello! How can I help you today?"
    system_prompt: str = "You are a helpful assistant."
    llm_model: str = "gpt-3.5-turbo"
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    top_p: Optional[float] = None
    frequency_penalty: Optional[float] = None
    presence_penalty: Optional[float] = None

class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    
    id: str = Field(alias="_id")
    name: str
    email: EmailStr
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

class Project(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    
    id: str = Field(alias="_id")
    user_id: str
    name: str
    description: str = ""
    client_id: str
    agent_config: AgentConfig = Field(default_factory=AgentConfig)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None

class ChatSession(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    
    id: str = Field(alias="_id")
    project_id: str
    session_id: str
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
