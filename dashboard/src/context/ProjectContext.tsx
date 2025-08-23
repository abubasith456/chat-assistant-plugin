import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Project, CreateProjectData, AgentConfig } from '../types';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  createProject: (data: CreateProjectData) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (project: Project) => void;
  fetchProjects: () => Promise<void>;
  updateAgentConfig: (projectId: string, config: AgentConfig) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock projects for demo
      const mockProjects: Project[] = JSON.parse(localStorage.getItem('user_projects') || '[]');
      
      setProjects(mockProjects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (data: CreateProjectData): Promise<Project> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newProject: Project = {
        id: 'proj_' + Date.now(),
        name: data.name,
        description: data.description,
        userId: '1', // TODO: Get from auth context
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        agentConfig: data.agentConfig,
      };
      
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      
      // Store in localStorage for demo
      localStorage.setItem('user_projects', JSON.stringify(updatedProjects));
      
      return newProject;
    } catch (error) {
      throw new Error('Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (id: string, data: Partial<Project>): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedProjects = projects.map(project =>
        project.id === id
          ? { ...project, ...data, updatedAt: new Date().toISOString() }
          : project
      );
      
      setProjects(updatedProjects);
      localStorage.setItem('user_projects', JSON.stringify(updatedProjects));
      
      // Update current project if it's the one being updated
      if (currentProject?.id === id) {
        setCurrentProject({ ...currentProject, ...data, updatedAt: new Date().toISOString() });
      }
    } catch (error) {
      throw new Error('Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedProjects = projects.filter(project => project.id !== id);
      setProjects(updatedProjects);
      localStorage.setItem('user_projects', JSON.stringify(updatedProjects));
      
      // Clear current project if it's the one being deleted
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    } catch (error) {
      throw new Error('Failed to delete project');
    } finally {
      setIsLoading(false);
    }
  };

  const selectProject = (project: Project): void => {
    setCurrentProject(project);
    localStorage.setItem('current_project', JSON.stringify(project));
  };

  const updateAgentConfig = async (projectId: string, config: AgentConfig): Promise<void> => {
    await updateProject(projectId, { agentConfig: config });
  };

  const value: ProjectContextType = {
    projects,
    currentProject,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    fetchProjects,
    updateAgentConfig,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
