// ============================================================
// WhiteStellar — AI Matching Agent (Floating Widget)
// src/components/MatchingAgent.tsx
// StarGuide: helps visitors find the right advisor via chat
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { X, Send, Sparkles, Heart, Briefcase, Compass, Eye, MoreHorizontal } from 'lucide-react'
import { createMatchingSession, sendMatchingMessage } from '../lib/api/matching'
import { useAuthStore } from '../store/authStore'

// ─── Types ────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type Phase = 'closed' | 'gender' | 'topic' | 'chat'

// ─── Static options ────────────────────────────────────────────

const GENDER_OPTIONS = [
  { id: 'female', symbol: '♀', label: 'Female' },
  { id: 'male',   symbol: '♂', label: 'Male'   },
  { id: 'other',  symbol: '○', label: 'Other'  },
]

const TOPIC_OPTIONS = [
  { id: 'love',    icon: Heart,          label: 'Love & Relationship' },
  { id: 'career',  icon: Briefcase,      label: 'Career & Work'       },
  { id: 'destiny', icon: Compass,        label: 'Destiny & Life Path' },
  { id: 'future',  icon: Eye,            label: 'Future Telling'      },
  { id: 'spirit',  icon: Sparkles,       label: 'Spirit Guidance'     },
  { id: 'other',   icon: MoreHorizontal, label: 'Other'               },
]

