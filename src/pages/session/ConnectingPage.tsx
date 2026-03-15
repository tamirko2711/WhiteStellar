// ============================================================
// WhiteStellar — Connecting Screen
// src/pages/session/ConnectingPage.tsx
// ============================================================

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'
import { useAuthStore } from '../../store/authStore'
import { updateSessionStatus } from '../../lib/api/sessions'
import { supabase } from '../../lib/supabase'
import type { ChatMessage } from '../../store/sessionStore'

export default function ConnectingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    status, sessionType, advisorId, advisorName, advisorAvatar,
    supabaseSessionId, setActive, addMessage, resetSession,
  } = useSessionStore()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [cancelled, setCancelled] = useState(false)
  // Trigger state to avoid stale closures in async callbacks
  const [activateTrigger, setActivateTrigger] = useState(false)

  const isRealUser = !!(user && !user.id.startsWith('dev-'))

  // If no session in progress, go home
  useEffect(() => {
    if (status === 'idle') navigate('/', { replace: true })
  }, [status, navigate])

  // Populate initial messages and navigate to session page
  useEffect(() => {
    if (!activateTrigger) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const initMessages: ChatMessage[] = [
      {
        id: 'sys-0',
        senderId: 0,
        senderName: 'System',
        senderAvatar: '',
        text: 'Session started · Your first 3 minutes are free',
        timestamp: now,
        isSystem: true,
      },
      {
        id: 'adv-1',
        senderId: advisorId ?? 0,
        senderName: advisorName,
        senderAvatar: advisorAvatar,
        text: 'Hello! Welcome to our session. How can I help you today?',
        timestamp: now,
      },
      {
        id: 'adv-2',
        senderId: advisorId ?? 0,
        senderName: advisorName,
        senderAvatar: advisorAvatar,
        text: "Take your time, I'm here to listen and guide you.",
        timestamp: now,
      },
    ]
    initMessages.forEach(addMessage)
    setActive()
    const dest =
      sessionType === 'audio' ? '/session/audio'
      : sessionType === 'video' ? '/session/video'
      : '/session/chat'
    navigate(dest, { replace: true })
  }, [activateTrigger])

  // Dev mode: auto-connect after 3 seconds
  useEffect(() => {
    if (status !== 'connecting' || isRealUser) return
    timerRef.current = setTimeout(() => setActivateTrigger(true), 3000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [status, isRealUser])

  // Real user: subscribe to Supabase Realtime for session status changes
  useEffect(() => {
    if (!isRealUser || !supabaseSessionId || status !== 'connecting') return

    // 90-second timeout → auto-cancel
    const timeoutId = setTimeout(async () => {
      try { await updateSessionStatus(supabaseSessionId, 'cancelled') } catch {}
      setCancelled(true)
    }, 90_000)

    const channel = supabase
      .channel(`session-status-${supabaseSessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${supabaseSessionId}`,
      }, (payload) => {
        const newStatus = (payload.new as Record<string, unknown>).status
        if (newStatus === 'in_progress') {
          clearTimeout(timeoutId)
          setActivateTrigger(true)
        } else if (newStatus === 'cancelled') {
          clearTimeout(timeoutId)
          setCancelled(true)
        }
      })
      .subscribe()

    return () => {
      clearTimeout(timeoutId)
      supabase.removeChannel(channel)
    }
  }, [isRealUser, supabaseSessionId, status])

  function handleCancel() {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (isRealUser && supabaseSessionId) {
      updateSessionStatus(supabaseSessionId, 'cancelled').catch(() => {})
    }
    resetSession()
    navigate(-1)
  }

  // Cancelled / advisor unavailable state
  if (cancelled) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#080C16',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '16px', padding: '32px', zIndex: 200,
      }}>
        <div style={{ fontSize: '48px' }}>😔</div>
        <h2 style={{
          color: '#F0F4FF', fontWeight: 700, fontSize: '20px',
          fontFamily: "'Playfair Display', serif", textAlign: 'center', margin: 0,
        }}>
          Advisor unavailable
        </h2>
        <p style={{ color: '#8B9BB4', fontSize: '14px', textAlign: 'center', margin: 0 }}>
          The advisor did not respond. Please try again or choose another advisor.
        </p>
        <button
          onClick={() => { resetSession(); navigate('/') }}
          style={{
            background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
            border: 'none', color: '#0B0F1A', borderRadius: '12px',
            padding: '14px 32px', fontSize: '15px', fontWeight: 700,
            cursor: 'pointer', marginTop: '8px',
          }}
        >
          Back to Advisors
        </button>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes ws-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(201,168,76,0.5); }
          70%  { box-shadow: 0 0 0 28px rgba(201,168,76,0); }
          100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
        }
        @keyframes ws-progress {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes ws-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, background: '#080C16',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '24px', padding: '32px', zIndex: 200,
      }}>

        {/* Avatar with pulsing ring */}
        <div style={{
          width: '112px', height: '112px', borderRadius: '50%',
          animation: 'ws-pulse 2s infinite',
          flexShrink: 0,
        }}>
          <img
            src={advisorAvatar}
            alt={advisorName}
            style={{
              width: '100%', height: '100%', borderRadius: '50%',
              objectFit: 'cover', border: '3px solid #C9A84C',
              display: 'block',
            }}
          />
        </div>

        {/* Text */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            color: '#F0F4FF', fontWeight: 700, fontSize: '20px',
            fontFamily: "'Playfair Display', serif",
            margin: '0 0 8px',
          }}>
            Connecting to {advisorName}...
          </h2>
          <p style={{ color: '#4B5563', fontSize: '14px', margin: '0 0 16px' }}>
            {isRealUser
              ? 'Waiting for the advisor to accept your request…'
              : 'This usually takes less than 30 seconds'}
          </p>

          {/* Animated dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '32px' }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#C9A84C', display: 'inline-block',
                animation: `ws-dot-bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '280px', height: '3px', borderRadius: '2px',
          background: '#1A2235', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: '60%',
            background: 'linear-gradient(90deg, #C9A84C, #E8C96D)',
            borderRadius: '2px',
            animation: 'ws-progress 1.8s ease-in-out infinite',
          }} />
        </div>

        {/* Cancel */}
        <button
          onClick={handleCancel}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#4B5563', fontSize: '13px',
            textDecoration: 'underline', textUnderlineOffset: '2px',
          }}
        >
          Cancel
        </button>
      </div>
    </>
  )
}
