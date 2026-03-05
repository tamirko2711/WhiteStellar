// ============================================================
// WhiteStellar — Billing Warning overlays
// src/components/session/BillingWarning.tsx
// ============================================================

import { useState, useEffect } from 'react'
import { useSessionStore } from '../../store/sessionStore'

export default function BillingWarning() {
  const { status, walletBalance, totalCost, pricePerMinute, freeSecondsRemaining, endSession } = useSessionStore()
  const [lowBalanceDismissed, setLowBalanceDismissed] = useState(false)
  const [endCountdown, setEndCountdown] = useState(5)

  const remainingValue = walletBalance - totalCost
  const remainingMinutes = pricePerMinute > 0 ? remainingValue / pricePerMinute : 999

  const isLowBalance = freeSecondsRemaining === 0 && remainingMinutes < 2 && remainingMinutes > 0 && status === 'active'
  const isFreeExpiring = freeSecondsRemaining > 0 && freeSecondsRemaining <= 10
  const isEnding = status === 'ending'

  // Run countdown when ending due to balance exhaustion
  useEffect(() => {
    if (!isEnding) {
      setEndCountdown(5)
      return
    }
    const interval = setInterval(() => {
      setEndCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          endSession()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isEnding, endSession])

  // ── Balance exhausted overlay ──
  if (isEnding) {
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'rgba(8,12,22,0.93)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '16px', padding: '20px', textAlign: 'center',
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px',
        }}>
          ⏱
        </div>
        <h2 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: 0 }}>
          Your balance has run out
        </h2>
        <p style={{ color: '#8B9BB4', fontSize: '15px', margin: 0 }}>
          The session will end in{' '}
          <span style={{ color: '#EF4444', fontWeight: 800, fontSize: '20px' }}>{endCountdown}</span> seconds
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
          <button style={{
            background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
            border: 'none', color: '#0B0F1A',
            borderRadius: '12px', padding: '12px 24px',
            fontWeight: 700, fontSize: '14px', cursor: 'pointer',
          }}>
            Add Funds & Continue
          </button>
          <button
            onClick={() => endSession()}
            style={{
              background: 'none', border: '1px solid #1A2235', color: '#8B9BB4',
              borderRadius: '12px', padding: '12px 24px',
              fontSize: '14px', cursor: 'pointer',
            }}
          >
            End Session Now
          </button>
        </div>
      </div>
    )
  }

  // ── Free minutes expiring ──
  if (isFreeExpiring) {
    return (
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(201,168,76,0.1)', borderTop: '1px solid rgba(201,168,76,0.3)',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        backdropFilter: 'blur(4px)',
      }}>
        <span style={{ fontSize: '16px' }}>🎁</span>
        <span style={{ color: '#C9A84C', fontSize: '13px', fontWeight: 600 }}>
          Your free minutes end in{' '}
          <span style={{ fontWeight: 800, fontSize: '15px' }}>{freeSecondsRemaining}s</span>
          . Billing starts after.
        </span>
      </div>
    )
  }

  // ── Low balance warning ──
  if (isLowBalance && !lowBalanceDismissed) {
    return (
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(245,158,11,0.08)', borderTop: '1px solid rgba(245,158,11,0.3)',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        backdropFilter: 'blur(4px)',
      }}>
        <span style={{ color: '#F59E0B', fontSize: '13px', fontWeight: 600 }}>
          ⚠️ Less than 2 minutes remaining on your balance
        </span>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button style={{
            background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
            border: 'none', color: '#0B0F1A',
            borderRadius: '8px', padding: '7px 14px',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer',
          }}>
            Add Funds
          </button>
          <button
            onClick={() => setLowBalanceDismissed(true)}
            style={{
              background: 'none', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B',
              borderRadius: '8px', padding: '7px 14px',
              fontSize: '12px', cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    )
  }

  return null
}
