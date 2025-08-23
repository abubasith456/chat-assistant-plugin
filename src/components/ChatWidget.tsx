import React, { Fragment, useState, useRef, useEffect } from 'react';

// WebSocket configuration
const WS_BASE_URL = 'wss://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev/ws/';

// Configuration interface
export interface ChatWidgetConfig {
  // Position
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  // Size
  width?: string;
  height?: string;
  borderRadius?: string;
  
  // Colors
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headerBgColor?: string;
  headerTextColor?: string;
  inputBgColor?: string;
  inputTextColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  messageBubbleColor?: string;
  userBubbleColor?: string;
  
  // Content
  title?: string;
  placeholder?: string;
  
  // UI Options
  showUserAvatar?: boolean;
  showBotAvatar?: boolean;
  showOnlineIndicator?: boolean;
  compactHeader?: boolean;
  
  // Behavior
  defaultOpen?: boolean;
  useWebSocket?: boolean; // New option to enable WebSocket
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'message' | 'system' | 'typing' | 'error';
}

// Initial welcome message
const welcomeMessage: Message = {
  id: 0,
  text: "Hi! I'm your AI assistant. How can I help you today?",
  sender: 'bot',
  timestamp: new Date(),
  type: 'system'
};
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'message' | 'system' | 'typing' | 'error';
}

