import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '../types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for stored auth on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_token');
      
      if (storedUser && token) {
        try {
          const user: User = JSON.parse(storedUser);
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (error) {
          // Clear invalid stored data
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user for demo
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        name: credentials.email.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      
      // Store auth data
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());
      
      setAuthState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user for demo
      const mockUser: User = {
        id: '1',
        email: data.email,
        name: data.name,
        createdAt: new Date().toISOString(),
      };
      
      // Store auth data
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());
      
      setAuthState({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw new Error('Registration failed. Please try again.');
    }
  };

  const logout = (): void => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const forgotPassword = async (email: string): Promise<void> => {
    // TODO: Replace with actual API call
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In real implementation, this would send a password reset email
    console.log('Password reset requested for:', email);
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
