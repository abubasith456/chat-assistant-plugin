# Assistant Dashboard

A React-based dashboard for managing AI assistant projects and configurations.

## Features

### Authentication
- **Login**: User authentication with email and password
- **Register**: New user registration
- **Forgot Password**: Password reset functionality (demo implementation)

### Project Management
- **Create Project**: Create new AI assistant projects with custom configurations
- **View Projects**: Browse all projects in a card-based layout
- **Edit Projects**: Modify project settings and agent configurations

### Agent Configuration
- **Welcome Message**: Customize the greeting message
- **System Prompt**: Define the AI assistant's behavior and personality
- **LLM Model**: Choose from various language models (GPT-3.5, GPT-4, Claude, etc.)
- **Temperature**: Control response creativity (0.0 - 2.0)
- **Max Tokens**: Set maximum response length
- **Top P**: Fine-tune response diversity

### Integration
- **Project ID**: Each project gets a unique ID for API integration
- **WebSocket Integration**: Use project ID as client_id for real-time chat

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

1. Navigate to the dashboard directory:
   ```bash
   cd dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5174`

### Demo Credentials
For testing purposes, you can use any email and password to log in.

## Project Structure

```
dashboard/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Layout.tsx     # Main layout wrapper
│   │   ├── LoadingSpinner.tsx
│   │   ├── ProjectCard.tsx
│   │   └── CreateProjectModal.tsx
│   ├── context/           # React contexts for state management
│   │   ├── AuthContext.tsx
│   │   ├── ProjectContext.tsx
│   │   └── NavigationContext.tsx
│   ├── pages/             # Main application pages
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── Dashboard.tsx
│   │   └── ProjectDetails.tsx
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Key Features Implementation

### Project ID Integration
Instead of using random client_id, projects now have unique IDs that can be used for:
- WebSocket connections
- API authentication  
- Agent configuration retrieval

### Agent Configuration Management
Each project stores complete agent settings:
- Welcome message displayed to users
- System prompt that defines AI behavior
- Model selection and parameters
- Response generation settings

### State Management
Uses React Context API for:
- **AuthContext**: User authentication state
- **ProjectContext**: Project and agent configuration management  
- **NavigationContext**: Application navigation state

## Integration with Main Chat Application

To integrate a project with your chat application:

1. Copy the Project ID from the dashboard
2. Use it as the `client_id` when connecting to WebSocket:
   ```javascript
   const websocket = new WebSocket(`ws://localhost:8000/ws/${projectId}`);
   ```
3. The backend will fetch project configuration and use it for the agent

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Environment
- Uses Vite for fast development and building
- TailwindCSS for styling
- TypeScript for type safety
- React 18 with hooks and context

## Next Steps

### Backend API Integration
Replace mock implementations with real API calls:
- User authentication endpoints
- Project CRUD operations  
- Agent configuration management

### Additional Features
- Project analytics and usage metrics
- Team collaboration and sharing
- Advanced agent configuration options
- Integration guides and documentation

## Notes

- This is a standalone React application that runs on port 5174
- Currently uses localStorage for demo data persistence
- All authentication is mocked for demonstration purposes
- Ready for backend API integration when available
