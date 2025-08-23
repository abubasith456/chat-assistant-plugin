import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onViewProject?: (projectId: string) => void;
}

export default function ProjectCard({ project, onViewProject }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewProject = () => {
    onViewProject?.(project.id);
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>

        {/* Agent Config Preview */}
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Model:</span>
              <p className="font-medium text-gray-900">{project.agentConfig.llmModel}</p>
            </div>
            <div>
              <span className="text-gray-500">Temperature:</span>
              <p className="font-medium text-gray-900">{project.agentConfig.temperature}</p>
            </div>
          </div>
          
          <div className="mt-3">
            <span className="text-gray-500 text-sm">Welcome Message:</span>
            <p className="text-sm text-gray-700 mt-1 line-clamp-2">
              {project.agentConfig.welcomeMessage}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Created {formatDate(project.createdAt)}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleViewProject}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>
            <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
