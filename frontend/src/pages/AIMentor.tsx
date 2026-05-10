import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Send, Cpu, MessageSquare, Code2, Lightbulb, ChevronRight, Copy, Check } from 'lucide-react'
import api from '../services/api'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'bob'
  content: string
  code?: { title: string; language: string; code: string }
  followUps?: string[]
  timestamp: Date
}

const SUGGESTED_QUESTIONS = [
  'How does the overall architecture work?',
  'What are the main components and how do they connect?',
  'How do I add a new page to this project?',
  'Explain the state management approach',
  'How do API calls work in this codebase?',
  'What patterns and best practices are used here?',
]

export default function AIMentor() {
  const { repoId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { data: repos = [] } = useQuery({
    queryKey: ['repositories'],
    queryFn: async () => (await api.get('/api/repositories')).data,
  })

  const { data: repo } = useQuery({
    queryKey: ['repository', repoId],
    queryFn: async () => (await api.get(`/api/repositories/${repoId}`)).data,
    enabled: !!repoId,
  })

  useEffect(() => {
    if (repoId && repo) {
      setMessages([{
        id: 'welcome',
        role: 'bob',
        content: `👋 Hi! I'm IBM Bob, your AI development partner.\n\nI've analyzed **${repo.name}** and I'm ready to answer any questions about the codebase. I understand the full repository context — architecture, components, patterns, and everything in between.\n\nWhat would you like to know?`,
        followUps: SUGGESTED_QUESTIONS.slice(0, 3),
        timestamp: new Date(),
      }])
    } else if (!repoId) {
      setMessages([{
        id: 'welcome',
        role: 'bob',
        content: `👋 Hi! I'm **IBM Bob**, your AI development partner.\n\nSelect a repository to start asking questions. I'll analyze the full codebase and provide context-aware answers about architecture, components, patterns, and how everything fits together.`,
        timestamp: new Date(),
      }])
    }
  }, [repoId, repo])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = useCallback(async (question?: string) => {
    const q = question || input.trim()
    if (!q || !repoId) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: q,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const { data } = await api.post(`/api/repositories/${repoId}/ask`, { question: q })
      const bobMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bob',
        content: data.explanation || data.answer || '',
        code: data.codeExample,
        followUps: data.followUpQuestions,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, bobMsg])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'bob',
        content: '⚠️ I encountered an error. Please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }, [input, repoId])

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100vh - var(--topbar-height) - 64px)', gap: 0, margin: '-32px', marginTop: 0 }}>
      {/* Left: Repo Selector + Suggested */}
      <div style={{ borderRight: '1px solid var(--border-subtle)', padding: 20, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto', background: 'var(--bg-secondary)' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10 }}>Repository</div>
          {repos.filter((r: any) => r.status === 'READY').map((r: any) => (
            <button key={r.id} onClick={() => navigate(`/mentor/${r.id}`)}
              style={{
                width: '100%', padding: '10px 12px', textAlign: 'left', background: r.id === repoId ? 'var(--brand-glow)' : 'transparent',
                border: `1px solid ${r.id === repoId ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
                borderRadius: 'var(--radius-md)', cursor: 'pointer', marginBottom: 4,
                color: r.id === repoId ? 'var(--brand-light)' : 'var(--text-secondary)',
                fontSize: '0.875rem', fontWeight: r.id === repoId ? 600 : 400, transition: 'all 0.15s',
              }}>
              {r.name}
            </button>
          ))}
          {repos.filter((r: any) => r.status === 'READY').length === 0 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No analyzed repos yet. Connect one from the Dashboard.</p>
          )}
        </div>

        {repoId && (
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10 }}>Suggested Questions</div>
            {SUGGESTED_QUESTIONS.map(q => (
              <button key={q} onClick={() => sendMessage(q)}
                style={{
                  width: '100%', padding: '8px 12px', textAlign: 'left', background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  marginBottom: 6, color: 'var(--text-secondary)', fontSize: '0.78rem', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--border-active)'; (e.target as HTMLElement).style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border-subtle)'; (e.target as HTMLElement).style.color = 'var(--text-secondary)' }}>
                <Lightbulb size={12} style={{ marginTop: 2, color: 'var(--accent-amber)', flexShrink: 0 }} />
                {q}
              </button>
            ))}
          </div>
        )}

        <div style={{ marginTop: 'auto' }}>
          <div className="bob-indicator">
            <div className="bob-dot" />
            <span>Bob analyzing with full context</span>
          </div>
        </div>
      </div>

      {/* Right: Chat */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--brand-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={18} style={{ color: 'var(--brand-light)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>IBM Bob — AI Code Mentor</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {repo ? `Analyzing: ${repo.name} (${repo.analysis?.fileCount || 0} files)` : 'Select a repository to begin'}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.map(msg => (
            <div key={msg.id} className={`chat-message ${msg.role}`}>
              <div className="chat-avatar" style={{
                background: msg.role === 'bob' ? 'linear-gradient(135deg, var(--brand-primary), #8b5cf6)' : 'var(--bg-card)',
                border: msg.role === 'user' ? '1px solid var(--border-medium)' : 'none',
              }}>
                {msg.role === 'bob' ? <Cpu size={16} /> : '👤'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={`chat-bubble ${msg.role}`}>
                  <div style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>
                    {msg.role === 'bob' ? (
                      <div style={{ color: 'var(--text-primary)' }}>
                        {msg.content.split('\\n').map((line, i) => {
                          if (line.startsWith('**') && line.endsWith('**'))
                            return <strong key={i}>{line.slice(2, -2)}</strong>
                          if (line.startsWith('- '))
                            return <div key={i} style={{ paddingLeft: 12, borderLeft: '2px solid var(--border-active)', marginLeft: 4, marginBottom: 4 }}>{line.slice(2)}</div>
                          return <p key={i} style={{ color: 'var(--text-primary)', marginBottom: line ? 6 : 0 }}>{line || <br />}</p>
                        })}
                      </div>
                    ) : msg.content}
                  </div>

                  {msg.code && (
                    <div className="code-block" style={{ marginTop: 12 }}>
                      <div className="code-block-header">
                        <span><Code2 size={12} style={{ marginRight: 6 }} />{msg.code.title}</span>
                        <button onClick={() => copyCode(msg.id, msg.code!.code)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          {copiedId === msg.id ? <Check size={12} style={{ color: 'var(--accent-green)' }} /> : <Copy size={12} />}
                        </button>
                      </div>
                      <pre style={{ padding: 16, fontSize: '0.78rem', color: '#e2e8f0', overflowX: 'auto' }}>
                        <code>{msg.code.code}</code>
                      </pre>
                    </div>
                  )}
                </div>

                {msg.followUps && msg.followUps.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                    {msg.followUps.map(q => (
                      <button key={q} onClick={() => sendMessage(q)}
                        style={{
                          padding: '5px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-full)', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--brand-light)',
                          display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                        }}>
                        <ChevronRight size={10} /> {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-message bob animate-fade-in">
              <div className="chat-avatar" style={{ background: 'linear-gradient(135deg, var(--brand-primary), #8b5cf6)' }}>
                <Cpu size={16} />
              </div>
              <div className="chat-bubble bob" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="bob-dot" style={{ width: 6, height: 6 }} />
                <div className="bob-dot" style={{ width: 6, height: 6, animationDelay: '0.2s' }} />
                <div className="bob-dot" style={{ width: 6, height: 6, animationDelay: '0.4s' }} />
                <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>IBM Bob is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={repoId ? 'Ask IBM Bob anything about this codebase...' : 'Select a repository first...'}
              disabled={!repoId || isTyping}
              rows={1}
              style={{
                width: '100%', padding: '12px 16px', background: 'var(--bg-secondary)',
                border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)',
                color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.875rem',
                resize: 'none', outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-medium)'}
            />
          </div>
          <button className="btn btn-primary" onClick={() => sendMessage()}
            disabled={!input.trim() || !repoId || isTyping}
            style={{ padding: '12px 16px' }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
