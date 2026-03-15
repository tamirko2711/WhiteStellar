// ============================================================
// WhiteStellar — Chat Session Screen
// src/pages/session/ChatSessionPage.tsx
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Smile, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSessionStore } from '../../store/sessionStore'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import SessionWrapper from '../../components/session/SessionWrapper'
import SessionHeader from '../../components/session/SessionHeader'
import BillingWarning from '../../components/session/BillingWarning'
import AdvisorClientPanel from '../../components/session/AdvisorClientPanel'
// AI prescreen disabled for live testing phase
// import { PrescreenChat } from '../../components/session/PrescreenChat'
// import { checkShouldPrescreen, createPrescreenSession } from '../../lib/api/prescreen'

// ─── Avatar with initials fallback ────────────────────────────

function AvatarCircle({ src, name, size, border }: { src?: string | null; name: string; size: number; border?: string }) {
  const isValid = typeof src === 'string' && src.trim().length > 0
  const initial = (name || '?').trim()[0].toUpperCase()
  const sharedStyle: React.CSSProperties = {
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    border: border ?? undefined,
  }
  if (isValid) {
    return <img src={src!} alt={name} style={{ ...sharedStyle, objectFit: 'cover' }} />
  }
  return (
    <div style={{
      ...sharedStyle,
      border: border ?? '2px solid #C9A84C',
      background: '#1A2C45',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: Math.round(size * 0.42) }}>
        {initial}
      </span>
    </div>
  )
}

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
        <AvatarCircle src={msg.senderAvatar} name={msg.senderName} size={28} />
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

// ─── Main ─────────────────────────────────────────────────────

