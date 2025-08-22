import type { ChatAdapter, ChatMessage, SendResult } from '../types'

const SAMPLE_MESSAGES: ChatMessage[] = [
  { id: '1', role: 'system', text: 'You are Aurora, a helpful assistant.' },
  { id: '2', role: 'assistant', text: 'Hello! I am Aurora. How can I assist you today?' },
  { id: '3', role: 'user', text: "Show me a sample of things you can do." },
  { id: '4', role: 'assistant', text: "I can answer questions, summarize text, and demo mock replies. Try typing something!" },
]

function randomDelay(min = 300, max = 1200) {
  return Math.floor(Math.random() * (max - min)) + min
}

export class SampleChatAdapter implements ChatAdapter {
  async getInitialMessages(): Promise<ChatMessage[]> {
    await new Promise((r) => setTimeout(r, 300))
    return SAMPLE_MESSAGES
  }

  async sendMessage(message: ChatMessage): Promise<SendResult> {
    // simulate server thinking
    await new Promise((r) => setTimeout(r, randomDelay(500, 900)))

    // simulate occasional transient error
    if (Math.random() < 0.06) {
      throw new Error('Network error')
    }

    const reply: ChatMessage = {
      id: String(Date.now()),
      role: 'assistant',
      text: `Mock reply: I received your message "${message.text}" and here's a helpful reply.`,
    }

    return { message: reply }
  }
}
