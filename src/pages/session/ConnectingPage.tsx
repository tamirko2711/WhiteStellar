// ============================================================
// WhiteStellar — Connecting Screen
// src/pages/session/ConnectingPage.tsx
// ============================================================

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'
import type { ChatMessage } from '../../store/sessionStore'

export default function ConnectingPage() {
  const navigate = useNavigate()
  const { status, sessionType, advisorId, advisorName, advisorAvatar, setActive, addMessage, resetSession } =
    useSessionStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // If no session in progress, go home
  useEffect(() => {
    if (status === 'idle') {
      navigate('/', { replace: true })
    }
  }, [status, navigate])

  useEffect(() => {
    if (status !== 'connecting') return

    timerRef.current = setTimeout(() => {
      // Populate initial messages
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

      // Activate session and navigate
      setActive()
      const dest =
        sessionType === 'audio' ? '/session/audio'
        : sessionType === 'video' ? '/session/video'
        : '/session/chat'
      navigate(dest, { replace: true })
    }, 3000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [status, sessionType, advisorId, advisorName, advisorAvatar, setActive, addMessage, navigate])

  function handleCancel() {
    if (timerRef.current) clearTimeout(timerRef.current)
    resetSession()
    navigate(-1)
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
            This usually takes less than 30 seconds
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
