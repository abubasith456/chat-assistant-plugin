export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
}

export interface ChatAdapter {
  getInitialMessages(): Promise<ChatMessage[]>
  sendMessage(message: ChatMessage): Promise<ChatMessage>
}
