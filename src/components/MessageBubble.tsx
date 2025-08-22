import React from 'react'
import type { ChatMessage } from '../types'

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`message flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`bubble max-w-[80%] p-3 rounded-2xl text-white text-sm ${
          isUser ? 'bg-gradient-to-br from-indigo-500 to-purple-500 animate-send' : 'bg-white/6 backdrop-blur-sm'
        }`}
      >
        {message.text}
      </div>
    </div>
  )
}
