import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import LoadingSpinner from './components/LoadingSpinner';

type AuthPage = 'login' | 'register' | 'forgot-password';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [appPage, setAppPage] = useState<AppPage>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  console.log('AppContent render - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  // Handle navigation
  const handleSwitchToRegister = () => setAuthPage('register');
  const handleSwitchToLogin = () => setAuthPage('login');
  const handleSwitchToForgotPassword = () => setAuthPage('forgot-password');
  
  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setAppPage('project-details');
  };
  
  const handleBackToDashboard = () => {
    setAppPage('dashboard');
    setSelectedProjectId('');
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    switch (authPage) {
      case 'register':
        return <Register onSwitchToLogin={handleSwitchToLogin} />;
      case 'forgot-password':
        return <ForgotPassword onSwitchToLogin={handleSwitchToLogin} />;
      default:
        return (
          <Login
            onSwitchToRegister={handleSwitchToRegister}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
          />
        );
    }
  }

  // Show app pages if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Assistant Dashboard
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Welcome, {isAuthenticated ? 'Authenticated User' : 'Guest'}!
          </h2>
          <p className="text-gray-600">
            Dashboard is working! Authentication status: {isAuthenticated ? 'Logged In' : 'Not Logged In'}
          </p>
          <button
            onClick={() => {
              // Add logout functionality here if needed
              console.log('Dashboard loaded successfully');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Button
          </button>
        </div>
      </div>
    </div>
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
