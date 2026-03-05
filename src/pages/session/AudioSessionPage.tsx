// ============================================================
// WhiteStellar — Audio Session Screen
// src/pages/session/AudioSessionPage.tsx
// ============================================================

import { useState, useRef, useEffect } from 'react'
import {
  Mic, MicOff, Volume2, PhoneOff, MessageCircle, MoreHorizontal, X, Send,
} from 'lucide-react'
import { useSessionStore } from '../../store/sessionStore'
import SessionWrapper from '../../components/session/SessionWrapper'
import SessionHeader from '../../components/session/SessionHeader'
import BillingWarning from '../../components/session/BillingWarning'

// ─── Control button ───────────────────────────────────────────

function CtrlBtn({
  icon: Icon, onClick, active = false, danger = false, large = false, label,
}: {
  icon: React.ElementType; onClick?: () => void; active?: boolean
  danger?: boolean; large?: boolean; label?: string
}) {
  const size = large ? 48 : 40
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <button
        onClick={onClick}
        style={{
          width: `${size}px`, height: `${size}px`, borderRadius: '50%',
          background: danger ? '#EF4444' : active ? 'rgba(239,68,68,0.15)' : '#131929',
          border: `1px solid ${danger ? '#EF4444' : active ? 'rgba(239,68,68,0.4)' : '#1E2D45'}`,
          color: danger ? '#fff' : active ? '#EF4444' : '#F0F4FF',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s', flexShrink: 0,
        }}
      >
        <Icon size={large ? 22 : 20} />
      </button>
      {label && <span style={{ color: '#4B5563', fontSize: '11px' }}>{label}</span>}
    </div>
  )
}

// ─── Mini chat drawer ─────────────────────────────────────────

