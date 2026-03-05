import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Mic, Video, ChevronDown, ChevronUp, Star, X } from 'lucide-react'
import { format } from 'date-fns'
import { getClientSessions } from '../../../lib/api/sessions'
import { useAuthStore } from '../../../store/authStore'
import Toast from '../../../components/Toast'

// ─── Local session type (mapped from Supabase) ────────────────

interface SessionData {
  id: string
  advisorId: number
  advisorName: string
  advisorAvatar: string
  startedAt: string
  endedAt: string
  durationMinutes: number
  pricePerMinute: number
  totalCost: number
  hasReview: boolean
  notes: string | null
  status: string
  type: 'chat' | 'audio' | 'video'
}

function mapSession(raw: Record<string, unknown>): SessionData {
  const advisors = raw.advisors as Record<string, string> | null
  return {
    id: String(raw.id),
    advisorId: Number(raw.advisor_id),
    advisorName: advisors?.full_name ?? 'Advisor',
    advisorAvatar: advisors?.avatar_url ?? '',
    startedAt: String(raw.created_at ?? ''),
    endedAt: String(raw.ended_at ?? raw.created_at ?? ''),
    durationMinutes: Math.floor(Number(raw.duration_seconds ?? 0) / 60),
    pricePerMinute: Number(raw.price_per_minute ?? 0),
    totalCost: Number(raw.total_cost ?? 0),
    hasReview: Boolean(raw.has_review),
    notes: raw.notes as string | null,
    status: String(raw.status ?? 'completed'),
    type: (raw.session_type as 'chat' | 'audio' | 'video') ?? 'chat',
  }
}

const STATUS_PILLS = [
  { key: 'all',         label: 'All' },
  { key: 'completed',   label: 'Completed' },
  { key: 'cancelled',   label: 'Cancelled' },
  { key: 'in_progress', label: 'In Progress' },
] as const

type StatusKey = typeof STATUS_PILLS[number]['key']

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  chat:  { bg: 'rgba(45,212,191,0.12)',  color: '#2DD4BF' },
  audio: { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B' },
  video: { bg: 'rgba(139,92,246,0.12)',  color: '#8B5CF6' },
}

// ─── Rating modal ─────────────────────────────────────────────

interface RatingModalProps {
  session: SessionData
  onClose: () => void
  onSubmit: () => void
}

