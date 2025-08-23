import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext-real';
import { ProjectProvider } from './context/ProjectContext-real';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard-simple';
import LoadingSpinner from './components/LoadingSpinner';

type AuthPage = 'login' | 'register' | 'forgot-password';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>('login');

  console.log('AppContent render - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  // Handle navigation
  const handleSwitchToRegister = () => setAuthPage('register');
  const handleSwitchToLogin = () => setAuthPage('login');
  const handleSwitchToForgotPassword = () => setAuthPage('forgot-password');

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show authentication pages if not authenticated
  if (!isAuthenticated) {
    console.log('Not authenticated, showing auth page:', authPage);
    
    if (authPage === 'register') {
      return <Register 
        onSwitchToLogin={handleSwitchToLogin} 
      />;
    }
    
    if (authPage === 'forgot-password') {
      return <ForgotPassword onSwitchToLogin={handleSwitchToLogin} />;
    }
    
    return <Login 
      onSwitchToRegister={handleSwitchToRegister} 
      onSwitchToForgotPassword={handleSwitchToForgotPassword}
    />;
  }

  console.log('Authenticated, rendering dashboard...');

  // Show app pages if authenticated
  return (
    <ProjectProvider>
      <Dashboard />
    </ProjectProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