// ─── Sub-components ───────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px',
      }}>✦</div>
      <div style={{
        background: '#1A2540', border: '1px solid #1E2D45',
        borderRadius: '4px 16px 16px 16px', padding: '10px 14px',
        display: 'flex', gap: '4px', alignItems: 'center',
      }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%', background: '#8B9BB4',
            animation: `ma-bounce 1s ease-in-out ${delay}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────

interface MatchingAgentProps {
  initialOpen?: boolean
}

export default function MatchingAgent({ initialOpen = false }: MatchingAgentProps) {
  const { user } = useAuthStore()

  const [phase, setPhase] = useState<Phase>(initialOpen ? 'gender' : 'closed')
  const [gender, setGender] = useState<string | null>(null)
  const [topic, setTopic] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [history, setHistory] = useState<{ role: string; content: string }[]>([])
  const [hasRecommendations, setHasRecommendations] = useState(false)
  const [unread, setUnread] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sessionCreated = useRef(false)

  const isOpen = phase !== 'closed'

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Focus input when chat phase starts
  useEffect(() => {
    if (phase === 'chat') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [phase])

  // Create session + send opening message when entering chat phase
  useEffect(() => {
    if (phase !== 'chat' || sessionCreated.current) return
    sessionCreated.current = true

    async function init() {
      setIsTyping(true)
      try {
        const sess = await createMatchingSession(user?.id ?? null)
        setSessionId(sess.id)

        const openingText = `I'm StarGuide ✨ — I'm here to help you find the perfect advisor. You've told me you're ${gender ?? 'not specified'} and interested in ${topic ?? 'general guidance'}. Tell me a little more about what's on your mind — I'll find the best match for you.`

        const opening: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: openingText,
        }
        setMessages([opening])
        setHistory([{ role: 'assistant', content: openingText }])
      } catch {
        // If session creation fails, still show a local opening
        const opening: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `I'm StarGuide ✨ — tell me what's on your mind and I'll find the right advisor for you.`,
        }
        setMessages([opening])
        setHistory([{ role: 'assistant', content: opening.content }])
      } finally {
        setIsTyping(false)
      }
    }

    init()
  }, [phase, gender, topic, user?.id])

  function openWidget() {
    setPhase('gender')
    setUnread(0)
  }

  function closeWidget() {
    setPhase('closed')
  }

  function handleSelectGender(g: string) {
    setGender(g)
    setPhase('topic')
  }

  function handleSelectTopic(t: string) {
    setTopic(t)
    setPhase('chat')
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || isTyping) return
    setInput('')

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    const newHistory = [...history, { role: 'user', content: text }]

    try {
      const result = await sendMatchingMessage({
        matchingSessionId: sessionId ?? 'local',
        userMessage: text,
        guidedAnswers: { gender, topic },
        conversationHistory: history,
      })

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.reply,
      }
      setMessages(prev => [...prev, assistantMsg])

      const updatedHistory = [
        ...newHistory,
        { role: 'assistant', content: result.reply },
      ]
      setHistory(updatedHistory)

      if (result.hasRecommendations) {
        setHasRecommendations(true)
      }
    } catch {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having a moment of cosmic interference. Try browsing our advisors directly — they're wonderful!",
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes ma-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes ma-pop {
          from { opacity: 0; transform: scale(0.85) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes ma-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.5); }
          50%       { box-shadow: 0 0 0 8px rgba(201,168,76,0); }
        }
      `}</style>

      {/* ── Floating button ── */}
      {!isOpen && (
        <button
          onClick={openWidget}
          aria-label="Open advisor matching"
          style={{
            position: 'fixed', bottom: '24px', left: '24px', zIndex: 300,
            width: '60px', height: '60px', borderRadius: '50%', border: 'none',
            background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
            color: '#0B0F1A', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(201,168,76,0.45)',
            animation: 'ma-pulse 2.5s ease-in-out infinite',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
        >
          <Sparkles size={24} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: '-2px', right: '-2px',
              width: '18px', height: '18px', borderRadius: '50%',
              background: '#EF4444', color: '#fff', fontSize: '10px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #0B0F1A',
            }}>{unread}</span>
          )}
        </button>
      )}

      {/* ── Chat panel ── */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '24px', zIndex: 300,
          width: 'min(380px, calc(100vw - 32px))',
          maxHeight: 'min(600px, calc(100vh - 48px))',
          background: '#0D1221', border: '1px solid #1E2D45',
          borderRadius: '20px', boxShadow: '0 16px 64px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          animation: 'ma-pop 0.25s cubic-bezier(0.22,1,0.36,1) both',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid #1E2D45',
            background: '#0B1020',
            display: 'flex', alignItems: 'center', gap: '10px',
            flexShrink: 0,
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', flexShrink: 0,
            }}>✦</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '14px', margin: 0 }}>StarGuide</p>
              <p style={{ color: '#C9A84C', fontSize: '11px', margin: 0 }}>AI Advisor Matching</p>
            </div>
            <button
              onClick={closeWidget}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', padding: '4px', flexShrink: 0 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Phase: Gender selection ── */}
          {phase === 'gender' && (
            <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              <p style={{ color: '#F0F4FF', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                Welcome ✨ I'm StarGuide. Let me help you find the perfect advisor in seconds. First — what's your gender?
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {GENDER_OPTIONS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => handleSelectGender(g.id)}
                    style={{
                      flex: 1, padding: '14px 8px', borderRadius: '12px', border: '1px solid #1E2D45',
                      background: '#131929', color: '#F0F4FF', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      transition: 'all 0.15s', fontSize: '13px', fontWeight: 600,
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLButtonElement
                      el.style.borderColor = '#C9A84C'
                      el.style.background = 'rgba(201,168,76,0.08)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLButtonElement
                      el.style.borderColor = '#1E2D45'
                      el.style.background = '#131929'
                    }}
                  >
                    <span style={{ fontSize: '22px', color: '#C9A84C' }}>{g.symbol}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Phase: Topic selection ── */}
          {phase === 'topic' && (
            <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
              <p style={{ color: '#F0F4FF', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                Great! Now, what topic are you seeking guidance on?
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {TOPIC_OPTIONS.map(t => {
                  const Icon = t.icon
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTopic(t.id)}
                      style={{
                        padding: '12px 8px', borderRadius: '12px', border: '1px solid #1E2D45',
                        background: '#131929', color: '#F0F4FF', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                        transition: 'all 0.15s', fontSize: '12px', fontWeight: 600,
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLButtonElement
                        el.style.borderColor = '#C9A84C'
                        el.style.background = 'rgba(201,168,76,0.08)'
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLButtonElement
                        el.style.borderColor = '#1E2D45'
                        el.style.background = '#131929'
                      }}
                    >
                      <Icon size={20} color="#C9A84C" />
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Phase: Chat ── */}
          {phase === 'chat' && (
            <>
              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '14px 12px',
                display: 'flex', flexDirection: 'column', gap: '10px',
                scrollbarWidth: 'thin', scrollbarColor: '#1A2235 transparent',
              }}>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-end', gap: '8px',
                    }}
                  >
                    {msg.role === 'assistant' && (
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', color: '#0B0F1A',
                      }}>✦</div>
                    )}
                    <div style={{
                      maxWidth: '78%', padding: '9px 13px',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                      background: msg.role === 'user' ? 'rgba(201,168,76,0.18)' : '#1A2540',
                      border: msg.role === 'user' ? '1px solid rgba(201,168,76,0.35)' : '1px solid #1E2D45',
                      color: '#F0F4FF', fontSize: '13px', lineHeight: 1.6,
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isTyping && <TypingDots />}

                {/* CTA after recommendations */}
                {hasRecommendations && !isTyping && (
                  <div style={{
                    background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: '12px', padding: '12px 14px', marginTop: '4px',
                  }}>
                    <p style={{ color: '#C9A84C', fontSize: '12px', fontWeight: 700, margin: '0 0 8px' }}>
                      ✦ Ready to connect?
                    </p>
                    <a
                      href="/advisors"
                      style={{
                        display: 'block', textAlign: 'center', padding: '8px',
                        background: '#C9A84C', color: '#0B0F1A', borderRadius: '8px',
                        fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                      }}
                    >
                      Browse Recommended Advisors →
                    </a>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '10px 12px', borderTop: '1px solid #1E2D45',
                display: 'flex', gap: '8px', alignItems: 'center',
                background: '#0B1020', flexShrink: 0,
              }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Share what's on your mind..."
                  disabled={isTyping}
                  style={{
                    flex: 1, background: '#131929', border: '1px solid #1E2D45',
                    borderRadius: '10px', padding: '9px 13px', color: '#F0F4FF',
                    fontSize: '13px', outline: 'none', fontFamily: 'inherit',
                    opacity: isTyping ? 0.6 : 1,
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px', border: 'none',
                    background: input.trim() && !isTyping ? '#C9A84C' : '#1A2540',
                    color: input.trim() && !isTyping ? '#0B0F1A' : '#4B5563',
                    cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s', flexShrink: 0,
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