function RatingModal({ session, onClose, onSubmit }: RatingModalProps) {
  const [stars, setStars] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (stars === 0) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    onSubmit()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '20px',
          width: '440px', maxWidth: 'calc(100vw - 32px)', padding: '28px 28px 24px',
          animation: 'ratingModalIn 0.2s ease both', position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563',
          }}
        >
          <X size={18} />
        </button>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: '#F0F4FF', margin: '0 0 2px' }}>
          Rate Your Session
        </h2>
        <p style={{ color: '#8B9BB4', fontSize: '13px', margin: '0 0 18px' }}>
          with {session.advisorName}
        </p>

        {/* Session context */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: TYPE_COLORS[session.type].bg, color: TYPE_COLORS[session.type].color,
          borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 600, marginBottom: '20px',
        }}>
          {session.type === 'video' ? <Video size={12} /> : session.type === 'audio' ? <Mic size={12} /> : <MessageCircle size={12} />}
          {session.type.charAt(0).toUpperCase() + session.type.slice(1)} session · {format(new Date(session.startedAt), 'MMM d, yyyy')}
        </div>

        {/* Stars */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s} type="button"
              onClick={() => setStars(s)}
              onMouseEnter={() => setHoveredStar(s)}
              onMouseLeave={() => setHoveredStar(0)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <Star
                size={36}
                fill={s <= (hoveredStar || stars) ? '#C9A84C' : 'none'}
                color={s <= (hoveredStar || stars) ? '#C9A84C' : '#4B5563'}
              />
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div style={{ marginBottom: '20px' }}>
          <textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={e => setComment(e.target.value.slice(0, 500))}
            rows={4}
            style={{
              width: '100%', background: '#131929', border: '1px solid #1E2D45',
              borderRadius: '10px', padding: '12px 16px', color: '#F0F4FF',
              fontSize: '14px', outline: 'none', resize: 'none',
              fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#4B5563', marginTop: '4px' }}>
            {comment.length}/500
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={handleSubmit}
          disabled={stars === 0 || loading}
          style={{
            width: '100%', height: '46px', borderRadius: '10px', border: 'none',
            background: stars > 0 && !loading ? '#C9A84C' : '#1E2D45',
            color: stars > 0 && !loading ? '#0B0F1A' : '#4B5563',
            fontSize: '14px', fontWeight: 700, cursor: stars > 0 && !loading ? 'pointer' : 'not-allowed',
            marginBottom: '10px',
          }}
        >
          {loading ? 'Submitting…' : 'Submit Review'}
        </button>
        <button
          onClick={onClose}
          style={{
            display: 'block', margin: '0 auto', background: 'none', border: 'none',
            color: '#4B5563', fontSize: '13px', cursor: 'pointer',
          }}
        >
          Skip
        </button>
      </div>

      <style>{`
        @keyframes ratingModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ─── Session card ─────────────────────────────────────────────

interface SessionCardProps {
  session: SessionData
  expanded: boolean
  onToggle: () => void
  onRate: () => void
}

function SessionCard({ session, expanded, onToggle, onRate }: SessionCardProps) {
  const typeStyle = TYPE_COLORS[session.type]
  const isCompleted = session.status === 'completed'
  const isCancelled = session.status === 'cancelled'

  return (
    <div style={{ background: '#131929', border: '1px solid #1E2D45', borderRadius: '14px', overflow: 'hidden' }}>
      {/* Card body */}
      <div style={{ display: 'flex', gap: '16px', padding: '18px 20px', flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Left: advisor info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 220px', minWidth: 0 }}>
          <img
            src={session.advisorAvatar}
            alt={session.advisorName}
            style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, color: '#F0F4FF', fontSize: '14px', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session.advisorName}
            </p>
            <p style={{ color: '#8B9BB4', fontSize: '11px', margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Advisor
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: typeStyle.bg, color: typeStyle.color,
                borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600,
              }}>
                {session.type === 'video' ? <Video size={11} /> : session.type === 'audio' ? <Mic size={11} /> : <MessageCircle size={11} />}
                {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
              </span>
              <span style={{ color: '#4B5563', fontSize: '11px' }}>
                {format(new Date(session.startedAt), 'MMM d, yyyy')} · {format(new Date(session.startedAt), 'h:mm a')}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: duration + cost */}
        <div style={{ flex: '0 1 160px', textAlign: 'center' }}>
          <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px', margin: '0 0 2px' }}>
            {session.durationMinutes > 0 ? `${session.durationMinutes} min` : '—'}
          </p>
          {session.pricePerMinute > 0 && (
            <p style={{ color: '#8B9BB4', fontSize: '11px', margin: '0 0 2px' }}>
              ${session.pricePerMinute.toFixed(2)}/min
            </p>
          )}
          <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '14px', margin: 0 }}>
            {session.totalCost > 0 ? `$${session.totalCost.toFixed(2)}` : '—'}
          </p>
        </div>

        {/* Right: status + actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flex: '0 0 auto' }}>
          <span style={{
            padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
            background: isCompleted ? 'rgba(34,197,94,0.12)' : isCancelled ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
            color: isCompleted ? '#22C55E' : isCancelled ? '#EF4444' : '#F59E0B',
          }}>
            {isCompleted ? 'Completed' : isCancelled ? 'Cancelled' : 'In Progress'}
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onToggle}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid #1E2D45',
                color: '#8B9BB4', borderRadius: '8px', padding: '5px 12px',
                fontSize: '12px', cursor: 'pointer',
              }}
            >
              View Details
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {isCompleted && !session.hasReview && (
              <button
                onClick={onRate}
                style={{
                  background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.4)',
                  color: '#C9A84C', borderRadius: '8px', padding: '5px 12px',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Rate Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Accordion: View Details */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1E2D45', padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
          {/* Timeline */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px', fontWeight: 600 }}>
              Session Timeline
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#F0F4FF', margin: 0 }}>
                  {format(new Date(session.startedAt), 'h:mm a')}
                </p>
                <p style={{ fontSize: '11px', color: '#4B5563', margin: 0 }}>Start</p>
              </div>
              <div style={{ flex: 1, height: '1px', background: '#1E2D45', position: 'relative' }}>
                {session.durationMinutes > 0 && (
                  <span style={{
                    position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)',
                    fontSize: '11px', color: '#2DD4BF', fontWeight: 600, background: '#131929', padding: '0 6px',
                  }}>
                    {session.durationMinutes} min
                  </span>
                )}
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#F0F4FF', margin: 0 }}>
                  {format(new Date(session.endedAt), 'h:mm a')}
                </p>
                <p style={{ fontSize: '11px', color: '#4B5563', margin: 0 }}>End</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {session.notes && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px', fontWeight: 600 }}>
                Session Notes
              </p>
              <p style={{ fontSize: '13px', color: '#8B9BB4', margin: 0, lineHeight: 1.6 }}>{session.notes}</p>
            </div>
          )}

          {/* Message thread placeholder */}
          <div>
            <p style={{ fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px', fontWeight: 600 }}>
              Message Thread
            </p>
            <div style={{
              background: '#0D1221', border: '1px dashed #1E2D45', borderRadius: '10px',
              padding: '16px', textAlign: 'center',
            }}>
              <MessageCircle size={20} style={{ color: '#1E2D45', marginBottom: '6px' }} />
              <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>
                Message history coming soon
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sessions page ────────────────────────────────────────────

export default function Sessions() {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusKey>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set(['chat', 'audio', 'video']))
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [ratingSession, setRatingSession] = useState<SessionData | null>(null)
  const [toast, setToast] = useState({ msg: '', visible: false })

  useEffect(() => {
    if (!user?.id) return
    getClientSessions(user.id)
      .then(data => setSessions((data as Record<string, unknown>[]).map(mapSession)))
      .catch(console.error)
  }, [user?.id])

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  function toggleType(type: string) {
    const next = new Set(typeFilter)
    if (next.has(type)) {
      if (next.size === 1) return // keep at least one active
      next.delete(type)
    } else {
      next.add(type)
    }
    setTypeFilter(next)
  }

  const filtered = sessions.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (!typeFilter.has(s.type)) return false
    if (dateFrom && s.startedAt < dateFrom) return false
    if (dateTo && s.startedAt > dateTo + 'T23:59:59Z') return false
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Page heading */}
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 4px' }}>
          My Sessions
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
          {sessions.length} total session{sessions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Status pills + date range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Status pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flexShrink: 0 }}>
            {STATUS_PILLS.map(pill => (
              <button
                key={pill.key}
                onClick={() => setStatusFilter(pill.key)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 500,
                  border: `1px solid ${statusFilter === pill.key ? '#C9A84C' : '#1E2D45'}`,
                  background: statusFilter === pill.key ? 'rgba(201,168,76,0.1)' : 'transparent',
                  color: statusFilter === pill.key ? '#C9A84C' : '#8B9BB4',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Date range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={{
                background: '#131929', border: '1px solid #1E2D45', borderRadius: '8px',
                padding: '6px 10px', color: '#F0F4FF', fontSize: '12px', outline: 'none',
                colorScheme: 'dark',
              }}
            />
            <span style={{ color: '#4B5563', fontSize: '12px' }}>to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={{
                background: '#131929', border: '1px solid #1E2D45', borderRadius: '8px',
                padding: '6px 10px', color: '#F0F4FF', fontSize: '12px', outline: 'none',
                colorScheme: 'dark',
              }}
            />
          </div>
        </div>

        {/* Session type toggles */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['chat', 'audio', 'video'] as const).map(type => {
            const active = typeFilter.has(type)
            const tStyle = TYPE_COLORS[type]
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '5px 12px', borderRadius: '8px', fontSize: '12px',
                  border: `1px solid ${active ? tStyle.color : '#1E2D45'}`,
                  background: active ? tStyle.bg : 'transparent',
                  color: active ? tStyle.color : '#4B5563',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {type === 'video' ? <Video size={12} /> : type === 'audio' ? <Mic size={12} /> : <MessageCircle size={12} />}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Session list ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <MessageCircle size={48} style={{ color: '#1E2D45', margin: '0 auto 16px' }} />
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#F0F4FF', margin: '0 0 8px' }}>
            No sessions found
          </h3>
          <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 20px' }}>
            Start your first session by connecting with an advisor
          </p>
          <Link
            to="/"
            style={{
              background: '#C9A84C', color: '#0B0F1A', borderRadius: '10px',
              padding: '10px 24px', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
            }}
          >
            Find an Advisor
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              expanded={expandedId === session.id}
              onToggle={() => setExpandedId(expandedId === session.id ? null : String(session.id))}
              onRate={() => setRatingSession(session)}
            />
          ))}
        </div>
      )}

      {/* Rating modal */}
      {ratingSession && (
        <RatingModal
          session={ratingSession}
          onClose={() => setRatingSession(null)}
          onSubmit={() => {
            setRatingSession(null)
            showToast('Thank you for your review! ✨')
          }}
        />
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}
