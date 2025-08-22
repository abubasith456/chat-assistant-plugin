import type { ChatAdapter, ChatMessage } from '../types'

const SAMPLE_MESSAGES: ChatMessage[] = [
  { id: '1', role: 'system', text: 'You are Aurora, a helpful assistant.' },
  { id: '2', role: 'assistant', text: 'Hello! I am Aurora. How can I assist you today?' },
  { id: '3', role: 'user', text: "Show me a sample of things you can do." },
  { id: '4', role: 'assistant', text: "I can answer questions, summarize text, and demo mock replies. Try typing something!" },
]

export class SampleChatAdapter implements ChatAdapter {
  async getInitialMessages(): Promise<ChatMessage[]> {
    // simulate network delay
    await new Promise((r) => setTimeout(r, 400))
    return SAMPLE_MESSAGES
  }

  async sendMessage(message: ChatMessage): Promise<ChatMessage> {
    await new Promise((r) => setTimeout(r, 700))
    // generate a playful mock reply
    const reply: ChatMessage = {
      id: String(Date.now()),
      role: 'assistant',
      text: `Thanks for asking "${message.text}" — here's a mock reply generated offline.`,
    }
    return reply
  }
}
