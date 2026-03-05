// ============================================================
// WhiteStellar — Session Header
// src/components/session/SessionHeader.tsx
// ============================================================

import { Star, MessageSquare, Mic, Video } from 'lucide-react'
import { useSessionStore } from '../../store/sessionStore'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

interface Props {
  /** Optional extra element rendered on the right (e.g. mobile End button) */
  rightAction?: React.ReactNode
}

export default function SessionHeader({ rightAction }: Props) {
  const { sessionType, elapsedSeconds, totalCost, walletBalance, freeSecondsRemaining } = useSessionStore()

  const TypeIcon = sessionType === 'chat' ? MessageSquare : sessionType === 'audio' ? Mic : Video
  const typeLabel = sessionType === 'chat' ? 'Chat Session'
    : sessionType === 'audio' ? 'Voice Call' : 'Video Call'

  const isFree = freeSecondsRemaining > 0

  return (
    <div style={{
      height: '56px', flexShrink: 0,
      background: 'rgba(8,12,22,0.96)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #1A2235',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', position: 'relative', zIndex: 10,
    }}>

      {/* Left — logo + session type */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
        <Star size={15} color="#C9A84C" fill="#C9A84C" />
        <span style={{ color: '#4B5563', fontSize: '13px', display: 'none' }}>WhiteStellar</span>
        <TypeIcon size={14} color="#8B9BB4" />
        <span style={{ color: '#8B9BB4', fontSize: '13px', whiteSpace: 'nowrap' }}>{typeLabel}</span>
      </div>

      {/* Center — timer */}
      <div style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        textAlign: 'center',
      }}>
        {isFree ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
            <span style={{ color: '#C9A84C', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em' }}>FREE</span>
            <span style={{
              color: '#C9A84C', fontWeight: 700, fontSize: '18px',
              fontFamily: 'monospace', letterSpacing: '0.04em',
            }}>
              {formatTime(freeSecondsRemaining)}
            </span>
          </div>
        ) : (
          <span style={{
            color: '#F0F4FF', fontWeight: 700, fontSize: '18px',
            fontFamily: 'monospace', letterSpacing: '0.04em',
          }}>
            {formatTime(elapsedSeconds)}
          </span>
        )}
      </div>

      {/* Right — cost + balance (or custom action) */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px' }}>
        {rightAction ?? (
          <>
            <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '14px' }}>
              ${totalCost.toFixed(2)}
            </span>
            <span style={{ color: '#4B5563', fontSize: '12px' }}>
              / ${walletBalance.toFixed(2)}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
