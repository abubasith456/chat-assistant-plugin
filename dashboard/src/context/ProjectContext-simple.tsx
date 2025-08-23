import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Project {
  id: string;
  name: string;
  description: string;
  client_id: string;
  agent_config: {
    welcome_message: string;
    system_prompt: string;
    llm_model: string;
    temperature: number;
  };
  created_at: string;
  updated_at: string;
}

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'client_id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
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

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const isLoading = false; // No async operations in this simple version

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const generateClientId = () => 'client_' + Math.random().toString(36).substr(2, 9);

  const createProject = (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'client_id'>) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...projectData,
      id: generateId(),
      client_id: generateClientId(),
      created_at: now,
      updated_at: now,
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, ...updates, updated_at: new Date().toISOString() }
        : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const getProject = (id: string) => {
    return projects.find(project => project.id === id);
  };

  const value = {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    getProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
