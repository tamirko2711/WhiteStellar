// ============================================================
// WhiteStellar — Live Chat Page (Real Two-Person Chat)
// src/pages/session/LiveChatPage.tsx
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Star, Phone, Video, Loader } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import {
  getLiveSession, joinLiveSession, endLiveSession,
  getLiveMessages, sendLiveMessage,
  subscribeToLiveSession, subscribeToLiveMessages,
  getUserProfile,
  type LiveSession, type LiveMessage,
} from '../../lib/api/liveSessions'

// ─── Message bubble ───────────────────────────────────────

function Bubble({
  msg, isMine, senderName,
}: {
  msg: LiveMessage
  isMine: boolean
  senderName: string
}) {
  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return (
    <div style={{
      display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row',
      alignItems: 'flex-end', gap: '8px', padding: '4px 16px',
    }}>
      <div style={{ maxWidth: '72%' }}>
        {!isMine && (
          <p style={{ color: '#4B5563', fontSize: '11px', margin: '0 0 3px', paddingLeft: '2px' }}>
            {senderName}
          </p>
        )}
        <div style={{
          background: isMine ? 'rgba(201,168,76,0.18)' : '#131929',
          border: `1px solid ${isMine ? 'rgba(201,168,76,0.35)' : '#1E2D45'}`,
          borderRadius: isMine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          padding: '10px 14px',
        }}>
          <p style={{ color: '#F0F4FF', fontSize: '14px', margin: 0, lineHeight: 1.55 }}>
            {msg.content}
          </p>
        </div>
        <p style={{
          color: '#4B5563', fontSize: '10px', margin: '3px 2px 0',
          textAlign: isMine ? 'right' : 'left',
        }}>
          {time}
        </p>
      </div>
    </div>
  )
}

// ─── System message ───────────────────────────────────────

function SystemMsg({ text }: { text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '6px 20px' }}>
      <span style={{
        color: '#4B5563', fontSize: '12px', fontStyle: 'italic',
        background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '4px 14px',
      }}>
        {text}
      </span>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────