function MiniChatDrawer({ onClose }: { onClose: () => void }) {
  const { clientId, advisorId, advisorName, advisorAvatar, clientName, clientAvatar, messages, addMessage } =
    useSessionStore()
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = input.trim()
    if (!text || !clientId) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    addMessage({
      id: `chat-${Date.now()}`,
      senderId: clientId,
      senderName: clientName,
      senderAvatar: clientAvatar,
      text, timestamp: now,
    })
    setInput('')
    setTimeout(() => {
      addMessage({
        id: `reply-${Date.now()}`,
        senderId: advisorId ?? 0,
        senderName: advisorName,
        senderAvatar: advisorAvatar,
        text: '✨ Noted. I sense the energy shifting...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    }, 2500)
  }

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
      background: '#0D1221', borderTop: '1px solid #1A2235',
      borderRadius: '20px 20px 0 0', zIndex: 60, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px', borderBottom: '1px solid #1A2235',
      }}>
        <span style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px' }}>Chat</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4' }}>
          <X size={18} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.filter(m => !m.isSystem).map(m => (
          <div key={m.id} style={{
            alignSelf: m.senderId === clientId ? 'flex-end' : 'flex-start',
            background: m.senderId === clientId ? 'rgba(201,168,76,0.15)' : '#131929',
            border: `1px solid ${m.senderId === clientId ? 'rgba(201,168,76,0.3)' : '#1E2D45'}`,
            borderRadius: '12px', padding: '8px 12px', maxWidth: '75%',
          }}>
            <p style={{ color: '#F0F4FF', fontSize: '13px', margin: 0 }}>{m.text}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{
        padding: '10px 14px', borderTop: '1px solid #1A2235',
        display: 'flex', gap: '8px', alignItems: 'center',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type..."
          style={{
            flex: 1, background: '#131929', border: '1px solid #1A2235', borderRadius: '10px',
            padding: '8px 12px', color: '#F0F4FF', fontSize: '13px', outline: 'none',
          }}
        />
        <button onClick={handleSend} style={{
          background: '#C9A84C', border: 'none', borderRadius: '8px', padding: '8px',
          cursor: 'pointer', color: '#0B0F1A', display: 'flex',
        }}>
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function AudioSessionPage() {
  const { advisorName, advisorAvatar, isMuted, toggleMute, endSession } = useSessionStore()
  const [showChat, setShowChat] = useState(false)
  const [showActionSheet, setShowActionSheet] = useState(false)

  const actionItems = [
    { label: 'Switch to Video', action: () => {} },
    { label: 'Report Issue', action: () => {} },
    { label: 'Add Funds', action: () => {} },
  ]

  return (
    <>
      <style>{`
        @keyframes ws-audio-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(201,168,76,0.55); }
          70%  { box-shadow: 0 0 0 32px rgba(201,168,76,0); }
          100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
        }
        @keyframes ws-bar {
          0%, 100% { transform: scaleY(0.3); }
          50%       { transform: scaleY(1); }
        }
        @keyframes ws-float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, 30px) scale(1.1); }
          66% { transform: translate(-20px, 50px) scale(0.95); }
        }
        @keyframes ws-float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, -40px) scale(1.05); }
          66% { transform: translate(20px, -20px) scale(1.1); }
        }
      `}</style>

      <SessionWrapper>
        <SessionHeader />

        {/* Background animated gradient */}
        <div style={{ position: 'absolute', inset: '56px 0 0 0', overflow: 'hidden', zIndex: 0 }}>
          <div style={{
            position: 'absolute', width: '700px', height: '700px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(30,50,120,0.35) 0%, transparent 70%)',
            top: '-200px', left: '-150px',
            animation: 'ws-float1 18s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(70,20,90,0.25) 0%, transparent 70%)',
            bottom: '-150px', right: '-100px',
            animation: 'ws-float2 22s ease-in-out infinite',
          }} />
        </div>

        {/* Main content */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '24px',
          position: 'relative', zIndex: 1,
        }}>
          {/* Avatar with pulse */}
          <div style={{ animation: 'ws-audio-pulse 2.2s ease-out infinite', borderRadius: '50%' }}>
            <img
              src={advisorAvatar}
              alt={advisorName}
              style={{
                width: '120px', height: '120px', borderRadius: '50%',
                objectFit: 'cover', border: '3px solid #C9A84C', display: 'block',
              }}
            />
          </div>

          {/* Name + status */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              color: '#F0F4FF', fontWeight: 700, fontSize: '24px',
              fontFamily: "'Playfair Display', serif", margin: '0 0 6px',
            }}>
              {advisorName}
            </h2>
            <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
              Voice Call · In Progress
            </p>
          </div>

          {/* Audio visualizer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '40px' }}>
            {[0.6, 0.9, 0.5, 1.0, 0.7].map((speed, i) => (
              <div key={i} style={{
                width: '5px', borderRadius: '3px',
                background: 'linear-gradient(to top, #C9A84C, #E8C96D)',
                transformOrigin: 'center',
                animation: isMuted ? 'none' : `ws-bar ${speed * 0.9}s ease-in-out ${i * 0.12}s infinite alternate`,
                transform: isMuted ? 'scaleY(0.15)' : undefined,
                height: '36px', transition: 'transform 0.2s',
              }} />
            ))}
          </div>
        </div>

        {/* Control bar */}
        <div style={{
          position: 'relative', zIndex: 10, padding: '20px 24px 36px',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px',
        }}>
          <CtrlBtn icon={isMuted ? MicOff : Mic} onClick={toggleMute} active={isMuted} label={isMuted ? 'Unmute' : 'Mute'} />
          <CtrlBtn icon={Volume2} label="Speaker" />
          <CtrlBtn icon={PhoneOff} onClick={endSession} danger large label="End" />
          <CtrlBtn icon={MessageCircle} onClick={() => setShowChat(v => !v)} label="Chat" />
          <div style={{ position: 'relative' }}>
            <CtrlBtn icon={MoreHorizontal} onClick={() => setShowActionSheet(v => !v)} label="More" />
            {showActionSheet && (
              <div style={{
                position: 'absolute', bottom: '56px', left: '50%', transform: 'translateX(-50%)',
                background: '#0D1221', border: '1px solid #1A2235', borderRadius: '14px',
                padding: '8px', minWidth: '180px', zIndex: 70,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}>
                {actionItems.map(item => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setShowActionSheet(false) }}
                    style={{
                      display: 'block', width: '100%', padding: '10px 14px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#8B9BB4', fontSize: '13px', textAlign: 'left',
                      borderRadius: '8px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mini chat drawer */}
        {showChat && <MiniChatDrawer onClose={() => setShowChat(false)} />}

        {/* Billing warnings */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
          <div style={{ pointerEvents: 'auto' }}>
            <BillingWarning />
          </div>
        </div>
      </SessionWrapper>
    </>
  )
}
