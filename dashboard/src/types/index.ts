export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  agentConfig: AgentConfig;
}

export interface AgentConfig {
  welcomeMessage: string;
  systemPrompt: string;
  llmModel: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  agentConfig: AgentConfig;
}
