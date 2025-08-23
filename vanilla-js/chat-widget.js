/**
 * Chat Widget - Pure Vanilla JavaScript Implementation
 * A fully configurable chat widget with no dependencies
 * Author: Chat Assistant Plugin
 * Version: 1.0.0
 */

(function() {
    'use strict';
    
    // Sample messages data
    const SAMPLE_MESSAGES = [
        { id: 1, text: "Hi! How can I help you today?", sender: 'bot', timestamp: new Date(Date.now() - 10000) },
        { id: 2, text: "I need help with my account", sender: 'user', timestamp: new Date(Date.now() - 8000) },
        { id: 3, text: "I'd be happy to help you with your account. What specific issue are you experiencing?", sender: 'bot', timestamp: new Date(Date.now() - 5000) },
        { id: 4, text: "I can't log in", sender: 'user', timestamp: new Date(Date.now() - 3000) },
        { id: 5, text: "Let me help you troubleshoot the login issue. Have you tried resetting your password?", sender: 'bot', timestamp: new Date(Date.now() - 1000) }
    ];

    // Default configuration
    const DEFAULT_CONFIG = {
        // Position
        position: 'bottom-right',
        
        // Size
        width: '380px',
        height: '500px',
        borderRadius: '12px',
        
        // Colors
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
        
        // Content
        title: 'Chat Assistant',
        placeholder: 'Type your message...',
        
        // Behavior
        defaultOpen: false
    };

    /**
     * ChatWidget Class
     */
    class ChatWidget {
        constructor(config = {}) {
            this.config = { ...DEFAULT_CONFIG, ...config };
            this.isOpen = this.config.defaultOpen;
            this.messages = [...SAMPLE_MESSAGES];
            this.container = null;
            this.panel = null;
            this.toggleBtn = null;
            this.messagesContainer = null;
            this.input = null;
            
            this.init();
        }

        /**
         * Initialize the widget
         */
        init() {
            this.createElements();
            this.attachEvents();
            this.applyStyles();
            this.renderMessages();
            
            // Handle window resize
            window.addEventListener('resize', () => {
                this.applyStyles();
            });
            
            if (this.isOpen) {
                this.showPanel();
            }
        }

        /**
         * Create DOM elements
         */
        createElements() {
            // Main container
            this.container = document.createElement('div');
            this.container.className = `chat-widget position-${this.config.position}`;
            
            // Chat panel
            this.panel = document.createElement('div');
            this.panel.className = `chat-panel ${this.isOpen ? 'visible' : 'hidden'}`;
            
            // Panel HTML structure
            this.panel.innerHTML = `
                <div class="chat-header">
                    <h3>${this.config.title}</h3>
                    <button class="chat-close-btn" type="button" aria-label="Close chat">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input-area">
                    <div class="chat-input-container">
                        <input type="text" class="chat-input" placeholder="${this.config.placeholder}" maxlength="500">
                        <button class="chat-send-btn" type="button" aria-label="Send message">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7l7 7-7 7"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;

            // Toggle button
            this.toggleBtn = document.createElement('button');
            this.toggleBtn.className = `chat-toggle-btn ${this.isOpen ? 'hidden' : 'visible'}`;
            this.toggleBtn.setAttribute('type', 'button');
            this.toggleBtn.setAttribute('aria-label', 'Open chat');
            this.toggleBtn.innerHTML = `
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
            `;

            // Get references to important elements
            this.messagesContainer = this.panel.querySelector('.chat-messages');
            this.input = this.panel.querySelector('.chat-input');

            // Append to container
            this.container.appendChild(this.panel);
            this.container.appendChild(this.toggleBtn);

            // Append to body
            document.body.appendChild(this.container);
        }

        /**
         * Attach event listeners
         */
        attachEvents() {
            const closeBtn = this.panel.querySelector('.chat-close-btn');
            const sendBtn = this.panel.querySelector('.chat-send-btn');

            // Toggle button
            this.toggleBtn.addEventListener('click', () => this.showPanel());
            
            // Close button
            closeBtn.addEventListener('click', () => this.hidePanel());
            
            // Send button
            sendBtn.addEventListener('click', () => this.sendMessage());
            
            // Input enter key
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });

            // Prevent clicks inside panel from bubbling
            this.panel.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        /**
         * Apply custom styles based on configuration
         */
        applyStyles() {
            const panel = this.panel;
            const header = panel.querySelector('.chat-header');
            const input = panel.querySelector('.chat-input');
            const sendBtn = panel.querySelector('.chat-send-btn');
            const toggleBtn = this.toggleBtn;

            // Responsive sizing
            const isMobile = window.innerWidth <= 480;
            
            // Panel styles
            if (isMobile) {
                panel.style.width = '95vw';
                panel.style.height = '90vh';
                panel.style.maxWidth = this.config.width;
                panel.style.maxHeight = this.config.height;
            } else {
                panel.style.width = this.config.width;
                panel.style.height = this.config.height;
            }
            
            panel.style.borderRadius = this.config.borderRadius;
            panel.style.backgroundColor = this.config.backgroundColor;
            panel.style.color = this.config.textColor;

            // Header styles
            header.style.backgroundColor = this.config.headerBgColor;
            header.style.color = this.config.headerTextColor;

            // Input styles
            input.style.backgroundColor = this.config.inputBgColor;
            input.style.color = this.config.inputTextColor;

            // Button styles
            sendBtn.style.backgroundColor = this.config.buttonBgColor;
            sendBtn.style.color = this.config.buttonTextColor;

            // Toggle button styles
            toggleBtn.style.backgroundColor = this.config.primaryColor;
            toggleBtn.style.color = this.config.buttonTextColor;
            
            // Responsive toggle button size
            if (isMobile) {
                toggleBtn.style.width = '48px';
                toggleBtn.style.height = '48px';
                const svg = toggleBtn.querySelector('svg');
                if (svg) {
                    svg.style.width = '24px';
                    svg.style.height = '24px';
                }
            } else {
                toggleBtn.style.width = '64px';
                toggleBtn.style.height = '64px';
                const svg = toggleBtn.querySelector('svg');
                if (svg) {
                    svg.style.width = '32px';
                    svg.style.height = '32px';
                }
            }
        }

        /**
         * Show chat panel
         */
        showPanel() {
            this.isOpen = true;
            this.panel.classList.remove('hidden');
            this.panel.classList.add('visible');
            this.toggleBtn.classList.remove('visible');
            this.toggleBtn.classList.add('hidden');
            
            // Focus input
            setTimeout(() => {
                this.input.focus();
            }, 300);
            
            this.scrollToBottom();
        }

        /**
         * Hide chat panel
         */
        hidePanel() {
            this.isOpen = false;
            this.panel.classList.remove('visible');
            this.panel.classList.add('hidden');
            this.toggleBtn.classList.remove('hidden');
            this.toggleBtn.classList.add('visible');
        }

        /**
         * Send a message
         */
        sendMessage() {
            const message = this.input.value.trim();
            if (!message) return;

            // Add user message
            const userMessage = {
                id: Date.now(),
                text: message,
                sender: 'user',
                timestamp: new Date()
            };
            
            this.messages.push(userMessage);
            this.renderMessage(userMessage);
            this.input.value = '';
            this.scrollToBottom();

            // Show typing indicator
            this.showTypingIndicator();

            // Simulate bot response
            setTimeout(() => {
                this.hideTypingIndicator();
                
                const botMessage = {
                    id: Date.now() + 1,
                    text: "Thank you for your message! This is a sample response from the chat assistant. In a real implementation, this would connect to your backend API.",
                    sender: 'bot',
                    timestamp: new Date()
                };
                
                this.messages.push(botMessage);
                this.renderMessage(botMessage);
                this.scrollToBottom();
            }, 1000 + Math.random() * 1000);
        }

        /**
         * Render all messages
         */
        renderMessages() {
            this.messagesContainer.innerHTML = '';
            this.messages.forEach(message => this.renderMessage(message));
            this.scrollToBottom();
        }

        /**
         * Render a single message
         */
        renderMessage(message) {
            const messageEl = document.createElement('div');
            messageEl.className = `message ${message.sender}`;
            
            const bubbleEl = document.createElement('div');
            bubbleEl.className = 'message-bubble';
            
            // Apply custom colors
            if (message.sender === 'user') {
                bubbleEl.style.backgroundColor = this.config.userBubbleColor;
                bubbleEl.style.color = this.config.buttonTextColor;
            } else {
                bubbleEl.style.backgroundColor = this.config.messageBubbleColor;
                bubbleEl.style.color = this.config.textColor;
            }
            
            bubbleEl.innerHTML = `
                <p>${this.escapeHtml(message.text)}</p>
                <div class="message-time">${this.formatTime(message.timestamp)}</div>
            `;
            
            messageEl.appendChild(bubbleEl);
            this.messagesContainer.appendChild(messageEl);
        }

        /**
         * Show typing indicator
         */
        showTypingIndicator() {
            const typingEl = document.createElement('div');
            typingEl.className = 'message bot typing-indicator';
            typingEl.innerHTML = `
                <div class="loading-message">
                    <div class="loading-dots">
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                    </div>
                </div>
            `;
            
            this.messagesContainer.appendChild(typingEl);
            this.scrollToBottom();
        }

        /**
         * Hide typing indicator
         */
        hideTypingIndicator() {
            const typingIndicator = this.messagesContainer.querySelector('.typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        /**
         * Scroll messages to bottom
         */
        scrollToBottom() {
            setTimeout(() => {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }, 100);
        }

        /**
         * Format timestamp
         */
        formatTime(date) {
            return date.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }

        /**
         * Escape HTML to prevent XSS
         */
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        /**
         * Destroy the widget
         */
        destroy() {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
        }
    }

    // Global ChatWidget object
    window.ChatWidget = {
        /**
         * Initialize a new chat widget
         * @param {Object} config - Configuration options
         * @returns {ChatWidget} - Widget instance
         */
        init: function(config) {
            return new ChatWidget(config);
        },

        /**
         * Create multiple widgets
         * @param {Array} configs - Array of configuration objects
         * @returns {Array} - Array of widget instances
         */
        createMultiple: function(configs) {
            return configs.map(config => new ChatWidget(config));
        },

        /**
         * Default configuration
         */
        defaultConfig: DEFAULT_CONFIG,

        /**
         * Widget class (for advanced usage)
         */
        Widget: ChatWidget
    };

    // Auto-initialize if data-chat-widget attribute exists
    document.addEventListener('DOMContentLoaded', function() {
        const autoInit = document.querySelector('[data-chat-widget]');
        if (autoInit) {
            try {
                const config = JSON.parse(autoInit.getAttribute('data-chat-widget') || '{}');
                window.ChatWidget.init(config);
            } catch (e) {
                console.warn('ChatWidget: Invalid JSON in data-chat-widget attribute');
                window.ChatWidget.init();
            }
        }
    });

})();
