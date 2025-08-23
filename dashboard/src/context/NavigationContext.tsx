import { createContext, useContext, ReactNode } from 'react';

interface NavigationContextType {
  navigateToProject: (projectId: string) => void;
  navigateToDashboard: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
  onNavigateToProject: (projectId: string) => void;
  onNavigateToDashboard: () => void;
}

export function NavigationProvider({ 
  children, 
  onNavigateToProject, 
  onNavigateToDashboard 
}: NavigationProviderProps) {
  const value: NavigationContextType = {
    navigateToProject: onNavigateToProject,
    navigateToDashboard: onNavigateToDashboard,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
