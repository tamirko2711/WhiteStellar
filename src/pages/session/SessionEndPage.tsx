// ============================================================
// WhiteStellar — Session End / Summary Page
// src/pages/session/SessionEndPage.tsx
// ============================================================

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, MessageSquare, Mic, Video, Wallet, Home, Clock } from 'lucide-react'
import { useSessionStore } from '../../store/sessionStore'
import { useAuthStore } from '../../store/authStore'
import Toast from '../../components/Toast'
import { submitReview } from '../../lib/api/reviews'
import { markSessionReviewed } from '../../lib/api/sessions'

// ─── Star rating ──────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= (hovered || value)
        return (
          <button
            key={i}
            onClick={() => onChange(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
          >
            <Star
              size={28}
              fill={filled ? '#C9A84C' : 'transparent'}
              color={filled ? '#C9A84C' : '#4B5563'}
              style={{ transition: 'all 0.1s' }}
            />
          </button>
        )
      })}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function SessionEndPage() {
  const navigate = useNavigate()
  const {
    sessionType, advisorId, advisorName, advisorAvatar,
    clientName, clientAvatar,
    elapsedSeconds, totalCost, walletBalance,
    initialFreeSeconds, supabaseSessionId,
    resetSession,
  } = useSessionStore()

  const { user, userType } = useAuthStore()

  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ msg: '', visible: false })

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  // Breakdown
  const freeSecondsUsed = Math.min(initialFreeSeconds, elapsedSeconds)
  const paidSeconds = Math.max(0, elapsedSeconds - freeSecondsUsed)
  const freeMinutesUsed = Math.floor(freeSecondsUsed / 60)
  const paidMinutesDisplay = (paidSeconds / 60).toFixed(0)
  const totalMinutes = Math.floor(elapsedSeconds / 60)
  const totalSeconds = elapsedSeconds % 60
  const durationLabel = `${totalMinutes}m ${totalSeconds}s`

  // Remaining balance (already updated in authStore by SessionWrapper)
  const currentBalance = user?.walletBalance ?? Math.max(0, walletBalance - totalCost)

  const TYPE_ICON = { chat: MessageSquare, audio: Mic, video: Video }
  const TYPE_LABEL = { chat: 'Chat', audio: 'Audio', video: 'Video' }
  const TypeIcon = sessionType ? TYPE_ICON[sessionType] : MessageSquare
  const typeLabel = sessionType ? TYPE_LABEL[sessionType] : 'Session'

  // Capture whether a real session exists on initial mount.
  // useRef persists across re-renders, so resetSession() clearing Zustand state
  // won't cause the guard to misfire on the same render cycle.
  const hasSession = useRef(advisorName.length > 0 || clientName.length > 0)

  // Guard: if no ended session, redirect home
  if (!hasSession.current) {
    navigate('/', { replace: true })
    return null
  }

  // ── Advisor-specific end page (no review form) ─────────────
  if (userType === 'advisor') {
    const totalMinutes = Math.floor(elapsedSeconds / 60)
    const totalSecs = elapsedSeconds % 60
    const durationLabel = `${totalMinutes}m ${totalSecs}s`
    const isValidAvatar = typeof clientAvatar === 'string' && clientAvatar.trim().length > 0
    const initial = (clientName || '?').trim()[0].toUpperCase()

    return (
      <>
        <style>{`@keyframes ws-end-fade { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div style={{
          position: 'fixed', inset: 0, background: '#080C16', overflowY: 'auto', zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 60px',
        }}>
          <div style={{ width: '100%', maxWidth: '480px', animation: 'ws-end-fade 0.4s ease both' }}>

            <div style={{
              background: '#0D1221', border: '1px solid #1A2235',
              borderRadius: '20px', padding: '28px', marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Star size={16} color="#C9A84C" fill="#C9A84C" />
                <span style={{ color: '#8B9BB4', fontSize: '13px', fontWeight: 600 }}>WhiteStellar</span>
              </div>

              <h1 style={{
                color: '#F0F4FF', fontWeight: 700, fontSize: '22px',
                fontFamily: "'Playfair Display', serif", margin: '0 0 20px',
              }}>
                Session Completed ✓
              </h1>

              {/* Client card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                {isValidAvatar
                  ? <img src={clientAvatar} alt={clientName} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #C9A84C' }} />
                  : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#1A2C45', border: '2px solid #C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '24px' }}>{initial}</span>
                    </div>
                  )
                }
                <div>
                  <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '16px', margin: '0 0 6px' }}>
                    Session with {clientName}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8B9BB4', fontSize: '13px' }}>
                    <Clock size={13} />
                    {durationLabel}
                  </div>
                </div>
              </div>

              <div style={{ background: '#080C16', borderRadius: '12px', padding: '16px' }}>
                <p style={{ color: '#4B5563', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Session Summary</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8B9BB4', fontSize: '13px' }}>Duration</span>
                  <span style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px' }}>{durationLabel}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { resetSession(); navigate('/advisor/dashboard') }}
              style={{
                width: '100%', padding: '15px',
                background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
                border: 'none', borderRadius: '14px',
                color: '#0B0F1A', fontWeight: 700, fontSize: '15px', cursor: 'pointer',
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    )
  }

  async function handleSubmitReview() {
    if (rating === 0 || submitting) return
    if (!user || !advisorId) {
      // No real session — just navigate
      showToast('Thank you for your review! ✨')
      setTimeout(() => { resetSession(); navigate('/') }, 1500)
      return
    }

    setSubmitting(true)
    try {
      await submitReview({
        advisorId,
        clientId: user.id,
        clientName: user.fullName,
        clientAvatar: user.avatar,
        rating,
        comment: review,
        sessionType: sessionType ?? 'chat',
      })
      if (supabaseSessionId) {
        await markSessionReviewed(supabaseSessionId)
      }
      showToast('Thank you for your review! ✨')
      setTimeout(() => { resetSession(); navigate('/') }, 1500)
    } catch (err) {
      console.error('[SessionEnd] Failed to submit review:', err)
      showToast('Failed to submit review. Please try again.')
      setSubmitting(false)
    }
  }

  function handleSkip() {
    resetSession()
    navigate('/')
  }

  return (
    <>
      <style>{`
        @keyframes ws-end-fade { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, background: '#080C16',
        overflowY: 'auto', zIndex: 200,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '32px 20px 60px',
      }}>
        <div style={{
          width: '100%', maxWidth: '520px',
          animation: 'ws-end-fade 0.4s ease both',
        }}>

          {/* ── Session Summary Card ── */}
          <div style={{
            background: '#0D1221', border: '1px solid #1A2235',
            borderRadius: '20px', padding: '28px', marginBottom: '20px',
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Star size={16} color="#C9A84C" fill="#C9A84C" />
              <span style={{ color: '#8B9BB4', fontSize: '13px', fontWeight: 600 }}>WhiteStellar</span>
            </div>

            {/* Heading */}
            <h1 style={{
              color: '#F0F4FF', fontWeight: 700, fontSize: '22px',
              fontFamily: "'Playfair Display', serif", margin: '0 0 20px',
            }}>
              Session Complete ✓
            </h1>

            {/* Advisor */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <img src={advisorAvatar} alt={advisorName} style={{
                width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #C9A84C',
              }} />
              <div>
                <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '16px', margin: '0 0 4px' }}>{advisorName}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
                    border: '1px solid rgba(201,168,76,0.25)',
                    borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600,
                  }}>
                    <TypeIcon size={11} />
                    {typeLabel} Session
                  </span>
                  <span style={{ color: '#4B5563', fontSize: '12px' }}>{durationLabel}</span>
                </div>
              </div>
            </div>

            {/* Cost breakdown */}
            <div style={{
              background: '#080C16', borderRadius: '12px', padding: '16px', marginBottom: '0',
            }}>
              <p style={{ color: '#4B5563', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
                Cost Breakdown
              </p>
              {freeMinutesUsed > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#8B9BB4', fontSize: '13px' }}>
                    Free minutes used ({freeMinutesUsed} min)
                  </span>
                  <span style={{ color: '#22C55E', fontWeight: 600, fontSize: '13px' }}>FREE</span>
                </div>
              )}
              {paidSeconds > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#8B9BB4', fontSize: '13px' }}>
                    Paid minutes ({paidMinutesDisplay} min)
                  </span>
                  <span style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px' }}>
                    ${totalCost.toFixed(2)}
                  </span>
                </div>
              )}
              <div style={{ height: '1px', background: '#1A2235', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px' }}>Total Charged</span>
                <span style={{ color: '#C9A84C', fontWeight: 800, fontSize: '18px' }}>
                  ${totalCost.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#8B9BB4', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Wallet size={13} /> Remaining balance
                </span>
                <span style={{ color: '#4B5563', fontSize: '13px', fontWeight: 600 }}>
                  ${currentBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Rating Card ── */}
          <div style={{
            background: '#0D1221', border: '1px solid #1A2235',
            borderRadius: '20px', padding: '28px', marginBottom: '20px',
          }}>
            <h2 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '17px', margin: '0 0 6px' }}>
              How was your session with {advisorName.split(' ')[0]}?
            </h2>
            <p style={{ color: '#8B9BB4', fontSize: '13px', margin: '0 0 18px' }}>
              Your feedback helps other clients find the right advisor.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Share your experience... (optional)"
              rows={3}
              style={{
                width: '100%', background: '#131929', border: '1px solid #1A2235',
                borderRadius: '12px', padding: '12px 14px',
                color: '#F0F4FF', fontSize: '14px', resize: 'none',
                outline: 'none', fontFamily: 'inherit', lineHeight: 1.55,
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={handleSubmitReview}
                disabled={rating === 0 || submitting}
                style={{
                  flex: 1, padding: '13px',
                  background: rating > 0 && !submitting ? 'linear-gradient(135deg,#C9A84C,#E8C96D)' : '#1A2540',
                  border: 'none', borderRadius: '12px',
                  color: rating > 0 && !submitting ? '#0B0F1A' : '#4B5563',
                  fontWeight: 700, fontSize: '14px',
                  cursor: rating > 0 && !submitting ? 'pointer' : 'default', transition: 'all 0.2s',
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                onClick={handleSkip}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#4B5563', fontSize: '13px',
                  textDecoration: 'underline', textUnderlineOffset: '2px',
                }}
              >
                Skip for now
              </button>
            </div>
          </div>

          {/* ── What's Next ── */}
          <div style={{
            background: '#0D1221', border: '1px solid #1A2235',
            borderRadius: '20px', padding: '24px',
          }}>
            <h3 style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '15px', margin: '0 0 16px' }}>
              What's Next?
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>

              {/* Book again */}
              <button
                onClick={() => { resetSession(); navigate(`/advisor/${advisorId}`) }}
                style={{
                  flex: '1 1 140px', padding: '14px 12px',
                  background: '#131929', border: '1px solid #1E2D45',
                  borderRadius: '14px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#C9A84C')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E2D45')}
              >
                <img src={advisorAvatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ color: '#F0F4FF', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>
                  Book Another Session
                </span>
              </button>

              {/* Top up */}
              <button
                onClick={() => { resetSession(); navigate('/dashboard/wallet') }}
                style={{
                  flex: '1 1 140px', padding: '14px 12px',
                  background: '#131929', border: '1px solid #1E2D45',
                  borderRadius: '14px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#C9A84C')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E2D45')}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Wallet size={18} color="#C9A84C" />
                </div>
                <span style={{ color: '#F0F4FF', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>
                  Top Up Wallet
                </span>
              </button>

              {/* Home */}
              <button
                onClick={() => { resetSession(); navigate('/') }}
                style={{
                  flex: '1 1 140px', padding: '14px 12px',
                  background: '#131929', border: '1px solid #1E2D45',
                  borderRadius: '14px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#C9A84C')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E2D45')}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(139,155,180,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Home size={18} color="#8B9BB4" />
                </div>
                <span style={{ color: '#F0F4FF', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>
                  Back to Home
                </span>
              </button>
            </div>
          </div>
        </div>

        <Toast message={toast.msg} visible={toast.visible} />
      </div>
    </>
  )
}
