import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  client_id: string;
  agent_config: {
    welcome_message: string;
    system_prompt: string;
    llm_model: string;
    temperature: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  createProject: (project: Omit<Project, 'id' | 'user_id' | 'client_id' | 'created_at' | 'updated_at' | 'is_active'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const projectsData = await response.json();
      setProjects(projectsData);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setError(error.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  // Load projects on mount
  useEffect(() => {
    refreshProjects();
  }, []);

  const createProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'client_id' | 'created_at' | 'updated_at' | 'is_active'>) => {
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: projectData.name,
          description: projectData.description,
          agent_config: projectData.agent_config,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create project');
      }

      const newProject = await response.json();
      setProjects(prev => [newProject, ...prev]);
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(error.message || 'Failed to create project');
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update project');
      }

      const updatedProject = await response.json();
      setProjects(prev => prev.map(project => 
        project.id === id ? updatedProject : project
      ));
    } catch (error: any) {
      console.error('Error updating project:', error);
      setError(error.message || 'Failed to update project');
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete project');
      }

      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (error: any) {
      console.error('Error deleting project:', error);
      setError(error.message || 'Failed to delete project');
      throw error;
    }
  };

  const getProject = (id: string) => {
    return projects.find(project => project.id === id);
  };

  const value = {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    refreshProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
