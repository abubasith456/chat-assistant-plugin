import ChatWidget from './components/ChatWidget';
import './App.css';

function App() {
  // Example configurations for different use cases
  const defaultConfig = {
    useWebSocket: true,  // Enable WebSocket connection
  };

  const customConfig = {
    position: 'bottom-left' as const,
    primaryColor: '#10B981',
    headerBgColor: '#059669',
    userBubbleColor: '#10B981',
    buttonBgColor: '#10B981',
    title: 'AI Support Chat',
    width: '400px',
    height: '600px',
    compactHeader: false,
    showOnlineIndicator: true,
    showUserAvatar: true,
    showBotAvatar: true,
    useWebSocket: true,  // Enable WebSocket connection
  };

  const compactConfig = {
    position: 'top-right' as const,
    primaryColor: '#8B5CF6',
    headerBgColor: '#7C3AED',
    userBubbleColor: '#8B5CF6',
    buttonBgColor: '#8B5CF6',
    title: 'AI Help',
    width: '320px',
    height: '400px',
    borderRadius: '20px',
    compactHeader: true,
    showOnlineIndicator: false,
    showUserAvatar: false,
    showBotAvatar: false,
    useWebSocket: false,  // Keep as demo mode
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Chat Assistant Plugin Demo
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            React + Tailwind CSS Version
          </h2>
          <p className="text-gray-600 mb-6">
            This demo showcases multiple chat widgets with different configurations. 
            Click on the chat buttons to see them in action!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Default Style</h3>
              <p className="text-sm text-gray-600 mb-3">Bottom-right, blue theme</p>
              <div className="text-xs text-gray-500">
                <code>position: bottom-right</code><br/>
                <code>primaryColor: #3B82F6</code>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Custom Green</h3>
              <p className="text-sm text-gray-600 mb-3">Bottom-left, green theme, full featured</p>
              <div className="text-xs text-gray-500">
                <code>position: bottom-left</code><br/>
                <code>primaryColor: #10B981</code><br/>
                <code>compactHeader: false</code><br/>
                <code>showAvatars: true</code>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Compact Purple</h3>
              <p className="text-sm text-gray-600 mb-3">Top-right, purple, minimal UI</p>
              <div className="text-xs text-gray-500">
                <code>position: top-right</code><br/>
                <code>primaryColor: #8B5CF6</code><br/>
                <code>compactHeader: true</code><br/>
                <code>showAvatars: false</code>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Usage Example
          </h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
{`import ChatWidget from './components/ChatWidget';

function App() {
  const config = {
    position: 'bottom-right',
    primaryColor: '#10B981',
    title: 'Support Chat',
    width: '400px',
    height: '600px'
  };

  return (
    <div>
      <ChatWidget config={config} />
    </div>
  );
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Chat Widgets */}
      <ChatWidget config={defaultConfig} />
      <ChatWidget config={customConfig} />
      <ChatWidget config={compactConfig} />
    </div>
  );
}

export default App;
