import { useState, useRef, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || ''

type Message = { role: 'user' | 'ai'; text: string }

export default function ChatWidget({ lang }: { lang: 'ru' | 'en' }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      ru: {
        title: 'Jarvis AI',
        subtitle: 'Спросите о возможностях Jarvis',
        placeholder: 'Ваш вопрос...',
        greeting: 'Привет! Я Jarvis AI. Задайте вопрос о платформе — тарифах, функциях, интеграциях.',
      },
      en: {
        title: 'Jarvis AI',
        subtitle: 'Ask about Jarvis features',
        placeholder: 'Your question...',
        greeting: 'Hi! I\'m Jarvis AI. Ask me about the platform — pricing, features, integrations.',
      },
    }
    return translations[lang]?.[key] ?? key
  }

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'ai', text: t('greeting') }])
    }
  }, [open])

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

    try {
      const res = await fetch(`${API}/api/chat/docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, history, lang }),
      })

      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'ai', text: lang === 'ru' ? 'Ошибка сервера' : 'Server error' }])
        setLoading(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let aiText = ''
      setMessages(prev => [...prev, { role: 'ai', text: '' }])

      if (reader) {
        let buf = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() || ''
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              try {
                const parsed = JSON.parse(data)
                if (parsed.text) {
                  aiText += parsed.text
                  setMessages(prev => {
                    const copy = [...prev]
                    copy[copy.length - 1] = { role: 'ai', text: aiText }
                    return copy
                  })
                }
              } catch {}
            }
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: lang === 'ru' ? 'Не удалось подключиться' : 'Connection failed' }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* FAB button */}
      {!open && (
        <button onClick={() => setOpen(true)} style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
          border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', color: 'white', transition: 'transform 0.2s',
        }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          💬
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 380, height: 520, borderRadius: 16,
          background: 'var(--bg-secondary, #111827)',
          border: '1px solid var(--border, #1e293b)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '0.75rem 1rem', borderBottom: '1px solid var(--border, #1e293b)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #6366f120, #0ea5e920)',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary, #e2e8f0)' }}>{t('title')}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary, #64748b)' }}>{t('subtitle')}</div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', color: 'var(--text-tertiary, #64748b)',
              cursor: 'pointer', fontSize: '1.2rem', padding: '0.25rem',
            }}>✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{
            flex: 1, overflowY: 'auto', padding: '0.75rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%', padding: '0.5rem 0.75rem', borderRadius: 12,
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : 'var(--bg-tertiary, #1e293b)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary, #e2e8f0)',
                fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-wrap',
              }}>
                {msg.text || (loading && i === messages.length - 1 ? '...' : '')}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border, #1e293b)',
            display: 'flex', gap: '0.5rem',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder={t('placeholder')}
              disabled={loading}
              style={{
                flex: 1, padding: '0.5rem 0.75rem', borderRadius: 8,
                background: 'var(--bg-primary, #0b0f1a)',
                border: '1px solid var(--border, #334155)',
                color: 'var(--text-primary, #e2e8f0)',
                fontSize: '0.85rem', outline: 'none',
              }}
            />
            <button onClick={send} disabled={loading || !input.trim()} style={{
              padding: '0.5rem 0.75rem', borderRadius: 8,
              background: loading ? '#4338ca' : '#6366f1',
              border: 'none', color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: '0.85rem',
            }}>→</button>
          </div>
        </div>
      )}
    </>
  )
}
