import React, { useEffect, useState } from 'react'
import type { ChatAdapter, ChatMessage } from '../types'
import MessageBubble from './MessageBubble'

import '../styles/chat.css'

type Props = {
  adapter: ChatAdapter
}

export default function ChatWidget({ adapter }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    let mounted = true
    adapter.getInitialMessages().then((m) => {
      if (mounted) setMessages(m)
    })
    return () => {
      mounted = false
    }
  }, [adapter])

  async function send() {
    if (!input.trim()) return
    const userMsg: ChatMessage = { id: String(Date.now()), role: 'user', text: input }
    setMessages((s) => [...s, userMsg])
    setInput('')
    const reply = await adapter.sendMessage(userMsg)
    setMessages((s) => [...s, reply])
  }

  return (
    <div className="chat-widget w-[420px] bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
      <div className="chat-header p-4 flex items-center gap-3">
        <div className="logo w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 animate-pulse" />
        <div>
          <div className="text-white font-semibold">Aurora Assistant</div>
          <div className="text-sm text-slate-300">Sample smart assistant • Offline mock</div>
        </div>
      </div>

      <div className="chat-body p-4 max-h-[60vh] overflow-auto space-y-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>

      <div className="chat-input p-4 border-t border-white/6 flex gap-3">
        <input
          className="flex-1 rounded-lg p-3 bg-white/6 text-white placeholder:text-slate-300 outline-none transition shadow-sm"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg shadow-md hover:scale-105 transition-transform"
        >
          Send
        </button>
      </div>
    </div>
  )
}
