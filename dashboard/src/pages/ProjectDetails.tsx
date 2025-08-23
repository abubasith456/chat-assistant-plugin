import { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Project, AgentConfig } from '../types';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
}

export default function ProjectDetails({ projectId, onBack }: ProjectDetailsProps) {
  const { projects, updateAgentConfig, isLoading } = useProjects();
  const [project, setProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedConfig, setEditedConfig] = useState<AgentConfig | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const foundProject = projects.find(p => p.id === projectId);
    if (foundProject) {
      setProject(foundProject);
      setEditedConfig(foundProject.agentConfig);
    }
  }, [projectId, projects]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
    if (!isEditing && project) {
      setEditedConfig(project.agentConfig);
    }
  };

  const handleSave = async () => {
    if (!project || !editedConfig) return;

    setError('');
    try {
      await updateAgentConfig(project.id, editedConfig);
      setProject({ ...project, agentConfig: editedConfig });
      setIsEditing(false);
      setSuccess('Agent configuration updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update configuration');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editedConfig) return;

    const { name, value } = e.target;
    setEditedConfig({
      ...editedConfig,
      [name]: name === 'temperature' || name === 'topP' || name === 'maxTokens' 
        ? parseFloat(value) || 0 
        : value,
    });
  };

  if (!project) {
    return (
      <Layout title="Project Details">
        <div className="text-center py-12">
          <p className="text-gray-500">Project not found</p>
          <button
            onClick={onBack}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            ← Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={project.name}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="mt-2 text-gray-600">{project.description}</p>
              )}
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <span>Project ID: {project.id}</span>
                <span className="mx-2">•</span>
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleEditToggle}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="h-4 w-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Configuration
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-green-800 text-sm">{success}</div>
          </div>
        )}

        {/* Agent Configuration */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Agent Configuration</h2>
            <p className="mt-1 text-sm text-gray-500">
              Configure how your AI assistant behaves and responds to users
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Welcome Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Message
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="welcomeMessage"
                  value={editedConfig?.welcomeMessage || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {project.agentConfig.welcomeMessage}
                </p>
              )}
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt
              </label>
              {isEditing ? (
                <textarea
                  name="systemPrompt"
                  rows={6}
                  value={editedConfig?.systemPrompt || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                  {project.agentConfig.systemPrompt}
                </p>
              )}
            </div>

            {/* Model Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LLM Model
                </label>
                {isEditing ? (
                  <select
                    name="llmModel"
                    value={editedConfig?.llmModel || ''}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                  </select>
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {project.agentConfig.llmModel}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="temperature"
                    min="0"
                    max="2"
                    step="0.1"
                    value={editedConfig?.temperature || 0}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {project.agentConfig.temperature}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="maxTokens"
                    min="1"
                    max="4000"
                    value={editedConfig?.maxTokens || 0}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {project.agentConfig.maxTokens || 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Top P
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="topP"
                    min="0"
                    max="1"
                    step="0.1"
                    value={editedConfig?.topP || 0}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {project.agentConfig.topP || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Integration Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Integration</h3>
          <p className="text-blue-800 text-sm mb-4">
            Use this Project ID to integrate your AI assistant into your application:
          </p>
          <div className="bg-white border border-blue-200 rounded-md p-3">
            <code className="text-sm font-mono text-blue-900">{project.id}</code>
            <button
              onClick={() => navigator.clipboard.writeText(project.id)}
              className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Copy
            </button>
          </div>
          <p className="text-blue-700 text-xs mt-2">
            Pass this ID as the client_id parameter when connecting to the WebSocket or API.
          </p>
        </div>
      </div>
    </Layout>
  );
}