export default function ChatSessionPage() {
  const {
    clientId, advisorId, advisorName, advisorAvatar,
    clientName, clientAvatar, elapsedSeconds, totalCost,
    messages, addMessage, endSession, setEnded, supabaseSessionId,
  } = useSessionStore()

  const { user, userType } = useAuthStore()

  const [input, setInput] = useState('')
  const [panelOpen, setPanelOpen] = useState(true)
  const [otherIsTyping, setOtherIsTyping] = useState(false)
  const [showAdvisorEndModal, setShowAdvisorEndModal] = useState(false)
  const [endReason, setEndReason] = useState('')
  const [sessionEndedByOther, setSessionEndedByOther] = useState(false)

  // Determine who is on this side of the chat.
  // Prefer ID-based check (clientId vs user.id) over userType, since userType
  // can be null on first load or wrong in dev-mode single-user testing.
  const isAdvisorSide = (
    clientId !== null && user?.id !== undefined && user.id !== clientId
  ) || userType === 'advisor'
  const mySenderId  = user?.id ?? (clientId ?? 'anon')
  const mySenderName   = isAdvisorSide ? advisorName : clientName
  const mySenderAvatar = isAdvisorSide ? advisorAvatar : clientAvatar

  // AI prescreen disabled for live testing phase
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null)
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const otherEndedRef = useRef(false)

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  // ── Supabase real-time message sync ─────────────────────────
  // Broadcast: fast delivery to the other side (no RLS/publication required)
  // postgres_changes on session_messages: reliable fallback in case Broadcast
  // is missed due to subscription timing on mount.
  useEffect(() => {
    if (!supabaseSessionId) return

    // Load history from DB on mount
    supabase
      .from('session_messages')
      .select('*')
      .eq('session_id', supabaseSessionId)
      .order('created_at', { ascending: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any[] | null }) => {
        if (!data || data.length === 0) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbMsgs = data.map((r: any) => ({
          id: `db-${r.id}`,
          senderId: r.sender_id,
          senderName: r.sender_name,
          senderAvatar: r.sender_avatar ?? '',
          text: r.text,
          timestamp: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: r.is_system ?? false,
        }))
        const localSys = useSessionStore.getState().messages.filter(m => m.isSystem)
        useSessionStore.setState({ messages: [...localSys, ...dbMsgs] })
      })

    const ch = supabase
      .channel(`session-chat-${supabaseSessionId}`)
      // Broadcast: typing indicator only (ephemeral, no DB)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: any }) => {
        if (payload.senderId === user?.id) return
        setOtherIsTyping(payload.isTyping)
        if (payload.isTyping) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setOtherIsTyping(false), 3000)
        } else {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        }
      })
      // postgres_changes: delivers incoming messages; own inserts skipped (already in local state)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'session_messages',
        filter: `session_id=eq.${supabaseSessionId}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, ({ new: row }: { new: any }) => {
        if (row.sender_id === user?.id) return  // already in local state
        const current = useSessionStore.getState().messages
        const msgId = `db-${row.id}`
        if (!current.some(m => m.id === msgId)) {
          useSessionStore.getState().addMessage({
            id: msgId,
            senderId: row.sender_id,
            senderName: row.sender_name,
            senderAvatar: row.sender_avatar ?? '',
            text: row.text,
            timestamp: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: row.is_system ?? false,
          })
        }
      })
      .subscribe()

    channelRef.current = ch
    return () => {
      supabase.removeChannel(ch)
      channelRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseSessionId])  // user intentionally excluded — captured once on mount, stable during session

  // ── DB polling: messages + typing state ──────────────────────
  // Runs every 2s. Delivers messages missed by postgres_changes (Realtime auth
  // timing on fresh sessions) AND checks the other side's typing timestamp.
  useEffect(() => {
    if (!supabaseSessionId) return
    // Column names depend on which side we're on — captured once, stable during session
    const otherTypingCol = isAdvisorSide ? 'client_typing_at' : 'advisor_typing_at'

    const poll = () => {
      // ── Fetch missed messages ──
      supabase
        .from('session_messages')
        .select('*')
        .eq('session_id', supabaseSessionId)
        .order('created_at', { ascending: true })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then(({ data }: { data: any[] | null }) => {
          if (!data) return
          const current = useSessionStore.getState().messages
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.forEach((r: any) => {
            if (r.sender_id === user?.id) return  // own messages already in local state
            const msgId = `db-${r.id}`
            if (!current.some(m => m.id === msgId)) {
              useSessionStore.getState().addMessage({
                id: msgId,
                senderId: r.sender_id,
                senderName: r.sender_name,
                senderAvatar: r.sender_avatar ?? '',
                text: r.text,
                timestamp: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isSystem: r.is_system ?? false,
              })
            }
          })
        })

      // ── Check other person's typing state + session status ──
      supabase
        .from('sessions')
        .select(`status, ${otherTypingCol}`)
        .eq('id', supabaseSessionId)
        .single()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then(({ data }: { data: any }) => {
          if (!data) return
          const typingAt: string | null = data[otherTypingCol]
          const isActive = Boolean(typingAt && Date.now() - new Date(typingAt).getTime() < 5000)
          setOtherIsTyping(isActive)
          // Detect when the other side ended the session
          if (data.status === 'completed' && !otherEndedRef.current) {
            const localStatus = useSessionStore.getState().status
            if (localStatus === 'active') {
              otherEndedRef.current = true
              setSessionEndedByOther(true)
            }
          }
        })
    }
    const id = setInterval(poll, 2000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseSessionId])  // isAdvisorSide / user intentionally excluded — stable during session

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Adjust textarea height
  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [])

  useEffect(() => { adjustHeight() }, [input, adjustHeight])

  // Cleanup typing timers on unmount
  useEffect(() => () => {
    if (typingStopRef.current) clearTimeout(typingStopRef.current)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
  }, [])

  // Auto-navigate both sides after the other side ends the session (8s grace period)
  useEffect(() => {
    if (!sessionEndedByOther) return
    const timer = setTimeout(() => setEnded(), 8000)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionEndedByOther])

  // Advisor gets a confirmation modal; client ends directly
  function handleEndClick() {
    if (isAdvisorSide) {
      setShowAdvisorEndModal(true)
    } else {
      void endSession()
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    if (!supabaseSessionId) return
    const myTypingCol = isAdvisorSide ? 'advisor_typing_at' : 'client_typing_at'
    // Broadcast: instant delivery when Realtime subscription is confirmed
    if (channelRef.current && user?.id) {
      channelRef.current.send({ type: 'broadcast', event: 'typing', payload: { senderId: user.id, isTyping: true } })
    }
    // DB fallback: write typing timestamp so the polling picks it up
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.from('sessions').update({ [myTypingCol]: new Date().toISOString() } as any).eq('id', supabaseSessionId).then()
    if (typingStopRef.current) clearTimeout(typingStopRef.current)
    typingStopRef.current = setTimeout(() => {
      if (channelRef.current && user?.id) {
        channelRef.current.send({ type: 'broadcast', event: 'typing', payload: { senderId: user?.id, isTyping: false } })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase.from('sessions').update({ [myTypingCol]: null } as any).eq('id', supabaseSessionId).then()
    }, 2000)
  }

  function handleSend() {
    const text = input.trim()
    if (!text) return
    setInput('')
    // Clear typing indicator on the other side
    if (typingStopRef.current) clearTimeout(typingStopRef.current)
    if (supabaseSessionId && channelRef.current && user?.id) {
      channelRef.current.send({ type: 'broadcast', event: 'typing', payload: { senderId: user.id, isTyping: false } })
    }
    if (supabaseSessionId) {
      const myTypingCol = isAdvisorSide ? 'advisor_typing_at' : 'client_typing_at'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase.from('sessions').update({ [myTypingCol]: null } as any).eq('id', supabaseSessionId).then()
    }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const msgPayload = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: user?.id ?? mySenderId,
      senderName: mySenderName,
      senderAvatar: mySenderAvatar,
      text,
      timestamp: now,
    }

    // Always add to local state immediately so the sender sees their own message
    addMessage(msgPayload)

    // Persist to DB — this triggers postgres_changes on the other participant's client
    if (supabaseSessionId && user?.id) {
      supabase.from('session_messages').insert({
        session_id: supabaseSessionId,
        sender_id: user.id,
        sender_name: mySenderName,
        sender_avatar: mySenderAvatar,
        text,
        is_system: false,
      }).then()
    }
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
      onClick={handleEndClick}
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
            {messages.map(msg => {
              const isOwnMsg = !!user && msg.senderId === user.id
              // Resolve avatar from live store values rather than the stale
              // msg.senderAvatar (which may have been empty when the message was sent).
              const resolvedAvatar = isOwnMsg
                ? mySenderAvatar
                : (isAdvisorSide ? clientAvatar : advisorAvatar)
              const resolvedName = isOwnMsg
                ? mySenderName
                : (isAdvisorSide ? clientName : advisorName)
              return (
                <MessageBubble
                  key={msg.id}
                  msg={{ ...msg, senderAvatar: resolvedAvatar, senderName: resolvedName }}
                  isClient={isOwnMsg}
                />
              )
            })}
            {/* Typing indicator */}
            {otherIsTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '4px 16px' }}>
                <AvatarCircle
                  src={isAdvisorSide ? clientAvatar : advisorAvatar}
                  name={isAdvisorSide ? clientName : advisorName}
                  size={28}
                />
                <div style={{
                  background: '#131929', border: '1px solid #1E2D45',
                  borderRadius: '4px 16px 16px 16px', padding: '10px 14px',
                  display: 'flex', gap: '4px', alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#8B9BB4', display: 'inline-block',
                      animation: `ws-typing 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Desktop right panel ── */}
          <div
            className="hidden lg:flex"
            style={{
              width: panelOpen ? (isAdvisorSide ? '300px' : '260px') : '40px',
              flexShrink: 0,
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

            {panelOpen && isAdvisorSide && clientId && advisorId && (
              <AdvisorClientPanel
                clientId={clientId}
                clientName={clientName}
                clientAvatar={clientAvatar}
                advisorId={advisorId}
                onEndSession={handleEndClick}
              />
            )}

            {panelOpen && !isAdvisorSide && (
              <div style={{ padding: '48px 16px 16px', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
                {/* Other participant card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AvatarCircle
                    src={advisorAvatar}
                    name={advisorName}
                    size={44}
                    border="2px solid #C9A84C"
                  />
                  <div>
                    <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px', margin: '0 0 2px' }}>
                      {advisorName}
                    </p>
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
                  onClick={handleEndClick}
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
            onChange={handleInputChange}
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
            onClick={handleEndClick}
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

      {/* ── Advisor: End Session confirmation modal ── */}
      {showAdvisorEndModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            background: '#0D1221', border: '1px solid #1A2235',
            borderRadius: '20px', padding: '28px', maxWidth: '400px', width: '100%',
          }}>
            <h2 style={{
              color: '#F0F4FF', fontWeight: 700, fontSize: '18px',
              fontFamily: "'Playfair Display', serif", margin: '0 0 10px',
            }}>
              End Session?
            </h2>
            <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 20px', lineHeight: 1.6 }}>
              Are you sure you want to close the live session with{' '}
              <strong style={{ color: '#F0F4FF' }}>{clientName}</strong>?
            </p>
            <select
              value={endReason}
              onChange={e => setEndReason(e.target.value)}
              style={{
                width: '100%', background: '#131929', border: '1px solid #1A2235',
                borderRadius: '10px', padding: '10px 14px',
                color: endReason ? '#F0F4FF' : '#4B5563',
                fontSize: '14px', marginBottom: '20px', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">Select reason (optional)</option>
              <option value="completed">Session completed successfully</option>
              <option value="client_request">Client requested to end</option>
              <option value="technical">Technical issues</option>
              <option value="other">Other</option>
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { void endSession(); setShowAdvisorEndModal(false) }}
                style={{
                  flex: 1, padding: '13px',
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
                  borderRadius: '12px', color: '#EF4444',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                }}
              >
                Yes, End Session
              </button>
              <button
                onClick={() => setShowAdvisorEndModal(false)}
                style={{
                  flex: 1, padding: '13px',
                  background: '#131929', border: '1px solid #1A2235',
                  borderRadius: '12px', color: '#F0F4FF',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                }}
              >
                No, Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Session ended by the other participant ── */}
      {sessionEndedByOther && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            background: '#0D1221', border: '1px solid #1A2235',
            borderRadius: '20px', padding: '32px 28px', maxWidth: '380px', width: '100%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {isAdvisorSide ? '👋' : '💫'}
            </div>
            <h2 style={{
              color: '#F0F4FF', fontWeight: 700, fontSize: '18px',
              fontFamily: "'Playfair Display', serif", margin: '0 0 10px',
            }}>
              Session Ended
            </h2>
            <p style={{ color: '#8B9BB4', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
              {isAdvisorSide
                ? <><strong style={{ color: '#F0F4FF' }}>{clientName}</strong> has ended the session. Thank you for your guidance!</>
                : <><strong style={{ color: '#F0F4FF' }}>{advisorName}</strong> has ended the session. We hope it was helpful!</>
              }
            </p>
            <button
              onClick={() => setEnded()}
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
                border: 'none', borderRadius: '12px',
                color: '#0B0F1A', fontWeight: 700, fontSize: '15px', cursor: 'pointer',
              }}
            >
              {isAdvisorSide ? 'View Session Summary' : 'View Session Summary'}
            </button>
            <p style={{ color: '#4B5563', fontSize: '12px', margin: '12px 0 0' }}>
              Auto-redirecting in a few seconds…
            </p>
          </div>
        </div>
      )}
    </>
  )
}
