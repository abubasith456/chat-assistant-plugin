import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChatWidgetProps, ChatMessage, ChatAdapter, BackendFn } from '../types'
import { SampleChatAdapter } from '../adapters/sampleAdapter'
import MessageBubble from './MessageBubble'
import '../styles/chat.css'

function useAutoScroll(containerRef: React.RefObject<HTMLElement>, deps: any[]) {
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, deps)
}

export default function ChatWidget(props: ChatWidgetProps) {
  const {
    title = 'Aurora Assistant',
    placeholder = 'Type a message...',
    welcomeMessage = 'Hello! I am Aurora — a helpful assistant.',
    theme = 'dark',
    position = 'bottom-right',
    initialOpen = false,
    messages: controlledMessages,
    onMessagesChange,
    adapter,
  island = true,
  accentFrom,
  accentTo,
  } = props

  const [open, setOpen] = useState<boolean>(initialOpen)
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isControlled = Array.isArray(controlledMessages)
  const messages = isControlled ? (controlledMessages as ChatMessage[]) : internalMessages

  const bodyRef = useRef<HTMLDivElement | null>(null)
  useAutoScroll(bodyRef, [messages])

  const resolvedAdapter: ChatAdapter | { send: BackendFn } = useMemo(() => {
  if (adapter) return adapter
  // fallback to sample adapter
  return new SampleChatAdapter()
  }, [adapter])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        if ('getInitialMessages' in (resolvedAdapter as ChatAdapter)) {
          const res = await (resolvedAdapter as ChatAdapter).getInitialMessages()
          if (!mounted) return
          if (!isControlled) setInternalMessages(res)
        } else {
          // no-op: vanilla adapter will provide messages via init
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load messages')
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [resolvedAdapter, isControlled])

  const pushMessage = useCallback(
    (m: ChatMessage) => {
      if (isControlled) {
        const next = [...(controlledMessages || []), m]
        onMessagesChange?.(next)
      } else {
        setInternalMessages((s) => [...s, m])
      }
    },
    [controlledMessages, isControlled, onMessagesChange]
  )

  const send = useCallback(async () => {
    if (!input.trim()) return
    setError(null)
    const userMsg: ChatMessage = { id: String(Date.now()), role: 'user', text: input }
    pushMessage(userMsg)
    setInput('')
    setLoading(true)

    try {
      let result
      if ('sendMessage' in (resolvedAdapter as ChatAdapter)) {
        result = await (resolvedAdapter as ChatAdapter).sendMessage(userMsg)
      } else if ('send' in (resolvedAdapter as any)) {
        result = await (resolvedAdapter as any).send(userMsg)
      }

      if (result && result.message) {
        pushMessage(result.message)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send message')
      // push an error system message
      pushMessage({ id: String(Date.now() + 1), role: 'system', text: 'Error: failed to send. Try again.' })
    } finally {
      setLoading(false)
    }
  }, [input, pushMessage, resolvedAdapter])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const positionClass = position === 'bottom-left' ? 'left-4' : 'right-4'
  const themeClass = theme === 'light' ? 'text-slate-900' : 'text-white'

  // apply CSS variables for accent if provided
  const accentStyle: React.CSSProperties | undefined = accentFrom || accentTo ? {
    ['--ca-accent-from' as any]: accentFrom || undefined,
    ['--ca-accent-to' as any]: accentTo || undefined,
  } : undefined

  return (
    <div className={`fixed bottom-6 ${positionClass} z-50`}> 
      {/* Toggle button */}
      <div style={accentStyle}>
        {island ? (
          <button
            aria-label={open ? 'Close chat' : 'Open chat'}
            onClick={() => setOpen((v) => !v)}
            className={`dynamic-island-toggle focus:outline-none`}
          >
            <span className="sr-only">{open ? 'Close' : 'Open'} chat</span>
            {open ? '×' : <span className="dynamic-island-pill" aria-hidden />}
          </button>
        ) : (
          <button
            aria-label={open ? 'Close chat' : 'Open chat'}
            onClick={() => setOpen((v) => !v)}
            className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white focus:outline-none"
          >
            {open ? '×' : '💬'}
          </button>
        )}
      </div>

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Chat assistant"
        className={`mt-3 transform transition-all duration-300 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <div className={`w-[380px] md:w-[420px] rounded-2xl overflow-hidden shadow-2xl ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} border border-white/6`}>
          <div className={`p-3 flex items-center gap-3 ${theme === 'light' ? 'bg-white' : 'bg-gradient-to-br from-indigo-700 to-purple-700'}`}>
            <div className="w-10 h-10 rounded-md bg-white/20" aria-hidden />
            <div>
              <div className={`font-semibold ${themeClass}`}>{title}</div>
              <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-200'}`}>{welcomeMessage}</div>
            </div>
          </div>

          <div ref={bodyRef} className={`p-4 max-h-[50vh] overflow-auto space-y-3 ${theme === 'light' ? 'bg-white' : 'bg-slate-900'}`}>
            {messages.map((m) => (
              <div key={m.id}>
                <MessageBubble message={m} />
              </div>
            ))}
            {loading && <div className="text-sm text-slate-400">Aurora is typing...</div>}
            {error && <div className="text-sm text-red-400">{error}</div>}
          </div>

          <div className="p-3 border-t border-white/6 bg-transparent">
            <div className="flex gap-2">
              <input
                aria-label="Chat input"
                className="flex-1 rounded-md p-2 px-3 bg-white/5 placeholder:text-slate-300 outline-none text-white"
                placeholder={placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
              />
              <button
                onClick={send}
                disabled={loading}
                className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-md disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
