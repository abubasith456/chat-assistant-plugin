/**
 * Enhanced Chat Widget - Pure Vanilla JavaScript Implementation
 * A fully configurable modern chat widget with beautiful animations
 * Author: Chat Assistant Plugin
 * Version: 2.0.0
 */

(function() {
    'use strict';
    
    // Sample messages data
    const SAMPLE_MESSAGES = [
        { id: 1, text: "Hi! How can I help you today?", sender: 'bot', timestamp: new Date(Date.now() - 10000) },
        { id: 2, text: "I need help with my account", sender: 'user', timestamp: new Date(Date.now() - 8000) },
        { id: 3, text: "I'd be happy to help you with your account. What specific issue are you experiencing?", sender: 'bot', timestamp: new Date(Date.now() - 5000) }
    ];

    // Default configuration
    const DEFAULT_CONFIG = {
        // Position
        position: 'bottom-right',
        
        // Size
        width: '380px',
        height: '500px',
        borderRadius: '16px',
        
        // Colors
        primaryColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        textColor: '#374151',
        headerBgColor: '#3B82F6',
        headerTextColor: '#FFFFFF',
        inputBgColor: '#FFFFFF',
        inputTextColor: '#374151',
        buttonBgColor: '#3B82F6',
        buttonTextColor: '#FFFFFF',
        messageBubbleColor: '#FFFFFF',
        userBubbleColor: '#3B82F6',
        
        // Content
        title: 'Chat Assistant',
        placeholder: 'Type your message...',
        
        // UI Options
        showUserAvatar: true,
        showBotAvatar: true,
        showOnlineIndicator: true,
        compactHeader: false,
        
        // WebSocket Configuration
        useWebSocket: false,
        wsUrl: 'wss://bug-free-system-944rgq7pxjx2j5w-8000.app.github.dev/ws/',
        
        // Behavior
        defaultOpen: false
    };

    /**
     * Enhanced Chat Widget Class
     */
    class EnhancedChatWidget {
        constructor(config = {}) {
            this.config = { ...DEFAULT_CONFIG, ...config };
            this.isOpen = this.config.defaultOpen;
            this.messages = this.config.useWebSocket ? [] : [...SAMPLE_MESSAGES];
            this.messageId = this.messages.length + 1;
            
            // WebSocket properties
            this.ws = null;
            this.isConnected = false;
            this.isTyping = false;
            this.clientId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            this.element = null;
            this.panel = null;
            this.toggleButton = null;
            this.messageInput = null;
            this.messagesContainer = null;
            this.sendButton = null;
            
            this.init();
        }

        init() {
            this.createElement();
            this.attachEventListeners();
            this.updateDisplay();
            this.renderMessages();
            
            // Add welcome message
            if (!this.config.useWebSocket) {
                this.addMessage("Hi! I'm your AI assistant. How can I help you today?", 'bot', 'system');
            }
            
            // Load enhanced CSS
            this.loadEnhancedCSS();
        }

        loadEnhancedCSS() {
            // Check if enhanced CSS is already loaded
            if (!document.getElementById('chat-widget-enhanced-css')) {
                const link = document.createElement('link');
                link.id = 'chat-widget-enhanced-css';
                link.rel = 'stylesheet';
                link.href = './vanilla-js/chat-widget-enhanced.css';
                document.head.appendChild(link);
            }
        }

        createElement() {
            // Create main widget container
            this.element = document.createElement('div');
            this.element.className = `chat-widget position-${this.config.position}`;
            
            // Create chat panel
            this.panel = document.createElement('div');
            this.panel.className = `chat-panel ${this.isOpen ? 'open' : 'closed'}`;
            this.panel.innerHTML = `
                <div class="chat-header" style="
                    --header-bg-color: ${this.config.headerBgColor};
                    --header-text-color: ${this.config.headerTextColor};
                    padding: ${this.config.compactHeader ? '16px 24px' : '24px'};
                ">
                    <div class="chat-header-title">
                        ${this.config.showOnlineIndicator ? '<div class="online-indicator"></div>' : ''}
                        <h3 class="chat-title" style="font-size: ${this.config.compactHeader ? '18px' : '20px'}">${this.config.title}</h3>
                    </div>
                    <button class="close-button" aria-label="Close chat">
                        <svg class="close-icon" style="width: ${this.config.compactHeader ? '20px' : '24px'}; height: ${this.config.compactHeader ? '20px' : '24px'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="chat-messages">
                    <div class="empty-state" style="display: ${this.messages.length === 0 ? 'block' : 'none'}">
                        <div class="empty-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.774-.829L3 21l1.829-6.226A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z"/>
                            </svg>
                        </div>
                        <h4 class="empty-title">Start a conversation</h4>
                        <p class="empty-description">Send a message to get started!</p>
                    </div>
                    <div class="messages-list"></div>
                </div>
                <div class="chat-input" style="
                    --input-bg-color: ${this.config.inputBgColor};
                    --input-text-color: ${this.config.inputTextColor};
                    --button-bg-color: ${this.config.buttonBgColor};
                    --button-text-color: ${this.config.buttonTextColor};
                ">
                    <div class="input-container">
                        <input 
                            type="text" 
                            class="message-input" 
                            placeholder="${this.config.placeholder}"
                            autocomplete="off"
                        />
                        <button class="send-button" disabled>
                            <svg class="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-7-7l7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;

            // Create toggle button
            this.toggleButton = document.createElement('button');
            this.toggleButton.className = `chat-toggle ${this.isOpen ? 'open' : 'closed'}`;
            this.toggleButton.style.cssText = `
                --primary-color: ${this.config.primaryColor};
                --button-text-color: ${this.config.buttonTextColor};
            `;
            this.toggleButton.innerHTML = `
                <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.774-.829L3 21l1.829-6.226A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z"/>
                </svg>
            `;

            // Append elements
            this.element.appendChild(this.panel);
            this.element.appendChild(this.toggleButton);
            
            // Get references
            this.messageInput = this.panel.querySelector('.message-input');
            this.messagesContainer = this.panel.querySelector('.messages-list');
            this.sendButton = this.panel.querySelector('.send-button');
            
            // Apply CSS variables to the element
            this.element.style.cssText = `
                --primary-color: ${this.config.primaryColor};
                --background-color: ${this.config.backgroundColor};
                --text-color: ${this.config.textColor};
                --header-bg-color: ${this.config.headerBgColor};
                --header-text-color: ${this.config.headerTextColor};
                --input-bg-color: ${this.config.inputBgColor};
                --input-text-color: ${this.config.inputTextColor};
                --button-bg-color: ${this.config.buttonBgColor};
                --button-text-color: ${this.config.buttonTextColor};
                --message-bubble-color: ${this.config.messageBubbleColor};
                --user-bubble-color: ${this.config.userBubbleColor};
            `;
        }

        attachEventListeners() {
            // Toggle button click
            this.toggleButton.addEventListener('click', () => {
                this.toggle();
            });

            // Close button click
            const closeButton = this.panel.querySelector('.close-button');
            closeButton.addEventListener('click', () => {
                this.close();
            });

            // Input events
            this.messageInput.addEventListener('input', () => {
                this.updateSendButton();
            });

            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Send button click
            this.sendButton.addEventListener('click', () => {
                this.sendMessage();
            });

            // Click outside to close (optional)
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.element.contains(e.target)) {
                    // Uncomment to enable click outside to close
                    // this.close();
                }
            });
        }

        updateSendButton() {
            const hasText = this.messageInput.value.trim().length > 0;
            this.sendButton.disabled = !hasText;
        }

        sendMessage() {
            const text = this.messageInput.value.trim();
            if (!text) return;

            // Add user message
            this.addMessage(text, 'user');

            // Clear input
            this.messageInput.value = '';
            this.updateSendButton();

            // Show typing indicator immediately after sending
            this.showTypingIndicator();

            // Send via WebSocket if connected
            if (this.config.useWebSocket && this.ws && this.ws.readyState === WebSocket.OPEN) {
                try {
                    const wsMessage = {
                        message: text,
                        user_id: this.clientId,
                        session_id: `session_${this.clientId}`
                    };
                    
                    this.ws.send(JSON.stringify(wsMessage));
                    console.log('Message sent via WebSocket:', wsMessage);
                } catch (error) {
                    console.error('Error sending WebSocket message:', error);
                    this.hideTypingIndicator(); // Reset typing indicator on error
                    this.simulateBotResponse(text);
                }
            } else {
                // Fallback simulation
                this.simulateBotResponse(text);
            }

            this.renderMessages();
        }

        simulateBotResponse(userText) {
            // Typing indicator is already shown, keep it for a moment
            setTimeout(() => {
                this.hideTypingIndicator(); // Hide typing indicator
                this.addMessage(
                    `Thanks for your message: "${userText}". ${this.config.useWebSocket ? '(WebSocket not connected)' : 'This is a demo response.'}`,
                    'bot'
                );
                this.renderMessages();
            }, 1500); // Increased delay to show typing effect
        }

        addMessage(text, sender, type = 'message') {
            const message = {
                id: this.messageId++,
                text: text,
                sender: sender,
                timestamp: new Date(),
                type: type
            };
            this.messages.push(message);
            return message;
        }

        // WebSocket methods
        initWebSocket() {
            if (!this.config.wsUrl) {
                console.warn('WebSocket URL not provided');
                return;
            }

            // Close existing connection if it exists
            if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
                console.log('Closing existing WebSocket connection');
                this.ws.close();
                this.ws = null;
            }

            try {
                const wsUrl = `${this.config.wsUrl}${this.clientId}`;
                console.log('Connecting to WebSocket:', wsUrl);
                
                this.ws = new WebSocket(wsUrl);
                
                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.isConnected = true;
                    this.updateConnectionStatus();
                };
                
                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('Received WebSocket message:', data);
                        
                        if (data.type === 'typing') {
                            this.showTypingIndicator();
                            return;
                        }
                        
                        if (data.type === 'user') {
                            // Skip echoed user messages as we already added them locally
                            return;
                        }
                        
                        if (data.type === 'assistant' || data.type === 'system') {
                            this.hideTypingIndicator();
                            // Clean markdown formatting from AI response
                            const cleanMessage = data.message
                                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
                                .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
                                .replace(/`(.*?)`/g, '$1')       // Remove `code`
                                .replace(/#{1,6}\s/g, '')        // Remove headers
                                .trim();
                            this.addMessage(cleanMessage, 'bot', data.type);
                            this.renderMessages();
                        }
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };
                
                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.isConnected = false;
                    this.updateConnectionStatus();
                    
                    // Attempt to reconnect after 3 seconds
                    setTimeout(() => this.initWebSocket(), 3000);
                };
                
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.isConnected = false;
                    this.updateConnectionStatus();
                };
                
            } catch (error) {
                console.error('Error creating WebSocket connection:', error);
            }
        }

        updateConnectionStatus() {
            const indicator = this.panel.querySelector('.status-indicator');
            if (indicator) {
                indicator.className = `status-indicator ${
                    this.config.useWebSocket 
                        ? (this.isConnected ? 'connected' : 'disconnected')
                        : 'demo'
                }`;
                
                indicator.title = this.config.useWebSocket 
                    ? (this.isConnected ? 'Connected to AI' : 'Disconnected') 
                    : 'Demo Mode';
            }

            const statusText = this.panel.querySelector('.connection-status');
            if (statusText) {
                statusText.textContent = this.config.useWebSocket 
                    ? (this.isConnected ? '• Live' : '• Offline')
                    : '';
            }
        }

        showTypingIndicator() {
            this.isTyping = true;
            this.renderMessages();
        }

        hideTypingIndicator() {
            this.isTyping = false;
            this.renderMessages();
        }

        renderMessages() {
            const emptyState = this.panel.querySelector('.empty-state');
            emptyState.style.display = this.messages.length === 0 ? 'block' : 'none';

            let messagesHTML = this.messages.map(message => `
                <div class="message ${message.sender}">
                    <div class="message-avatar ${message.sender}">${message.sender === 'user' ? 'U' : 'A'}</div>
                    <div class="message-bubble ${message.sender}">
                        <p class="message-text">${message.text}</p>
                        <p class="message-time ${message.sender}">
                            ${this.formatTime(message.timestamp)}
                        </p>
                    </div>
                </div>
            `).join('');

            // Add typing indicator if assistant is typing
            if (this.isTyping) {
                messagesHTML += `
                    <div class="message bot typing-indicator">
                        <div class="message-avatar bot">A</div>
                        <div class="message-bubble bot">
                            <div class="typing-dots">
                                <span class="dot"></span>
                                <span class="dot"></span>
                                <span class="dot"></span>
                            </div>
                        </div>
                    </div>
                `;
            }

            this.messagesContainer.innerHTML = messagesHTML;

            // Scroll to bottom
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }

        formatTime(date) {
            return date.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }

        open() {
            this.isOpen = true;
            this.updateDisplay();
        }

        close() {
            this.isOpen = false;
            this.updateDisplay();
        }

        toggle() {
            this.isOpen = !this.isOpen;
            this.updateDisplay();
            
            // Manage WebSocket connection based on widget state
            if (this.isOpen && this.config.useWebSocket) {
                this.initWebSocket();
            } else if (!this.isOpen && this.ws) {
                console.log('Closing WebSocket connection on widget close');
                this.ws.close();
                this.ws = null;
                this.isConnected = false;
                this.updateConnectionStatus();
            }
        }

        updateDisplay() {
            if (this.isOpen) {
                this.panel.classList.remove('closed');
                this.panel.classList.add('open');
                this.toggleButton.classList.remove('closed');
                this.toggleButton.classList.add('open');
            } else {
                this.panel.classList.remove('open');
                this.panel.classList.add('closed');
                this.toggleButton.classList.remove('open');
                this.toggleButton.classList.add('closed');
            }
        }

        mount(target = document.body) {
            target.appendChild(this.element);
            return this;
        }

        destroy() {
            // Close WebSocket connection
            if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
                console.log('Closing WebSocket connection on destroy');
                this.ws.close();
                this.ws = null;
            }
            
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }

        // Update configuration
        updateConfig(newConfig) {
            this.config = { ...this.config, ...newConfig };
            this.applyStyles();
        }

        applyStyles() {
            // Update CSS variables
            this.element.style.cssText = `
                --primary-color: ${this.config.primaryColor};
                --background-color: ${this.config.backgroundColor};
                --text-color: ${this.config.textColor};
                --header-bg-color: ${this.config.headerBgColor};
                --header-text-color: ${this.config.headerTextColor};
                --input-bg-color: ${this.config.inputBgColor};
                --input-text-color: ${this.config.inputTextColor};
                --button-bg-color: ${this.config.buttonBgColor};
                --button-text-color: ${this.config.buttonTextColor};
                --message-bubble-color: ${this.config.messageBubbleColor};
                --user-bubble-color: ${this.config.userBubbleColor};
            `;

            // Update position class
            this.element.className = `chat-widget position-${this.config.position}`;
            
            // Update toggle button styles
            this.toggleButton.style.cssText = `
                --primary-color: ${this.config.primaryColor};
                --button-text-color: ${this.config.buttonTextColor};
            `;
        }
    }

    // Make ChatWidget available globally
    window.EnhancedChatWidget = EnhancedChatWidget;

    // Auto-initialize if config is provided
    if (typeof window.chatWidgetConfig !== 'undefined') {
        document.addEventListener('DOMContentLoaded', () => {
            new EnhancedChatWidget(window.chatWidgetConfig).mount();
        });
    }

})();
