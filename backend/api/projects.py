"""
API Endpoints for Project Management
"""
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from database.models import ProjectCreate, ProjectUpdate, ProjectResponse
from services.project_service import ProjectService
from api.auth import get_current_user_id

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.get("", response_model=List[ProjectResponse])
async def get_projects(user_id: str = Depends(get_current_user_id)):
    """Get all projects for the current user"""
    try:
        projects = await ProjectService.get_user_projects(user_id)
        return projects
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch projects: {str(e)}"
        )

@router.post("", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new project"""
    try:
        project = await ProjectService.create_project(user_id, project_data)
        return project
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}"
        )

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific project"""
    project = await ProjectService.get_project_by_id(user_id, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    updates: ProjectUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a project"""
    project = await ProjectService.update_project(user_id, project_id, updates)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a project"""
    success = await ProjectService.delete_project(user_id, project_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return {"message": "Project deleted successfully"}

@router.get("/client/{client_id}", response_model=ProjectResponse)
async def get_project_by_client_id(client_id: str):
    """Get project configuration by client_id (for widget integration)"""
    project = await ProjectService.get_project_by_client_id(client_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return ProjectService.project_to_response(project)
