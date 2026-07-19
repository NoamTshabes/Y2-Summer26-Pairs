import { useEffect, useRef, useState } from 'react'
import { supabase, parseSections, type AgentId, type ChatMessage, type ParsedSections } from './lib/supabase'
import { callAgent } from './lib/agents'
import { exportToPdf } from './lib/pdf'

interface AgentMeta {
  id: AgentId
  name: string
  short: string
  role: string
  description: string
  tags: string[]
  placeholder: string
  suggestions: string[]
  avatar: string
}

const AGENTS: AgentMeta[] = [
  {
    id: 'agent1',
    name: 'The Training Programmer',
    short: 'Workout Splits',
    role: 'Elite Physical Performance Coach',
    description:
      'Designs structured weekly workout splits tailored to your specific physical goals, fitness level, and training availability.',
    tags: ['Workout splits', 'Periodization', 'Strength', 'Conditioning'],
    placeholder:
      'Describe your physical goals, current metrics, experience level, and weekly training availability...',
    suggestions: [
      'Hypertrophy split, 4 days/week, intermediate, 60-min sessions',
      'Beginner fat-loss plan, 3 days/week, home with dumbbells',
      'Marathon prep, 5 days/week, 10K baseline, 12 weeks out',
    ],
    avatar: 'T',
  },
  {
    id: 'agent2',
    name: 'The Performance Nutritionist',
    short: 'Meal Plans',
    role: 'Specialized Sports Nutritionist',
    description:
      'Analyzes your workout split, calculates daily macros and calories, and outputs a matching meal plan and grocery list. Exportable as PDF.',
    tags: ['Macros', 'Meal plan', 'Grocery list', 'PDF export'],
    placeholder:
      'Paste the workout split from Agent 1, plus your goals, dietary restrictions, and food preferences...',
    suggestions: [
      'Paste my hypertrophy split. Goal: lean bulk. No dairy. Prefer high-protein.',
      'Cutting plan, 2200 kcal target, vegetarian, no nuts.',
      'Endurance focus, 5 meals/day, Mediterranean style, 180 lbs.',
    ],
    avatar: 'N',
  },
]

type LocalMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function App() {
  const [active, setActive] = useState<AgentId>('agent1')
  const [messagesByAgent, setMessagesByAgent] = useState<Record<AgentId, LocalMessage[]>>({
    agent1: [],
    agent2: [],
  })
  const [loading, setLoading] = useState(false)
  const [pdfBusy, setPdfBusy] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const activeMeta = AGENTS.find((a) => a.id === active)!
  const messages = messagesByAgent[active]

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }, [draft])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    const userMsg: LocalMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed }
    setMessagesByAgent((prev) => ({ ...prev, [active]: [...prev[active], userMsg] }))
    setDraft('')
    setLoading(true)
    const res = await callAgent(active, trimmed)
    const aiMsg: LocalMessage = { id: crypto.randomUUID(), role: 'assistant', content: res.content }
    setMessagesByAgent((prev) => ({ ...prev, [active]: [...prev[active], aiMsg] }))
    setLoading(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(draft)
    }
  }

  async function downloadPdf(msg: LocalMessage) {
    setPdfBusy(msg.id)
    try {
      exportToPdf(msg.content, 'The_Blueprint.pdf')
    } finally {
      setPdfBusy(null)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M6 4h3v16H6zM15 4h3v16h-3zM9 9h6v3H9zM9 13h6v3H9z" fill="#04121f" />
            </svg>
          </div>
          <div>
            <div className="brand-title">The Athlete's Blueprint</div>
            <div className="brand-sub">AI Training &amp; Nutrition Co-Pilot</div>
          </div>
        </div>
        <div className="header-meta">
          <span className="status-dot" />
          <span>Two specialized agents · Live</span>
        </div>
      </header>

      <nav className="tabs">
        {AGENTS.map((a) => (
          <button
            key={a.id}
            className={`tab ${active === a.id ? 'active' : ''}`}
            onClick={() => setActive(a.id)}
            aria-selected={active === a.id}
          >
            <span className="tab-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {a.id === 'agent1' ? (
                  <path d="M6 4h3v16H6zM15 4h3v16h-3zM9 9h6v3H9zM9 13h6v3H9z" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h10" />
                )}
              </svg>
            </span>
            <span className="tab-meta">
              <span>{a.name}</span>
              <span className="tab-label-sub">{a.short}</span>
            </span>
          </button>
        ))}
      </nav>

      <main className="chat-panel">
        <div className="agent-banner">
          <div className="agent-avatar">{activeMeta.avatar}</div>
          <div className="agent-info">
            <h2>{activeMeta.name}</h2>
            <p>{activeMeta.description}</p>
            <div className="agent-tags">
              {activeMeta.tags.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="messages" ref={scrollRef}>
          {messages.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {active === 'agent1' ? (
                    <path d="M6 4h3v16H6zM15 4h3v16h-3zM9 9h6v3H9zM9 13h6v3H9z" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h10" />
                  )}
                </svg>
              </div>
              <h3>Ready when you are</h3>
              <p>{activeMeta.role}. Share the details below and {activeMeta.name.split(' ').slice(-1)[0]} will build your blueprint.</p>
              <div className="suggestions">
                {activeMeta.suggestions.map((s) => (
                  <button key={s} className="suggestion-chip" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              agent={active}
              meta={activeMeta}
              onPdf={() => downloadPdf(m)}
              pdfBusy={pdfBusy === m.id}
            />
          ))}

          {loading && (
            <div className="message agent">
              <div className="msg-avatar">{activeMeta.avatar}</div>
              <div className="msg-bubble">
                <div className="typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-label">{activeMeta.name} is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="composer">
          <div className="composer-row">
            <textarea
              ref={textareaRef}
              className="composer-input"
              placeholder={activeMeta.placeholder}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
            />
            <button
              className="send-btn"
              onClick={() => send(draft)}
              disabled={!draft.trim() || loading}
              aria-label="Send message"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          <div className="composer-hint">
            <span>Press <span className="kbd">Enter</span> to send · <span className="kbd">Shift+Enter</span> for newline</span>
            <span>{messages.length} messages</span>
          </div>
        </div>
      </main>
    </div>
  )
}

function MessageBubble({
  message,
  agent,
  meta,
  onPdf,
  pdfBusy,
}: {
  message: LocalMessage
  agent: AgentId
  meta: AgentMeta
  onPdf: () => void
  pdfBusy: boolean
}) {
  const isUser = message.role === 'user'
  const parsed: ParsedSections | null = !isUser ? parseSections(message.content) : null
  const isAssistantError = !isUser && message.content.startsWith('[Summary]: Error')

  return (
    <div className={`message ${isUser ? 'user' : 'agent'}`}>
      <div className="msg-avatar">{isUser ? 'You' : meta.avatar}</div>
      <div className={`msg-bubble ${isAssistantError ? 'error-bubble' : ''}`}>
        {isUser ? (
          message.content
        ) : parsed && (parsed.summary || parsed.response || parsed.nextStep) ? (
          <div className="sections">
            {parsed.summary && (
              <div className="section section-summary">
                <div className="section-label">Summary</div>
                <div className="section-body">{parsed.summary}</div>
              </div>
            )}
            {parsed.response && (
              <div className="section section-response">
                <div className="section-label">Response</div>
                <div className="section-body">{parsed.response}</div>
              </div>
            )}
            {parsed.nextStep && (
              <div className="section section-next-step">
                <div className="section-label">Next Step</div>
                <div className="section-body">{parsed.nextStep}</div>
              </div>
            )}
            {agent === 'agent2' && !isAssistantError && (
              <div className="pdf-action">
                <span className="pdf-action-text">Deliverable ready — export your blueprint as a PDF.</span>
                <button className="btn-pdf" onClick={onPdf} disabled={pdfBusy}>
                  {pdfBusy ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
            )}
          </div>
        ) : (
          message.content
        )}
      </div>
    </div>
  )
}
