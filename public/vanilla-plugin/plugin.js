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
            this.messages = [...SAMPLE_MESSAGES];
            this.messageId = this.messages.length + 1;
            
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
            const userMessage = {
                id: this.messageId++,
                text: text,
                sender: 'user',
                timestamp: new Date()
            };
            this.messages.push(userMessage);

            // Clear input
            this.messageInput.value = '';
            this.updateSendButton();

            // Simulate bot response
            setTimeout(() => {
                const botMessage = {
                    id: this.messageId++,
                    text: `Thanks for your message: "${text}". This is an automated response.`,
                    sender: 'bot',
                    timestamp: new Date()
                };
                this.messages.push(botMessage);
                this.renderMessages();
            }, 1000);

            this.renderMessages();
        }

        renderMessages() {
            const emptyState = this.panel.querySelector('.empty-state');
            emptyState.style.display = this.messages.length === 0 ? 'block' : 'none';

            this.messagesContainer.innerHTML = this.messages.map(message => `
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
