"""
Project Service with MongoDB Integration
"""
import uuid
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException, status
from database.mongo_config import get_db
from database.models import (
    Project, ProjectCreate, ProjectUpdate, ProjectResponse, 
    AgentConfig, User
)

class ProjectService:
    @staticmethod
    def generate_client_id() -> str:
        """Generate unique client ID"""
        return f"client_{uuid.uuid4().hex[:12]}"
    
    @staticmethod
    async def create_project(user_id: str, project_data: ProjectCreate) -> ProjectResponse:
        """Create a new project"""
        db = get_db()
        
        # Generate unique client_id
        client_id = ProjectService.generate_client_id()
        
        # Ensure client_id is unique
        while await db.projects.find_one({"client_id": client_id}):
            client_id = ProjectService.generate_client_id()
        
        # Create project document
        project_dict = {
            "user_id": user_id,
            "name": project_data.name,
            "description": project_data.description,
            "client_id": client_id,
            "agent_config": (project_data.agent_config or AgentConfig()).dict(),
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        # Insert project
        result = await db.projects.insert_one(project_dict)
        project_dict["_id"] = result.inserted_id
        
        project = Project(**project_dict)
        return ProjectService.project_to_response(project)
    
    @staticmethod
    async def get_user_projects(user_id: str) -> List[ProjectResponse]:
        """Get all projects for a user"""
        db = get_db()
        
        cursor = db.projects.find({
            "user_id": user_id,
            "is_active": True
        }).sort("created_at", -1)
        
        projects = []
        async for project_doc in cursor:
            project = Project(**project_doc)
            projects.append(ProjectService.project_to_response(project))
        
        return projects
    
    @staticmethod
    async def get_project_by_id(user_id: str, project_id: str) -> Optional[ProjectResponse]:
        """Get project by ID (must belong to user)"""
        db = get_db()
        
        try:
            project_doc = await db.projects.find_one({
                "_id": ObjectId(project_id),
                "user_id": user_id,
                "is_active": True
            })
            
            if project_doc:
                project = Project(**project_doc)
                return ProjectService.project_to_response(project)
        except Exception:
            pass
        
        return None
    
    @staticmethod
    async def get_project_by_client_id(client_id: str) -> Optional[Project]:
        """Get project by client_id (for API access)"""
        db = get_db()
        
        project_doc = await db.projects.find_one({
            "client_id": client_id,
            "is_active": True
        })
        
        if project_doc:
            return Project(**project_doc)
        return None
    
    @staticmethod
    async def update_project(user_id: str, project_id: str, updates: ProjectUpdate) -> Optional[ProjectResponse]:
        """Update project"""
        db = get_db()
        
        # Prepare update data
        update_data = {"updated_at": datetime.utcnow()}
        
        if updates.name is not None:
            update_data["name"] = updates.name
        if updates.description is not None:
            update_data["description"] = updates.description
        if updates.agent_config is not None:
            update_data["agent_config"] = updates.agent_config.dict()
        
        try:
            # Update project
            result = await db.projects.update_one(
                {
                    "_id": ObjectId(project_id),
                    "user_id": user_id,
                    "is_active": True
                },
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                # Return updated project
                return await ProjectService.get_project_by_id(user_id, project_id)
        except Exception:
            pass
        
        return None
    
    @staticmethod
    async def delete_project(user_id: str, project_id: str) -> bool:
        """Delete project (soft delete)"""
        db = get_db()
        
        try:
            result = await db.projects.update_one(
                {
                    "_id": ObjectId(project_id),
                    "user_id": user_id,
                    "is_active": True
                },
                {
                    "$set": {
                        "is_active": False,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
        except Exception:
            return False
    
    @staticmethod
    def project_to_response(project: Project) -> ProjectResponse:
        """Convert Project model to ProjectResponse"""
        return ProjectResponse(
            id=str(project.id),
            user_id=project.user_id,
            name=project.name,
            description=project.description,
            client_id=project.client_id,
            agent_config=project.agent_config,
            is_active=project.is_active,
            created_at=project.created_at,
            updated_at=project.updated_at
        )

import json
from typing import Dict, Optional, Any
from dataclasses import dataclass


@dataclass
class AgentConfig:
    welcome_message: str
    system_prompt: str
    llm_model: str
    temperature: float
    max_tokens: Optional[int] = None
    top_p: Optional[float] = None


@dataclass  
class Project:
    id: str
    name: str
    description: Optional[str]
    user_id: str
    created_at: str
    updated_at: str
    agent_config: AgentConfig


class ProjectService:
    def __init__(self):
        # In a real implementation, this would be a database
        # For now, we'll use a simple in-memory store
        self.projects: Dict[str, Project] = {}
        self._load_mock_data()
    
    def _load_mock_data(self):
        """Load some mock project data for demonstration"""
        mock_projects = [
            {
                "id": "proj_demo_1",
                "name": "Customer Support Assistant",
                "description": "AI assistant for customer support inquiries",
                "user_id": "user_1",
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-15T10:00:00Z",
                "agent_config": {
                    "welcome_message": "Hello! I'm your customer support assistant. How can I help you today?",
                    "system_prompt": "You are a helpful customer support agent. Be polite, professional, and try to resolve customer issues efficiently. If you cannot help with something, politely escalate to a human agent.",
                    "llm_model": "gpt-3.5-turbo",
                    "temperature": 0.3,
                    "max_tokens": 1000,
                    "top_p": 1.0
                }
            },
            {
                "id": "proj_demo_2", 
                "name": "Sales Assistant",
                "description": "AI assistant to help with sales inquiries and product information",
                "user_id": "user_1",
                "created_at": "2024-01-16T14:30:00Z",
                "updated_at": "2024-01-16T14:30:00Z",
                "agent_config": {
                    "welcome_message": "Hi there! I'm here to help you find the perfect product. What are you looking for today?",
                    "system_prompt": "You are a knowledgeable sales assistant. Help customers find products that meet their needs, provide detailed product information, and guide them through the purchase process. Be enthusiastic but not pushy.",
                    "llm_model": "gpt-4",
                    "temperature": 0.7,
                    "max_tokens": 1200,
                    "top_p": 0.9
                }
            },
            {
                "id": "proj_demo_3",
                "name": "Technical Support Bot",
                "description": "Specialized assistant for technical troubleshooting",
                "user_id": "user_1", 
                "created_at": "2024-01-17T09:15:00Z",
                "updated_at": "2024-01-17T09:15:00Z",
                "agent_config": {
                    "welcome_message": "Hello! I'm your technical support assistant. Please describe the issue you're experiencing.",
                    "system_prompt": "You are a technical support specialist. Help users troubleshoot technical issues with clear, step-by-step instructions. Ask clarifying questions when needed and provide accurate technical information.",
                    "llm_model": "gpt-4-turbo",
                    "temperature": 0.2,
                    "max_tokens": 1500,
                    "top_p": 1.0
                }
            }
        ]
        
        for proj_data in mock_projects:
            agent_config = AgentConfig(**proj_data["agent_config"])
            project = Project(
                id=proj_data["id"],
                name=proj_data["name"],
                description=proj_data["description"],
                user_id=proj_data["user_id"],
                created_at=proj_data["created_at"],
                updated_at=proj_data["updated_at"],
                agent_config=agent_config
            )
            self.projects[project.id] = project
    
    def get_project(self, project_id: str) -> Optional[Project]:
        """Get a project by its ID"""
        return self.projects.get(project_id)
    
    def get_project_config(self, project_id: str) -> Optional[AgentConfig]:
        """Get agent configuration for a project"""
        project = self.get_project(project_id)
        return project.agent_config if project else None
    
    def get_welcome_message(self, project_id: str) -> str:
        """Get the welcome message for a project"""
        project = self.get_project(project_id)
        if project and project.agent_config.welcome_message:
            return project.agent_config.welcome_message
        return "Hello! How can I help you today?"
    
    def list_projects(self, user_id: Optional[str] = None) -> list[Project]:
        """List all projects, optionally filtered by user_id"""
        if user_id:
            return [p for p in self.projects.values() if p.user_id == user_id]
        return list(self.projects.values())
    
    def create_project(self, project_data: Dict[str, Any]) -> Project:
        """Create a new project (demo implementation)"""
        # In a real implementation, this would save to database
        agent_config = AgentConfig(**project_data["agent_config"])
        project = Project(
            id=project_data["id"],
            name=project_data["name"],
            description=project_data.get("description"),
            user_id=project_data["user_id"],
            created_at=project_data["created_at"],
            updated_at=project_data["updated_at"],
            agent_config=agent_config
        )
        self.projects[project.id] = project
        return project
    
    def update_project_config(self, project_id: str, config_data: Dict[str, Any]) -> bool:
        """Update project agent configuration"""
        project = self.get_project(project_id)
        if not project:
            return False
            
        # Update agent config
        for key, value in config_data.items():
            if hasattr(project.agent_config, key):
                setattr(project.agent_config, key, value)
        
        return True


# Global instance
project_service = ProjectService()
