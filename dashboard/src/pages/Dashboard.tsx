import { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
// import ProjectCard from '../components/ProjectCard';
// import CreateProjectModal from '../components/CreateProjectModal';

export default function Dashboard() {
  const { projects, isLoading, fetchProjects } = useProjects();
  const { user } = useAuth();
  const { navigateToProject } = useNavigation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  console.log('Dashboard render - isLoading:', isLoading, 'projects:', projects.length);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="mt-1 text-gray-600">
              Manage your AI assistant projects and configurations
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Project
          </button>
        </div>

        {/* Temporary simplified project list */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Projects</h2>
          {projects.length === 0 ? (
            <p className="text-gray-500">No projects found. Create your first project!</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.description}</p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => navigateToProject(project.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Temporary modal placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Create Project</h3>
              <p className="text-gray-600 mb-4">Project creation modal would go here.</p>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
