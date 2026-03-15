// ============================================================
// WhiteStellar — Start Session Modal
// src/components/modals/StartSessionModal.tsx
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Mic, Video, X, Wallet, Clock } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useSessionStore } from '../../store/sessionStore'
import { createSession } from '../../lib/api/sessions'

// ─── Props ────────────────────────────────────────────────────

interface Props {
  advisorId: number
  advisorName: string
  advisorAvatar: string
  sessionType: 'chat' | 'audio' | 'video'
  pricePerMinute: number
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────

export default function StartSessionModal({
  advisorId, advisorName, advisorAvatar,
  sessionType, pricePerMinute, onClose,
}: Props) {
  const { user } = useAuthStore()
  const startSession = useSessionStore(s => s.startSession)
  const navigate = useNavigate()

  const [agreed, setAgreed] = useState(false)
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState('')

  const walletBalance = user?.walletBalance ?? 0
  const hasEnoughBalance = walletBalance >= pricePerMinute
  const isNewClient = true // demo: always show free minutes
  const isRealUser = user && !user.id.startsWith('dev-')

  const freeMinutes = isNewClient ? 3 : 0
  const estimatedPaidMinutes = Math.floor(walletBalance / pricePerMinute)
  const estimatedTotalMinutes = estimatedPaidMinutes + freeMinutes

  const TYPE_ICON = { chat: MessageCircle, audio: Mic, video: Video }
  const TYPE_LABEL = { chat: 'Chat', audio: 'Audio', video: 'Video' }
  const TypeIcon = TYPE_ICON[sessionType]

  async function handleStart() {
    if (!user || !agreed || !hasEnoughBalance || starting) return
    setStartError('')
    setStarting(true)
    try {
      let supabaseSessionId: number | null = null
      if (isRealUser) {
        const sessionData = await createSession({
          advisorId,
          advisorName,
          clientId: user.id,
          clientName: user.fullName,
          sessionType,
          pricePerMinute,
        })
        supabaseSessionId = sessionData.id
      }
      startSession({
        sessionType,
        clientId: user.id,
        clientName: user.fullName,
        clientAvatar: user.avatar ?? 'https://i.pravatar.cc/150?img=5',
        advisorId,
        advisorName,
        advisorAvatar,
        pricePerMinute,
        walletBalance,
        isNewClient,
        supabaseSessionId,
      })
      onClose()
      navigate('/session/connecting')
    } catch (err) {
      console.error('Failed to start session:', err)
      setStartError('Could not start session. Please try again.')
      setStarting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#0D1221', border: '1px solid #1A2235',
        borderRadius: '20px', padding: '28px', maxWidth: '440px', width: '100%',
        position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>

        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4',
          padding: '4px',
        }}>
          <X size={20} />
        </button>

        {/* Heading */}
        <h2 style={{
          color: '#F0F4FF', fontWeight: 700, fontSize: '18px',
          margin: '0 0 20px', paddingRight: '28px', lineHeight: 1.3,
          fontFamily: "'Playfair Display', serif",
        }}>
          Start {TYPE_LABEL[sessionType]} Session with {advisorName}
        </h2>

        {/* Advisor card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          background: '#080C16', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px',
        }}>
          <img src={advisorAvatar} alt={advisorName} style={{
            width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover',
            border: '2px solid #C9A84C', flexShrink: 0,
          }} />
          <div>
            <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '15px', margin: '0 0 5px' }}>
              {advisorName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                color: '#C9A84C', fontSize: '12px', fontWeight: 600,
              }}>
                <TypeIcon size={12} />
                {TYPE_LABEL[sessionType]} Session
              </span>
              <span style={{
                background: 'rgba(34,197,94,0.12)', color: '#22C55E',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: '20px', padding: '1px 8px', fontSize: '11px', fontWeight: 600,
              }}>
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Free minutes banner */}
        {isNewClient && (
          <div style={{
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '10px', padding: '10px 14px', marginBottom: '14px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '18px' }}>🎁</span>
            <div>
              <p style={{ color: '#C9A84C', fontSize: '13px', fontWeight: 700, margin: '0 0 1px' }}>
                Your first 3 minutes are FREE!
              </p>
              <p style={{ color: '#8B9BB4', fontSize: '11px', margin: 0 }}>
                No charge for the first 3 minutes of your session
              </p>
            </div>
          </div>
        )}

        {/* Pricing info */}
        <div style={{
          background: '#080C16', borderRadius: '12px', padding: '14px 16px', marginBottom: '14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: '#8B9BB4', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} /> Rate
            </span>
            <span style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '15px' }}>
              ${pricePerMinute.toFixed(2)}<span style={{ color: '#8B9BB4', fontWeight: 400, fontSize: '12px' }}>/min</span>
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ color: '#8B9BB4', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wallet size={13} /> Your balance
            </span>
            <span style={{ color: hasEnoughBalance ? '#22C55E' : '#F59E0B', fontWeight: 700, fontSize: '15px' }}>
              ${walletBalance.toFixed(2)}
            </span>
          </div>
          <div style={{ height: '1px', background: '#1A2235', margin: '4px 0 10px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#8B9BB4', fontSize: '13px' }}>Est. session time</span>
            <span style={{ color: '#F0F4FF', fontSize: '13px', fontWeight: 600 }}>
              ~{estimatedTotalMinutes} min{isNewClient ? ' (incl. 3 free)' : ''}
            </span>
          </div>
        </div>

        {/* Start error */}
        {startError && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '10px 14px', marginBottom: '14px',
          }}>
            <span style={{ color: '#EF4444', fontSize: '13px' }}>{startError}</span>
          </div>
        )}

        {/* Insufficient balance warning */}
        {!hasEnoughBalance && (
          <div style={{
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '10px', padding: '10px 14px', marginBottom: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          }}>
            <span style={{ color: '#F59E0B', fontSize: '13px', fontWeight: 600 }}>
              ⚠️ Insufficient balance
            </span>
            <button style={{
              background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
              border: 'none', color: '#0B0F1A', borderRadius: '8px',
              padding: '7px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            }}>
              Top Up Wallet
            </button>
          </div>
        )}

        {/* Agreement checkbox */}
        <label style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          cursor: 'pointer', marginBottom: '20px',
        }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            style={{ marginTop: '2px', accentColor: '#C9A84C', width: '16px', height: '16px', flexShrink: 0 }}
          />
          <span style={{ color: '#8B9BB4', fontSize: '13px', lineHeight: 1.55 }}>
            I understand sessions are billed per minute and funds will be deducted from my wallet balance.
          </span>
        </label>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={!agreed || !hasEnoughBalance || starting}
          style={{
            width: '100%', padding: '14px',
            background: agreed && hasEnoughBalance && !starting
              ? 'linear-gradient(135deg,#C9A84C,#E8C96D)'
              : '#1A2540',
            border: 'none', borderRadius: '12px',
            color: agreed && hasEnoughBalance && !starting ? '#0B0F1A' : '#4B5563',
            fontWeight: 700, fontSize: '15px',
            cursor: agreed && hasEnoughBalance && !starting ? 'pointer' : 'default',
            marginBottom: '10px', transition: 'all 0.2s',
          }}
        >
          {starting ? 'Starting…' : `Start ${TYPE_LABEL[sessionType]} Session`}
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '12px',
            background: 'none', border: '1px solid #1A2235',
            borderRadius: '12px', color: '#8B9BB4',
            fontWeight: 600, fontSize: '14px', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
