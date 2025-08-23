import { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { CreateProjectData, AgentConfig } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface CreateProjectModalProps {
  onClose: () => void;
}

export default function CreateProjectModal({ onClose }: CreateProjectModalProps) {
  const { createProject, isLoading } = useProjects();
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    description: '',
    agentConfig: {
      welcomeMessage: 'Hello! How can I help you today?',
      systemPrompt: 'You are a helpful AI assistant. Be friendly, informative, and concise in your responses.',
      llmModel: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1.0,
    },
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      await createProject(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('agentConfig.')) {
      const configKey = name.replace('agentConfig.', '') as keyof AgentConfig;
      setFormData({
        ...formData,
        agentConfig: {
          ...formData.agentConfig,
          [configKey]: configKey === 'temperature' || configKey === 'topP' || configKey === 'maxTokens' 
            ? parseFloat(value) || 0 
            : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Create New Project</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          {/* Project Basic Info */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Project Information</h4>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="My AI Assistant"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of your assistant..."
              />
            </div>
          </div>

          {/* Agent Configuration */}
          <div className="space-y-4 border-t pt-6">
            <h4 className="text-md font-medium text-gray-900">Agent Configuration</h4>
            
            <div>
              <label htmlFor="agentConfig.welcomeMessage" className="block text-sm font-medium text-gray-700">
                Welcome Message
              </label>
              <input
                type="text"
                id="agentConfig.welcomeMessage"
                name="agentConfig.welcomeMessage"
                value={formData.agentConfig.welcomeMessage}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Hello! How can I help you today?"
              />
            </div>

            <div>
              <label htmlFor="agentConfig.systemPrompt" className="block text-sm font-medium text-gray-700">
                System Prompt
              </label>
              <textarea
                id="agentConfig.systemPrompt"
                name="agentConfig.systemPrompt"
                rows={4}
                value={formData.agentConfig.systemPrompt}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="You are a helpful AI assistant..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="agentConfig.llmModel" className="block text-sm font-medium text-gray-700">
                  LLM Model
                </label>
                <select
                  id="agentConfig.llmModel"
                  name="agentConfig.llmModel"
                  value={formData.agentConfig.llmModel}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                </select>
              </div>

              <div>
                <label htmlFor="agentConfig.temperature" className="block text-sm font-medium text-gray-700">
                  Temperature
                </label>
                <input
                  type="number"
                  id="agentConfig.temperature"
                  name="agentConfig.temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.agentConfig.temperature}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="agentConfig.maxTokens" className="block text-sm font-medium text-gray-700">
                  Max Tokens
                </label>
                <input
                  type="number"
                  id="agentConfig.maxTokens"
                  name="agentConfig.maxTokens"
                  min="1"
                  max="4000"
                  value={formData.agentConfig.maxTokens}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="agentConfig.topP" className="block text-sm font-medium text-gray-700">
                  Top P
                </label>
                <input
                  type="number"
                  id="agentConfig.topP"
                  name="agentConfig.topP"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.agentConfig.topP}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </div>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