interface ChatWidgetProps {
  config?: ChatWidgetConfig;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ config = {} }) => {
  // Default configuration
  const defaultConfig: ChatWidgetConfig = {
    position: 'bottom-right',
    width: '380px',
    height: '500px',
    borderRadius: '12px',
    primaryColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
    textColor: '#374151',
    headerBgColor: '#3B82F6',
    headerTextColor: '#FFFFFF',
    inputBgColor: '#F9FAFB',
    inputTextColor: '#374151',
    buttonBgColor: '#3B82F6',
    buttonTextColor: '#FFFFFF',
    messageBubbleColor: '#F3F4F6',
    userBubbleColor: '#3B82F6',
    title: 'Chat Assistant',
    placeholder: 'Type your message...',
    showUserAvatar: true,
    showBotAvatar: true,
    showOnlineIndicator: true,
    compactHeader: false,
    defaultOpen: false,
  };

  // Merge configs
  const finalConfig = { ...defaultConfig, ...config };

  // State
  const [isOpen, setIsOpen] = useState(finalConfig.defaultOpen);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const clientId = useRef(`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // WebSocket connection
  useEffect(() => {
    if (finalConfig.useWebSocket && isOpen) { // Only connect when widget is open
      const connectWebSocket = () => {
        // Don't create duplicate connections
        if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
          return;
        }
        
        try {
          const wsUrl = `${WS_BASE_URL}${clientId.current}`;
          console.log('Connecting to:', wsUrl);
          
          wsRef.current = new WebSocket(wsUrl);
          
          wsRef.current.onopen = () => {
            console.log('WebSocket connected');
            setIsConnected(true);
          };
          
          wsRef.current.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              console.log('Received message:', data);
              
              // Handle different message types
              if (data.type === 'typing') {
                setIsTyping(true);
                return;
              }
              
              if (data.type === 'user') {
                // Skip echoed user messages as we already added them locally
                return;
              }
              
              if (data.type === 'assistant' || data.type === 'system') {
                setIsTyping(false);
                // Clean markdown formatting from AI response
                const cleanMessage = data.message
                  .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
                  .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
                  .replace(/`(.*?)`/g, '$1')       // Remove `code`
                  .replace(/#{1,6}\s/g, '')        // Remove headers
                  .trim();
                
                const newMessage: Message = {
                  id: Date.now(),
                  text: cleanMessage,
                  sender: 'bot',
                  timestamp: new Date(data.timestamp || Date.now()),
                  type: data.type
                };
                setMessages(prev => [...prev, newMessage]);
              }
              
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };
          
          wsRef.current.onclose = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
            // Only attempt to reconnect if the widget is still open
            if (isOpen) {
              setTimeout(connectWebSocket, 3000);
            }
          };
          
          wsRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsConnected(false);
          };
          
        } catch (error) {
          console.error('Error creating WebSocket connection:', error);
        }
      };
      
      connectWebSocket();
      
      // Cleanup
      return () => {
        if (wsRef.current) {
          console.log('Cleaning up WebSocket connection');
          wsRef.current.close();
          wsRef.current = null;
          setIsConnected(false);
        }
      };
    }
  }, [finalConfig.useWebSocket, isOpen]); // Add isOpen as dependency

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle send message
  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Show typing indicator immediately after sending
      setIsTyping(true);
      
      // Send via WebSocket if connected
      if (finalConfig.useWebSocket && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          const wsMessage = {
            message: inputValue,
            user_id: clientId.current,
            session_id: `session_${clientId.current}`
          };
          
          wsRef.current.send(JSON.stringify(wsMessage));
          console.log('Message sent via WebSocket:', wsMessage);
        } catch (error) {
          console.error('Error sending WebSocket message:', error);
          // Fall back to simulation
          setIsTyping(false); // Reset typing indicator on error
          simulateBotResponse();
        }
      } else {
        // Fallback simulation when WebSocket is not available
        simulateBotResponse();
      }
      
      setInputValue('');
    }
  };

  // Fallback bot response simulation
  const simulateBotResponse = () => {
    // Typing indicator is already set to true, so keep it for a moment
    setTimeout(() => {
      setIsTyping(false); // Hide typing indicator
      const botResponse: Message = {
        id: Date.now() + 1,
        text: "Thank you for your message! (This is a fallback response - WebSocket not connected)",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1500); // Increased delay to show typing effect
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Position classes - responsive positioning
  const positionClasses = {
    'bottom-right': 'bottom-2 right-2 sm:bottom-4 sm:right-4',
    'bottom-left': 'bottom-2 left-2 sm:bottom-4 sm:left-4', 
    'top-right': 'top-2 right-2 sm:top-4 sm:right-4',
    'top-left': 'top-2 left-2 sm:top-4 sm:left-4',
  };

  // Panel positioning - responsive for mobile
  const panelPositionClasses = {
    'bottom-right': window.innerWidth <= 480 ? 'bottom-2 right-2' : 'bottom-0 right-0',
    'bottom-left': window.innerWidth <= 480 ? 'bottom-2 left-2' : 'bottom-0 left-0',
    'top-right': window.innerWidth <= 480 ? 'top-2 right-2' : 'top-0 right-0', 
    'top-left': window.innerWidth <= 480 ? 'top-2 left-2' : 'top-0 left-0',
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`fixed z-[9999] ${positionClasses[finalConfig.position!]}`}>
      {/* Chat Panel - positioned relative to the container */}
      <div
        className={`absolute transition-all duration-300 ease-in-out ${panelPositionClasses[finalConfig.position!]} ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}
        style={{
          width: window.innerWidth <= 480 ? '95vw' : finalConfig.width,
          height: window.innerWidth <= 480 ? '90vh' : finalConfig.height,
          maxWidth: finalConfig.width,
          maxHeight: finalConfig.height,
          borderRadius: finalConfig.borderRadius,
          backgroundColor: finalConfig.backgroundColor,
        }}
      >
        <div className="flex flex-col h-full shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white">
          {/* Header - Compact design */}
          <div
            className="p-3 flex justify-between items-center"
            style={{
              backgroundColor: finalConfig.headerBgColor,
              color: finalConfig.headerTextColor,
            }}
          >
            <div className="flex items-center space-x-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  finalConfig.useWebSocket 
                    ? (isConnected ? 'bg-green-400' : 'bg-red-400') 
                    : 'bg-blue-400'
                }`}
                title={
                  finalConfig.useWebSocket 
                    ? (isConnected ? 'Connected to AI' : 'Disconnected') 
                    : 'Demo Mode'
                }
              ></div>
              <h3 className="font-semibold text-base">
                {finalConfig.title}
                {finalConfig.useWebSocket && (
                  <span className="text-xs opacity-75 ml-1">
                    {isConnected ? '• Live' : '• Offline'}
                  </span>
                )}
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:opacity-70 transition-opacity p-1 rounded hover:bg-white hover:bg-opacity-10"
              style={{
                color: finalConfig.headerTextColor,
                background: 'transparent',
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages - Compact Design */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.774-.829L3 21l1.829-6.226A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                  </svg>
                </div>
                <h4 className="font-medium text-base text-gray-700 mb-1">Start a conversation</h4>
                <p className="text-sm text-gray-500">Send a message to get started!</p>
              </div>
            ) : (
              <Fragment>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white mt-1" 
                         style={{
                           backgroundColor: message.sender === 'user' ? '#3B82F6' : '#6B7280'
                         }}>
                      {message.sender === 'user' ? 'U' : 'A'}
                    </div>
                    <div
                      className={`flex-1 max-w-xs px-3 py-2 rounded-lg border ${
                        message.sender === 'user' 
                          ? 'rounded-br-sm border-transparent' 
                          : 'bg-gray-50 border-gray-200 rounded-bl-sm'
                      }`}
                      style={message.sender === 'user' ? 
                        { backgroundColor: finalConfig.userBubbleColor, color: finalConfig.buttonTextColor } : 
                        { backgroundColor: finalConfig.messageBubbleColor, color: finalConfig.textColor }
                      }
                    >
                      <p className="text-sm leading-relaxed break-words">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-white opacity-70' : 'text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start gap-2 flex-row">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white mt-1 bg-gray-400">
                      AI
                    </div>
                    <div className="flex-1 max-w-xs px-3 py-2 rounded-lg bg-gray-50 border-gray-200 rounded-bl-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                
              </Fragment>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Compact Design */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex space-x-2 items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={finalConfig.placeholder}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                style={{
                  backgroundColor: finalConfig.inputBgColor,
                  color: finalConfig.inputTextColor,
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="px-3 py-2 rounded-lg transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: finalConfig.buttonBgColor,
                  color: finalConfig.buttonTextColor,
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button - Simple medium size */}
      <button
        onClick={() => setIsOpen(true)}
        className={`absolute rounded-full flex items-center justify-center ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:opacity-90'
        } w-14 h-14 shadow-lg focus:outline-none`}
        style={{
          backgroundColor: finalConfig.primaryColor,
          color: finalConfig.buttonTextColor,
          ...(finalConfig.position?.includes('bottom') 
            ? { bottom: 0 } 
            : { top: 0 }),
          ...(finalConfig.position?.includes('right') 
            ? { right: 0 } 
            : { left: 0 }),
          zIndex: 10,
        }}
      >
        {/* Simple chat icon */}
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.774-.829L3 21l1.829-6.226A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
        </svg>
      </button>
    </div>
  );
};

export default ChatWidget;
