export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatConfig {
  apiEndpoint?: string;
  title?: string;
  placeholder?: string;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  onSendMessage?: (message: string) => Promise<string>;
}

export interface ChatWidgetProps extends ChatConfig {
  className?: string;
}
