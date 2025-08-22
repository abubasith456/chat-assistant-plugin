export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
}

export interface SendResult {
  message: ChatMessage
  // placeholder for streaming/chunked responses in future
  chunks?: string[]
}

export type BackendFn = (message: ChatMessage) => Promise<SendResult>

export interface ChatAdapter {
  getInitialMessages(): Promise<ChatMessage[]>
  sendMessage(message: ChatMessage): Promise<SendResult>
}

export type Position = 'bottom-right' | 'bottom-left'

export type Theme = 'dark' | 'light'

export interface ChatWidgetProps {
  // UI customization
  title?: string
  placeholder?: string
  welcomeMessage?: string
  theme?: Theme
  position?: Position
  initialOpen?: boolean

  // controlled messages — if provided the component will treat messages as controlled
  messages?: ChatMessage[]
  onMessagesChange?: (messages: ChatMessage[]) => void

  // backend/adapter
  adapter?: ChatAdapter | { send: BackendFn }
  // UI options
  island?: boolean // show dynamic island style toggle
  accentFrom?: string
  accentTo?: string
}
