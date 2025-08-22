import React from 'react'
import ChatWidget from './components/ChatWidget'
import { SampleChatAdapter } from './adapters/sampleAdapter'

function App() {
  const adapter = new SampleChatAdapter()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-6">
      <ChatWidget adapter={adapter} />
    </div>
  )
}

export default App
