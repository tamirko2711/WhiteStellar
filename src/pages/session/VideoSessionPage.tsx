// ============================================================
// WhiteStellar — Video Session Screen
// src/pages/session/VideoSessionPage.tsx
// ============================================================

import { useState, useRef, useEffect } from 'react'
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageCircle, Monitor, MoreHorizontal, X, Send,
} from 'lucide-react'
import { useSessionStore } from '../../store/sessionStore'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import SessionWrapper from '../../components/session/SessionWrapper'
import SessionHeader from '../../components/session/SessionHeader'
import BillingWarning from '../../components/session/BillingWarning'
import Toast from '../../components/Toast'
import { useAgoraSession } from '../../hooks/useAgoraSession'

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
          transition: 'all 0.15s',
        }}
      >
        <Icon size={large ? 22 : 20} />
      </button>
      {label && <span style={{ color: '#4B5563', fontSize: '11px' }}>{label}</span>}
    </div>
  )
}

// ─── Mini chat drawer (shared pattern) ────────────────────────

function MiniChatDrawer({ onClose }: { onClose: () => void }) {
  const { clientId, advisorId, advisorName, advisorAvatar, clientName, clientAvatar, messages, addMessage } =
    useSessionStore()
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  function handleSend() {
    const text = input.trim()
    if (!text || !clientId) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    addMessage({ id: `chat-${Date.now()}`, senderId: clientId, senderName: clientName, senderAvatar: clientAvatar, text, timestamp: now })
    setInput('')
    setTimeout(() => {
      addMessage({ id: `reply-${Date.now()}`, senderId: advisorId ?? 0, senderName: advisorName, senderAvatar: advisorAvatar, text: '✨ I can see that clearly...', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    }, 2200)
  }

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
      background: '#0D1221', borderTop: '1px solid #1A2235',
      borderRadius: '20px 20px 0 0', zIndex: 60, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #1A2235' }}>
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
      <div style={{ padding: '10px 14px', borderTop: '1px solid #1A2235', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type..."
          style={{ flex: 1, background: '#131929', border: '1px solid #1A2235', borderRadius: '10px', padding: '8px 12px', color: '#F0F4FF', fontSize: '13px', outline: 'none' }}
        />
        <button onClick={handleSend} style={{ background: '#C9A84C', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#0B0F1A', display: 'flex' }}>
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function VideoSessionPage() {
  const {
    advisorName, advisorAvatar, clientAvatar, clientName,
    isMuted, isCameraOff, toggleMute, toggleCamera, endSession, setEnded, supabaseSessionId,
  } = useSessionStore()
  const userType = useAuthStore(s => s.userType)
  const isAdvisorSide = userType === 'advisor'

  const [showChat, setShowChat] = useState(false)
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [toast, setToast] = useState({ msg: '', visible: false })
  const [sessionEndedByOther, setSessionEndedByOther] = useState(false)
  const [showAdvisorEndModal, setShowAdvisorEndModal] = useState(false)
  const otherEndedRef = useRef(false)

  // ── Agora real video + audio ──────────────────────────────────
  const { remoteVideoTrack, localVideoTrack, isJoined, error: agoraError, setMuted, setCameraOff } = useAgoraSession({
    channel: supabaseSessionId ? String(supabaseSessionId) : null,
    mode: 'video',
  })

  // Keep Agora mute/camera in sync with store toggles
  useEffect(() => { setMuted(isMuted) }, [isMuted, setMuted])
  useEffect(() => { setCameraOff(isCameraOff) }, [isCameraOff, setCameraOff])

  // ── Poll for other side ending the session ───────────────────
  useEffect(() => {
    if (!supabaseSessionId) return
    const poll = () => {
      supabase
        .from('sessions')
        .select('status')
        .eq('id', supabaseSessionId)
        .single()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then(({ data }: { data: any }) => {
          if (!data) return
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
  }, [supabaseSessionId])

  // Auto-navigate after 8s when other side ends
  useEffect(() => {
    if (!sessionEndedByOther) return
    const timer = setTimeout(() => setEnded(), 8000)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionEndedByOther])

  // Attach remote video stream to DOM element
  const remoteVideoRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (remoteVideoTrack && remoteVideoRef.current) {
      remoteVideoTrack.play(remoteVideoRef.current)
    }
    return () => { remoteVideoTrack?.stop() }
  }, [remoteVideoTrack])

  // Attach local (self-view) video stream to DOM element
  const localVideoRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (localVideoTrack && localVideoRef.current && !isCameraOff) {
      localVideoTrack.play(localVideoRef.current)
    }
    return () => { localVideoTrack?.stop() }
  }, [localVideoTrack, isCameraOff])

  // Draggable PiP
  const [pipPos, setPipPos] = useState({ bottom: 100, right: 24 })
  const dragging = useRef(false)
  const startRef = useRef({ mouseX: 0, mouseY: 0, bottom: 100, right: 24 })

  // Advisor gets confirmation; client ends directly
  function handleEndClick() {
    if (isAdvisorSide) {
      setShowAdvisorEndModal(true)
    } else {
      void endSession()
    }
  }

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  function handlePipMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    dragging.current = true
    startRef.current = { mouseX: e.clientX, mouseY: e.clientY, bottom: pipPos.bottom, right: pipPos.right }
  }

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return
      const dx = e.clientX - startRef.current.mouseX
      const dy = e.clientY - startRef.current.mouseY
      setPipPos({
        right: Math.max(8, startRef.current.right - dx),
        bottom: Math.max(8, startRef.current.bottom - dy),
      })
    }
    function onMouseUp() { dragging.current = false }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const actionItems = [
    { label: 'Switch to Audio Only', action: () => showToast('Switching to audio...') },
    { label: 'Report Issue', action: () => {} },
    { label: 'Add Funds', action: () => {} },
    { label: 'Flip Camera', action: () => showToast('Camera flipped') },
  ]

  return (
    <>
      <style>{`
        @keyframes ws-float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, 30px) scale(1.1); }
          66% { transform: translate(-20px, 60px) scale(0.95); }
        }
        @keyframes ws-float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, -30px) scale(1.05); }
          66% { transform: translate(30px, -20px) scale(1.1); }
        }
        @keyframes ws-scanlines {
          0%   { background-position: 0 0; }
          100% { background-position: 0 4px; }
        }
      `}</style>

      <SessionWrapper>
        {/* Fullscreen video area */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* Animated gradient background */}
          <div style={{ position: 'absolute', inset: 0, background: '#080C16' }}>
            <div style={{
              position: 'absolute', width: '800px', height: '800px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(20,40,100,0.4) 0%, transparent 70%)',
              top: '-200px', left: '-200px', animation: 'ws-float1 20s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(60,15,80,0.3) 0%, transparent 70%)',
              bottom: '-100px', right: '-100px', animation: 'ws-float2 25s ease-in-out infinite',
            }} />
          </div>

          {/* Remote video feed — fills the full background */}
          <div
            ref={remoteVideoRef}
            style={{ position: 'absolute', inset: 0, zIndex: 2 }}
          />

          {/* Fallback: show advisor avatar when remote stream not yet received */}
          {!remoteVideoTrack && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: '14px',
            }}>
              <img
                src={advisorAvatar}
                alt={advisorName}
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(201,168,76,0.4)' }}
              />
              <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '16px', margin: 0 }}>{advisorName}</p>
              <p style={{ color: '#8B9BB4', fontSize: '13px', margin: 0 }}>
                {isJoined ? 'Waiting for camera…' : 'Connecting…'}
              </p>
              {agoraError && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px', padding: '10px 16px', maxWidth: '300px', textAlign: 'center', marginTop: '8px',
                }}>
                  <p style={{ color: '#EF4444', fontSize: '12px', margin: 0 }}>⚠️ {agoraError}</p>
                </div>
              )}
            </div>
          )}

          {/* Scanline overlay (subtle texture) */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px)',
          }} />
        </div>

        {/* Overlay header */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <SessionHeader />
        </div>

        {/* Participant label (bottom-left) */}
        <div style={{
          position: 'absolute', bottom: '100px', left: '20px', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px' }}>{advisorName}</span>
          <span style={{
            background: 'rgba(45,212,191,0.15)', color: '#2DD4BF',
            border: '1px solid rgba(45,212,191,0.3)',
            borderRadius: '4px', padding: '1px 6px', fontSize: '10px', fontWeight: 700,
          }}>HD</span>
          {/* Signal bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
            {[6, 10, 14].map((h, i) => (
              <div key={i} style={{ width: '3px', height: `${h}px`, background: '#22C55E', borderRadius: '1px' }} />
            ))}
          </div>
        </div>

        {/* Self-view (draggable PiP) */}
        <div
          onMouseDown={handlePipMouseDown}
          style={{
            position: 'absolute', zIndex: 20,
            bottom: `${pipPos.bottom}px`, right: `${pipPos.right}px`,
            width: '160px', height: '120px',
            background: '#0D1221', border: '2px solid #1E2D45',
            borderRadius: '12px', cursor: 'grab', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
        >
          {isCameraOff ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px' }}>
              <VideoOff size={20} color="#4B5563" />
              <span style={{ color: '#4B5563', fontSize: '11px' }}>Camera Off</span>
            </div>
          ) : (
            /* Real local camera feed */
            <div ref={localVideoRef} style={{ width: '100%', height: '100%' }}>
              {/* Fallback avatar while camera initializes */}
              {!localVideoTrack && (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px' }}>
                  <img src={clientAvatar} alt="You" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ color: '#8B9BB4', fontSize: '11px' }}>You</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Control bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
          padding: '20px 24px 36px',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px',
          background: 'linear-gradient(to top, rgba(8,12,22,0.9) 0%, transparent 100%)',
        }}>
          <CtrlBtn icon={isMuted ? MicOff : Mic} onClick={toggleMute} active={isMuted} label={isMuted ? 'Unmute' : 'Mute'} />
          <CtrlBtn icon={isCameraOff ? VideoOff : Video} onClick={toggleCamera} active={isCameraOff} label={isCameraOff ? 'Start Cam' : 'Stop Cam'} />
          <CtrlBtn icon={PhoneOff} onClick={handleEndClick} danger large label="End" />
          <CtrlBtn icon={MessageCircle} onClick={() => setShowChat(v => !v)} label="Chat" />
          <CtrlBtn icon={Monitor} onClick={() => showToast('Screen sharing coming soon')} label="Share" />
          <div style={{ position: 'relative' }}>
            <CtrlBtn icon={MoreHorizontal} onClick={() => setShowActionSheet(v => !v)} label="More" />
            {showActionSheet && (
              <div style={{
                position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)',
                background: '#0D1221', border: '1px solid #1A2235', borderRadius: '14px',
                padding: '8px', minWidth: '200px', zIndex: 70,
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              }}>
                {actionItems.map(item => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setShowActionSheet(false) }}
                    style={{
                      display: 'block', width: '100%', padding: '10px 14px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#8B9BB4', fontSize: '13px', textAlign: 'left', borderRadius: '8px',
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

        <Toast message={toast.msg} visible={toast.visible} />

        {/* ── Advisor end confirmation modal ── */}
        {showAdvisorEndModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}>
            <div style={{
              background: '#0D1221', border: '1px solid #1A2235',
              borderRadius: '20px', padding: '32px 28px', maxWidth: '360px', width: '100%',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '44px', marginBottom: '16px' }}>🎥</div>
              <h2 style={{
                color: '#F0F4FF', fontWeight: 700, fontSize: '18px',
                fontFamily: "'Playfair Display', serif", margin: '0 0 10px',
              }}>
                End Video Call?
              </h2>
              <p style={{ color: '#8B9BB4', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
                This will end the session for both you and <strong style={{ color: '#F0F4FF' }}>{clientName}</strong>.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowAdvisorEndModal(false)}
                  style={{
                    flex: 1, padding: '14px',
                    background: 'transparent', border: '1px solid #1E2D45',
                    borderRadius: '12px', color: '#8B9BB4', fontWeight: 600,
                    fontSize: '15px', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setShowAdvisorEndModal(false); void endSession() }}
                  style={{
                    flex: 1, padding: '14px',
                    background: '#EF4444', border: 'none',
                    borderRadius: '12px', color: '#fff', fontWeight: 700,
                    fontSize: '15px', cursor: 'pointer',
                  }}
                >
                  End Call
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Session ended by other participant ── */}
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
                View Session Summary
              </button>
              <p style={{ color: '#4B5563', fontSize: '12px', margin: '12px 0 0' }}>
                Auto-redirecting in a few seconds…
              </p>
            </div>
          </div>
        )}
      </SessionWrapper>
    </>
  )
}
