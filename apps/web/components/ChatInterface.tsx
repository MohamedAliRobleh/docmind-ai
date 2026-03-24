'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader2, Copy, Check } from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'

interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface ChatInterfaceProps {
  docId: string
  niche?: string | null
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-muted hover:text-white"
      title="Copier"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

export default function ChatInterface({ docId, niche }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setMessages([])
    setInput('')
    fetch(`/api/chat?doc_id=${docId}`)
      .then(res => res.json())
      .then(data => setMessages(data.history || []))
      .catch(() => setMessages([]))
  }, [docId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setLoading(true)

    const historySnapshot = [...messages]
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])

    // Add empty assistant message that will be filled by the stream
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    abortRef.current = new AbortController()

    try {
      const chatHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
      if (niche) chatHeaders['x-user-niche'] = niche

      const res = await fetch(`/api/chat?stream=true`, {
        method: 'POST',
        headers: chatHeaders,
        body: JSON.stringify({ doc_id: docId, message: userMsg, history: historySnapshot }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: 'Erreur serveur.' }))
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: err.error || 'Erreur serveur.' }
          return updated
        })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullResponse += chunk

        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: fullResponse, streaming: true }
          return updated
        })
      }

      // Mark streaming done
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: fullResponse }
        return updated
      })

      // Persist conversation
      const finalMessages = [
        ...historySnapshot,
        { role: 'user', content: userMsg },
        { role: 'assistant', content: fullResponse },
      ]
      fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc_id: docId, messages: finalMessages }),
      }).catch(() => {})

    } catch (err: any) {
      if (err?.name === 'AbortError') return
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'Erreur réseau. Réessaie.' }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-purple/20 border border-purple/30 flex items-center justify-center">
          <Bot className="w-4 h-4 text-purple" />
        </div>
        <div>
          <p className="text-sm font-syne font-600">DocuMind Assistant</p>
          <p className="text-xs text-muted">Ask anything about this document</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-xs text-secondary">Ready</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-purple/10 border border-purple/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-purple" />
            </div>
            <div>
              <p className="font-syne font-600 mb-1">Ask anything</p>
              <p className="text-secondary text-sm max-w-xs">What are the key terms? What deadlines are mentioned? Who are the parties involved?</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {['Summarize the main points', 'What are the key dates?', 'Who are the parties?'].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface hover:border-purple/40 hover:text-white text-secondary transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 animate-in group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              msg.role === 'user'
                ? 'bg-accent/15 border border-accent/30'
                : 'bg-purple/15 border border-purple/30'
            }`}>
              {msg.role === 'user'
                ? <User className="w-3.5 h-3.5 text-accent" />
                : <Bot className="w-3.5 h-3.5 text-purple" />
              }
            </div>
            <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'flex-1'}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent/10 border border-accent/20 text-white rounded-tr-sm'
                  : 'bg-raised border border-border text-secondary rounded-tl-sm'
              }`}>
                {msg.role === 'assistant' ? (
                  <>
                    <MarkdownRenderer content={msg.content} />
                    {msg.streaming && (
                      <span className="inline-block w-0.5 h-4 bg-purple ml-0.5 animate-pulse align-middle" />
                    )}
                  </>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === 'assistant' && !msg.streaming && msg.content && (
                <div className="flex items-center gap-1 mt-1 px-1">
                  <CopyButton text={msg.content} />
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.streaming === undefined && (
          <div className="flex gap-3 animate-in">
            <div className="w-7 h-7 rounded-full bg-purple/15 border border-purple/30 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-purple" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-raised border border-border">
              <div className="flex items-center gap-1">
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-muted" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 bg-raised border border-border rounded-xl px-4 py-2.5 focus-within:border-accent/40 transition-colors">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about this document…"
            className="flex-1 bg-transparent text-sm text-white placeholder-muted focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-lg bg-accent text-bg flex items-center justify-center hover:bg-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
