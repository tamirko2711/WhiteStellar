// ============================================================
// WhiteStellar — Chat Session Screen
// src/pages/session/ChatSessionPage.tsx
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Smile, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSessionStore } from '../../store/sessionStore'
import SessionWrapper from '../../components/session/SessionWrapper'
import SessionHeader from '../../components/session/SessionHeader'
import BillingWarning from '../../components/session/BillingWarning'

// ─── Advisor reply pool ───────────────────────────────────────

const ADVISOR_REPLIES = [
  "I'm picking up some very strong energy around this situation...",
  "The cards are showing me something interesting here. Can you tell me more?",
  "I sense there's been a significant shift recently. Am I right?",
  "Let me tune in deeper for a moment...",
  "The energy around this is very clear to me. Here's what I'm seeing:",
  "Trust the process. What you're feeling is valid and important.",
  "I'm getting a strong impression about the other person involved.",
  "The stars are aligned in a way that speaks directly to your question.",
  "Your aura shows a mix of uncertainty and hope — that's a powerful combination.",
]

// ─── Message bubble ───────────────────────────────────────────

function MessageBubble({ msg, isClient }: { msg: ReturnType<typeof useSessionStore.getState>['messages'][number]; isClient: boolean }) {
  if (msg.isSystem) {
    return (
      <div style={{ textAlign: 'center', padding: '6px 20px' }}>
        <span style={{
          color: '#4B5563', fontSize: '12px', fontStyle: 'italic',
          background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '4px 14px',
        }}>
          {msg.text}
        </span>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: '8px',
      flexDirection: isClient ? 'row-reverse' : 'row',
      padding: '4px 16px',
    }}>
      {!isClient && (
        <img src={msg.senderAvatar} alt="" style={{
          width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
        }} />
      )}
      <div style={{ maxWidth: '72%' }}>
        {!isClient && (
          <p style={{ color: '#4B5563', fontSize: '11px', margin: '0 0 3px', paddingLeft: '2px' }}>
            {msg.senderName}
          </p>
        )}
        <div style={{
          background: isClient ? 'rgba(201,168,76,0.18)' : '#131929',
          border: `1px solid ${isClient ? 'rgba(201,168,76,0.35)' : '#1E2D45'}`,
          borderRadius: isClient ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          padding: '10px 14px',
        }}>
          <p style={{ color: '#F0F4FF', fontSize: '14px', margin: 0, lineHeight: 1.55 }}>
            {msg.text}
          </p>
        </div>
        <p style={{
          color: '#4B5563', fontSize: '10px', margin: '3px 2px 0',
          textAlign: isClient ? 'right' : 'left',
        }}>
          {msg.timestamp}
        </p>
      </div>
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────

function TypingIndicator({ avatar }: { avatar: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 16px' }}>
      <img src={avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
      <div style={{
        background: '#131929', border: '1px solid #1E2D45',
        borderRadius: '4px 16px 16px 16px', padding: '10px 14px',
        display: 'flex', gap: '4px', alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%', background: '#4B5563',
            display: 'inline-block',
            animation: `ws-typing 1.4s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function ChatSessionPage() {
  const {
    clientId, advisorId, advisorName, advisorAvatar,
    clientName, clientAvatar, elapsedSeconds, totalCost,
    messages, addMessage, endSession,
  } = useSessionStore()

  const [input, setInput] = useState('')
  const [advisorTyping, setAdvisorTyping] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, advisorTyping])

  // Adjust textarea height
  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [])

  useEffect(() => { adjustHeight() }, [input, adjustHeight])

  // Cleanup timers
  useEffect(() => () => {
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current)
  }, [])

  function handleSend() {
    const text = input.trim()
    if (!text || !clientId) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    addMessage({
      id: `msg-${Date.now()}`,
      senderId: clientId,
      senderName: clientName,
      senderAvatar: clientAvatar,
      text,
      timestamp: now,
    })
    setInput('')

    // Simulate advisor reply
    const delay = 2000 + Math.random() * 2000
    setAdvisorTyping(true)
    replyTimerRef.current = setTimeout(() => {
      setAdvisorTyping(false)
      const reply = ADVISOR_REPLIES[Math.floor(Math.random() * ADVISOR_REPLIES.length)]
      addMessage({
        id: `reply-${Date.now()}`,
        senderId: advisorId ?? 0,
        senderName: advisorName,
        senderAvatar: advisorAvatar,
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    }, delay)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Mobile end button for header
  const mobileEndBtn = (
    <button
      className="lg:hidden"
      onClick={endSession}
      style={{
        background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)',
        color: '#EF4444', borderRadius: '8px', padding: '5px 12px',
        fontSize: '12px', fontWeight: 700, cursor: 'pointer',
      }}
    >
      End
    </button>
  )

  return (
    <>
      <style>{`
        @keyframes ws-typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      <SessionWrapper>
        <SessionHeader rightAction={mobileEndBtn} />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

          {/* ── Messages area ── */}
          <div style={{
            flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
            padding: '12px 0', gap: '4px',
            scrollbarWidth: 'thin', scrollbarColor: '#1A2235 transparent',
          }}>
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isClient={msg.senderId === clientId}
              />
            ))}
            {advisorTyping && <TypingIndicator avatar={advisorAvatar} />}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Desktop right panel ── */}
          <div
            className="hidden lg:flex"
            style={{
              width: panelOpen ? '260px' : '40px', flexShrink: 0,
              background: '#0D1221', borderLeft: '1px solid #1A2235',
              flexDirection: 'column', transition: 'width 0.2s',
              overflow: 'hidden', position: 'relative',
            }}
          >
            {/* Toggle */}
            <button
              onClick={() => setPanelOpen(o => !o)}
              style={{
                position: 'absolute', top: '12px', left: '8px', zIndex: 10,
                background: '#1A2235', border: 'none', borderRadius: '6px',
                color: '#8B9BB4', cursor: 'pointer', padding: '4px',
                display: 'flex', alignItems: 'center',
              }}
            >
              {panelOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {panelOpen && (
              <div style={{ padding: '48px 16px 16px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
                {/* Advisor card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={advisorAvatar} alt={advisorName} style={{
                    width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #C9A84C',
                  }} />
                  <div>
                    <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px', margin: '0 0 2px' }}>{advisorName}</p>
                    <p style={{ color: '#22C55E', fontSize: '11px', margin: 0 }}>● Online</p>
                  </div>
                </div>

                {/* Timer */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#4B5563', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Elapsed</p>
                  <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '28px', fontFamily: 'monospace', margin: 0 }}>
                    {formatTime(elapsedSeconds)}
                  </p>
                </div>

                {/* Cost */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#4B5563', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Total Cost</p>
                  <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '24px', margin: 0 }}>
                    ${totalCost.toFixed(2)}
                  </p>
                </div>

                <div style={{ flex: 1 }} />

                {/* End session */}
                <button
                  onClick={endSession}
                  style={{
                    width: '100%', padding: '12px',
                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
                    color: '#EF4444', borderRadius: '10px',
                    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                  }}
                >
                  End Session
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Input bar ── */}
        <div style={{
          background: '#0D1221', borderTop: '1px solid #1A2235',
          padding: '12px 16px', display: 'flex', alignItems: 'flex-end', gap: '10px',
          flexShrink: 0,
        }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', padding: '4px', flexShrink: 0 }}>
            <Smile size={20} />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            style={{
              flex: 1, background: '#131929', border: '1px solid #1A2235',
              borderRadius: '12px', padding: '10px 14px',
              color: '#F0F4FF', fontSize: '14px', resize: 'none',
              outline: 'none', lineHeight: '1.5', fontFamily: 'inherit',
              maxHeight: '120px', overflowY: 'auto',
              scrollbarWidth: 'none',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              background: input.trim() ? 'linear-gradient(135deg,#C9A84C,#E8C96D)' : '#1A2235',
              border: 'none', borderRadius: '10px', padding: '10px',
              cursor: input.trim() ? 'pointer' : 'default',
              color: input.trim() ? '#0B0F1A' : '#4B5563',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.15s',
            }}
          >
            <Send size={18} />
          </button>
        </div>

        {/* Mobile End Session */}
        <div className="lg:hidden" style={{
          padding: '8px 16px 16px', background: '#0D1221',
          borderTop: '1px solid #1A2235', flexShrink: 0,
        }}>
          <button
            onClick={endSession}
            style={{
              width: '100%', padding: '12px',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
              color: '#EF4444', borderRadius: '10px',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            }}
          >
            End Session
          </button>
        </div>

        {/* Billing warnings overlay */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
          <div style={{ pointerEvents: 'auto' }}>
            <BillingWarning />
          </div>
        </div>
      </SessionWrapper>
    </>
  )
}