export default function LiveChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [session, setSession] = useState<LiveSession | null>(null)
  const [messages, setMessages] = useState<LiveMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [otherName, setOtherName] = useState('')
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null)
  const [ending, setEnding] = useState(false)
  const [copied, setCopied] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sessionChannelRef = useRef<ReturnType<typeof subscribeToLiveSession> | null>(null)
  const messagesChannelRef = useRef<ReturnType<typeof subscribeToLiveMessages> | null>(null)

  const isMySession = session
    ? (session.advisor_id === user?.id || session.client_id === user?.id)
    : false
  const isAdvisor = session?.advisor_id === user?.id
  const isWaiting = session?.status === 'waiting'
  const isActive = session?.status === 'active'
  const isEnded = session?.status === 'ended'

  // ── Load session and messages ──
  useEffect(() => {
    if (!sessionId || !user) return

    async function loadSession() {
      setLoading(true)
      try {
        const s = await getLiveSession(sessionId!)
        if (!s) { setError('Session not found.'); setLoading(false); return }

        // If client and session waiting, join it
        if (!isAdvisorUser(s) && s.status === 'waiting' && !s.client_id) {
          const joined = await joinLiveSession(sessionId!, user!.id)
          setSession(joined)
          await loadOtherProfile(joined)
        } else {
          setSession(s)
          await loadOtherProfile(s)
        }

        // Load existing messages
        const msgs = await getLiveMessages(sessionId!)
        setMessages(msgs)
      } catch (e) {
        setError('Failed to load session.')
      } finally {
        setLoading(false)
      }
    }

    function isAdvisorUser(s: LiveSession) {
      return s.advisor_id === user!.id
    }

    async function loadOtherProfile(s: LiveSession) {
      const otherId = s.advisor_id === user!.id ? s.client_id : s.advisor_id
      if (!otherId) return
      const profile = await getUserProfile(otherId)
      setOtherName(profile.full_name)
      setOtherAvatar(profile.avatar_url)
    }

    loadSession()
  }, [sessionId, user])

  // ── Subscribe to Realtime ──
  useEffect(() => {
    if (!sessionId) return

    sessionChannelRef.current = subscribeToLiveSession(sessionId, (updated) => {
      setSession(updated)
      // If someone joined and we don't have their name, load it
      if (updated.client_id && !otherName && updated.advisor_id !== user?.id) {
        getUserProfile(updated.client_id).then(p => {
          setOtherName(p.full_name)
          setOtherAvatar(p.avatar_url)
        })
      }
    })

    messagesChannelRef.current = subscribeToLiveMessages(sessionId, (msg) => {
      setMessages(prev => [...prev, msg])
    })

    return () => {
      sessionChannelRef.current?.unsubscribe()
      messagesChannelRef.current?.unsubscribe()
    }
  }, [sessionId, user?.id, otherName])

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Auto-resize textarea ──
  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [])
  useEffect(() => { adjustHeight() }, [input, adjustHeight])

  async function handleSend() {
    const text = input.trim()
    if (!text || !sessionId || !user) return
    if (!isMySession) return
    setInput('')
    try {
      await sendLiveMessage(sessionId, user.id, text)
    } catch (e) {
      console.error('Send failed:', e)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleEndSession() {
    if (!sessionId) return
    setEnding(true)
    try {
      await endLiveSession(sessionId)
      navigate('/')
    } catch {
      setEnding(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Loading / error states ──
  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#080C16',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
      }}>
        <Loader size={32} color="#C9A84C" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#8B9BB4', fontSize: '14px' }}>Loading session...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#080C16',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px', padding: '24px',
      }}>
        <p style={{ color: '#EF4444', fontSize: '16px', fontWeight: 600 }}>
          {error || 'Session not found'}
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: '#131929', border: '1px solid #1E2D45',
            color: '#8B9BB4', borderRadius: '10px', padding: '10px 24px',
            fontSize: '14px', cursor: 'pointer',
          }}
        >
          Back to Home
        </button>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#080C16',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px', padding: '24px',
      }}>
        <p style={{ color: '#F0F4FF', fontSize: '16px' }}>Please log in to join this session.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
            border: 'none', color: '#0B0F1A', borderRadius: '10px',
            padding: '10px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Go to Home
        </button>
      </div>
    )
  }

  // ── Ended state ──
  if (isEnded) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#080C16',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px', padding: '24px', textAlign: 'center',
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px',
        }}>
          ✓
        </div>
        <h2 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '20px', fontFamily: "'Playfair Display', serif", margin: 0 }}>
          Session Ended
        </h2>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
          {messages.length} message{messages.length !== 1 ? 's' : ''} exchanged
        </p>
        <button
          onClick={() => navigate(isAdvisor ? '/advisor/dashboard' : '/')}
          style={{
            background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
            border: 'none', color: '#0B0F1A', borderRadius: '12px',
            padding: '12px 32px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          {isAdvisor ? 'Back to Dashboard' : 'Back to Home'}
        </button>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes ws-typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes ws-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, background: '#080C16',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          background: '#0D1221', borderBottom: '1px solid #1A2235',
          padding: '12px 20px', display: 'flex', alignItems: 'center',
          gap: '12px', flexShrink: 0,
        }}>
          {/* Logo */}
          <Star size={14} color="#C9A84C" fill="#C9A84C" />
          <span style={{ color: '#8B9BB4', fontSize: '12px', fontWeight: 600, marginRight: '4px' }}>
            WhiteStellar
          </span>

          {/* Other person's info */}
          {otherName ? (
            <>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: '#1A2540', border: '2px solid #C9A84C',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {otherAvatar
                  ? <img src={otherAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '14px' }}>{otherName[0]}</span>
                }
              </div>
              <div>
                <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px', margin: 0 }}>{otherName}</p>
                <p style={{
                  fontSize: '11px', margin: 0,
                  color: isActive ? '#22C55E' : '#F59E0B',
                }}>
                  {isActive ? '● Connected' : '● Waiting to connect...'}
                </p>
              </div>
            </>
          ) : (
            <div>
              <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px', margin: 0 }}>
                {isAdvisor ? 'Waiting for client...' : 'Connecting...'}
              </p>
              <p style={{ color: '#F59E0B', fontSize: '11px', margin: 0 }}>● Waiting</p>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* Session type icons */}
          <div style={{ display: 'flex', gap: '6px', opacity: 0.4 }}>
            <Phone size={14} color="#8B9BB4" />
            <Video size={14} color="#8B9BB4" />
          </div>

          {/* End session */}
          <button
            onClick={handleEndSession}
            disabled={ending}
            style={{
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
              color: '#EF4444', borderRadius: '8px', padding: '6px 14px',
              fontSize: '12px', fontWeight: 700, cursor: ending ? 'default' : 'pointer',
              opacity: ending ? 0.6 : 1,
            }}
          >
            {ending ? 'Ending...' : 'End Session'}
          </button>
        </div>

        {/* ── Waiting banner (advisor side) ── */}
        {isAdvisor && isWaiting && (
          <div style={{
            background: 'rgba(201,168,76,0.08)', borderBottom: '1px solid rgba(201,168,76,0.2)',
            padding: '12px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0, animation: 'ws-fade-in 0.3s ease both',
          }}>
            <div>
              <p style={{ color: '#C9A84C', fontSize: '13px', fontWeight: 700, margin: '0 0 2px' }}>
                Waiting for a client to join
              </p>
              <p style={{ color: '#8B9BB4', fontSize: '12px', margin: 0 }}>
                Share this link so your client can connect:
              </p>
            </div>
            <button
              onClick={copyLink}
              style={{
                background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(201,168,76,0.12)',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(201,168,76,0.35)'}`,
                color: copied ? '#22C55E' : '#C9A84C',
                borderRadius: '8px', padding: '7px 14px',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                flexShrink: 0, transition: 'all 0.2s',
              }}
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
        )}

        {/* ── Messages area ── */}
        <div style={{
          flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
          padding: '16px 0', gap: '4px',
          scrollbarWidth: 'thin', scrollbarColor: '#1A2235 transparent',
        }}>
          <SystemMsg text={`Live session started · ${isAdvisor ? 'Share the link with your client' : 'You joined this session'}`} />

          {messages.map(msg => (
            <Bubble
              key={msg.id}
              msg={msg}
              isMine={msg.sender_id === user?.id}
              senderName={msg.sender_id === session.advisor_id ? (isAdvisor ? 'You' : otherName) : (isAdvisor ? otherName || 'Client' : 'You')}
            />
          ))}

          {messages.length === 0 && isActive && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
              <p style={{ color: '#4B5563', fontSize: '13px', fontStyle: 'italic' }}>
                Say hello to start the conversation
              </p>
            </div>
          )}

          {messages.length === 0 && isWaiting && !isAdvisor && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: '#C9A84C', display: 'inline-block',
                      animation: `ws-typing 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
                <p style={{ color: '#4B5563', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>
                  Connected — waiting for your advisor to start the conversation
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input bar ── */}
        <div style={{
          background: '#0D1221', borderTop: '1px solid #1A2235',
          padding: '12px 16px', display: 'flex', alignItems: 'flex-end', gap: '10px',
          flexShrink: 0,
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isActive ? 'Type your message...' : 'Waiting for connection...'}
            disabled={!isActive && !(isAdvisor && isWaiting)}
            rows={1}
            style={{
              flex: 1, background: '#131929', border: '1px solid #1A2235',
              borderRadius: '12px', padding: '10px 14px',
              color: '#F0F4FF', fontSize: '14px', resize: 'none',
              outline: 'none', lineHeight: '1.5', fontFamily: 'inherit',
              maxHeight: '120px', overflowY: 'auto',
              scrollbarWidth: 'none',
              opacity: (!isActive && !(isAdvisor && isWaiting)) ? 0.4 : 1,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || (!isActive && !(isAdvisor && isWaiting))}
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
      </div>
    </>
  )
}
