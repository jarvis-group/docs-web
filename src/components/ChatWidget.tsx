import { useState, useRef, useEffect } from 'react'
import { Button, Input } from '@jarvis/ui'
import { streamSSE, type Lang } from '@jarvis/shared'

interface Props {
  lang: Lang
  t: (key: string) => string
}

type Message = { role: 'user' | 'ai'; text: string }

export default function ChatWidget({ lang, t }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'ai', text: t('chat.greeting') }])
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    const history = messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', text: m.text }))
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)

    let aiText = ''
    setMessages(prev => [...prev, { role: 'ai', text: '' }])

    try {
      await streamSSE('/api/chat/docs', { text, history, lang }, {
        onToken: (token) => {
          aiText += token
          setMessages(prev => {
            const copy = [...prev]
            copy[copy.length - 1] = { role: 'ai', text: aiText }
            return copy
          })
        },
        onError: () => {
          setMessages(prev => {
            const copy = [...prev]
            copy[copy.length - 1] = { role: 'ai', text: t('chat.error') }
            return copy
          })
        },
      })
    } catch {
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'ai', text: t('chat.offline') }
        return copy
      })
    }
    setLoading(false)
  }

  return (
    <>
      {/* FAB button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[1000] w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-cyan border-none cursor-pointer shadow-lg flex items-center justify-center text-2xl text-white transition-transform hover:scale-110"
        >
          💬
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[1000] w-[380px] h-[520px] rounded-xl bg-background-secondary border border-border shadow-lg flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-gradient-to-r from-accent/10 to-accent-cyan/10">
            <div>
              <div className="font-bold text-sm text-foreground">{t('chat.title')}</div>
              <div className="text-[0.7rem] text-foreground-muted">{t('chat.subtitle')}</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="bg-transparent border-none text-foreground-muted cursor-pointer text-lg p-1 hover:text-foreground transition-colors"
            >
              &#10005;
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'self-end bg-gradient-to-br from-accent to-bubble-user text-white'
                    : 'self-start bg-background-tertiary text-foreground'
                }`}
              >
                {msg.text || (loading && i === messages.length - 1 ? '...' : '')}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send() }}
              placeholder={t('chat.placeholder')}
              disabled={loading}
              className="flex-1 text-sm"
            />
            <Button
              onClick={send}
              disabled={loading || !input.trim()}
              size="sm"
              className="px-3"
            >
              &rarr;
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
