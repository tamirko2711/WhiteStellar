import { useState, useEffect } from 'react'
import { MessageCircle, Mic, Video, ChevronDown, ChevronUp, FileText, X } from 'lucide-react'
import { format } from 'date-fns'
import { SESSIONS, CLIENTS, getSessionsByAdvisor, type Session } from '../../../data/advisors'
import Toast from '../../../components/Toast'
import { useAuthStore } from '../../../store/authStore'
import { getAdvisorSessions } from '../../../lib/api/sessions'
import { getAdvisorByUserId } from '../../../lib/api/advisorProfile'

interface RealSession {
  id: number
  type: 'chat' | 'audio' | 'video'
  client_name: string
  price_per_minute: number
  duration_minutes: number | null
  total_cost: number | null
  status: string
  started_at: string
  ended_at: string | null
}

// ─── Constants ────────────────────────────────────────────────

const ADVISOR_ID    = 1
const ADV_SESSIONS  = getSessionsByAdvisor(ADVISOR_ID)
  .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  chat:  { bg: 'rgba(45,212,191,0.12)',  color: '#2DD4BF' },
  audio: { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B' },
  video: { bg: 'rgba(139,92,246,0.12)',  color: '#8B5CF6' },
}

type StatusKey = 'all' | 'completed' | 'cancelled' | 'in_progress'

const STATUS_PILLS: { key: StatusKey; label: string }[] = [
  { key: 'all', label: 'All' }, { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' }, { key: 'in_progress', label: 'In Progress' },
]

// ─── Notes Modal ──────────────────────────────────────────────

function NotesModal({
  session, existingNote, onSave, onClose,
}: {
  session: Session; existingNote: string; onSave: (note: string) => void; onClose: () => void
}) {
  const [note, setNote] = useState(existingNote)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    onSave(note)
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
          background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '18px',
          width: '460px', maxWidth: 'calc(100vw - 32px)', padding: '28px',
          position: 'relative', animation: 'noteModalIn 0.2s ease both',
        }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563' }}>
          <X size={18} />
        </button>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#F0F4FF', margin: '0 0 4px' }}>
          Session Notes
        </h2>
        <p style={{ color: '#8B9BB4', fontSize: '12px', margin: '0 0 4px' }}>
          {session.clientName} · {format(new Date(session.startedAt), 'MMM d, yyyy')}
        </p>
        <p style={{ color: '#4B5563', fontSize: '11px', margin: '0 0 16px', fontStyle: 'italic' }}>
          Private notes — only visible to you
        </p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value.slice(0, 1000))}
          placeholder="Add your private notes about this session..."
          rows={6}
          style={{
            width: '100%', background: '#131929', border: '1px solid #1E2D45', borderRadius: '10px',
            padding: '12px', color: '#F0F4FF', fontSize: '14px', outline: 'none',
            resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '6px',
          }}
        />
        <p style={{ textAlign: 'right', fontSize: '11px', color: '#4B5563', margin: '0 0 16px' }}>
          {note.length}/1000
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{
            flex: 1, background: 'transparent', border: '1px solid #1E2D45',
            color: '#8B9BB4', borderRadius: '10px', padding: '10px', cursor: 'pointer', fontSize: '14px',
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{
            flex: 2, background: '#C9A84C', color: '#0B0F1A', borderRadius: '10px',
            padding: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '14px',
          }}>
            {saving ? 'Saving…' : 'Save Note'}
          </button>
        </div>
        <style>{`@keyframes noteModalIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
      </div>
    </div>
  )
}

// ─── Session card ─────────────────────────────────────────────

function SessionCard({ session, expanded, onToggle, onNote, hasNote }: {
  session: Session; expanded: boolean; onToggle: () => void; onNote: () => void; hasNote: boolean
}) {
  const client    = CLIENTS.find(c => c.id === session.clientId)
  const typeStyle = TYPE_COLORS[session.type]
  const isCompleted = session.status === 'completed'
  const net = +(session.totalCost * 0.7).toFixed(2)

  return (
    <div style={{ background: '#131929', border: '1px solid #1E2D45', borderRadius: '14px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '14px', padding: '16px 18px', flexWrap: 'wrap', alignItems: 'center' }}>

        {/* Left: client info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 200px', minWidth: 0 }}>
          <img src={client?.avatar} alt={session.clientName}
            style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, color: '#F0F4FF', fontSize: '14px', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session.clientName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px',
                background: typeStyle.bg, color: typeStyle.color,
                borderRadius: '20px', padding: '1px 7px', fontSize: '11px', fontWeight: 600 }}>
                {session.type === 'video' ? <Video size={10} /> : session.type === 'audio' ? <Mic size={10} /> : <MessageCircle size={10} />}
                {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
              </span>
              <span style={{ color: '#4B5563', fontSize: '11px' }}>
                {format(new Date(session.startedAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: duration + earnings */}
        <div style={{ flex: '0 1 140px', textAlign: 'center' }}>
          <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px', margin: '0 0 1px' }}>
            {session.durationMinutes > 0 ? `${session.durationMinutes} min` : '—'}
          </p>
          <p style={{ color: '#8B9BB4', fontSize: '11px', margin: '0 0 1px' }}>
            ${session.pricePerMinute.toFixed(2)}/min
          </p>
          <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '14px', margin: 0 }}>
            +${net > 0 ? net : '0.00'}
          </p>
        </div>

        {/* Right: status + actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
            background: isCompleted ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: isCompleted ? '#22C55E' : '#EF4444',
          }}>
            {isCompleted ? 'Completed' : 'Cancelled'}
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button onClick={onToggle} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid #1E2D45',
              color: '#8B9BB4', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer',
            }}>
              View Details {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
            <button onClick={onNote} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: hasNote ? 'rgba(201,168,76,0.08)' : 'transparent',
              border: `1px solid ${hasNote ? 'rgba(201,168,76,0.4)' : '#1E2D45'}`,
              color: hasNote ? '#C9A84C' : '#8B9BB4',
              borderRadius: '8px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer',
            }}>
              <FileText size={11} />
              {hasNote ? 'Edit Note' : 'Add Note'}
            </button>
          </div>
        </div>
      </div>

      {/* Accordion */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1E2D45', padding: '16px 18px', background: 'rgba(255,255,255,0.015)' }}>
          <p style={{ fontSize: '11px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: '0 0 10px' }}>Session Notes</p>
          {session.notes ? (
            <p style={{ color: '#8B9BB4', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{session.notes}</p>
          ) : (
            <p style={{ color: '#4B5563', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>No session notes yet. Click "Add Note" to add private notes.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Real session card (real users) ───────────────────────────

function RealSessionCard({ session }: { session: RealSession }) {
  const typeStyle = TYPE_COLORS[session.type] ?? TYPE_COLORS.chat
  const clientName = session.client_name || 'Client'
  const net = session.duration_minutes && session.price_per_minute
    ? +((session.duration_minutes * session.price_per_minute) * 0.7).toFixed(2)
    : 0
  const isCompleted = session.status === 'completed'

  return (
    <div style={{ background: '#131929', border: '1px solid #1E2D45', borderRadius: '14px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '14px', padding: '16px 18px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 200px', minWidth: 0 }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg,#1E2D45,#131929)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '16px' }}>{clientName[0]}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, color: '#F0F4FF', fontSize: '14px', margin: '0 0 2px' }}>{clientName}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px',
                background: typeStyle.bg, color: typeStyle.color,
                borderRadius: '20px', padding: '1px 7px', fontSize: '11px', fontWeight: 600 }}>
                {session.type === 'video' ? <Video size={10} /> : session.type === 'audio' ? <Mic size={10} /> : <MessageCircle size={10} />}
                {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
              </span>
              <span style={{ color: '#4B5563', fontSize: '11px' }}>
                {format(new Date(session.started_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        <div style={{ flex: '0 1 140px', textAlign: 'center' }}>
          <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px', margin: '0 0 1px' }}>
            {session.duration_minutes ? `${session.duration_minutes} min` : '—'}
          </p>
          <p style={{ color: '#8B9BB4', fontSize: '11px', margin: '0 0 1px' }}>
            ${session.price_per_minute.toFixed(2)}/min
          </p>
          <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '14px', margin: 0 }}>
            {net > 0 ? `+$${net}` : '—'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
            background: isCompleted ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: isCompleted ? '#22C55E' : '#EF4444',
          }}>
            {isCompleted ? 'Completed' : 'Cancelled'}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Sessions page ────────────────────────────────────────────

export default function AdvisorSessions() {
  const { user } = useAuthStore()
  const isRealUser = !!(user && !user.id.startsWith('dev-'))

  const [realSessions, setRealSessions]   = useState<RealSession[]>([])
  const [loadingReal, setLoadingReal]     = useState(false)

  const [statusFilter, setStatusFilter] = useState<StatusKey>('all')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')
  const [typeFilter, setTypeFilter]     = useState<Set<string>>(new Set(['chat', 'audio', 'video']))
  const [expandedId, setExpandedId]     = useState<number | null>(null)
  const [noteModal, setNoteModal]       = useState<Session | null>(null)
  const [notes, setNotes]               = useState<Record<number, string>>({
    1001: SESSIONS.find(s => s.id === 1001)?.notes ?? '',
  })
  const [toast, setToast] = useState({ msg: '', visible: false })

  useEffect(() => {
    if (!isRealUser || !user) return
    setLoadingReal(true)
    getAdvisorByUserId(user.id)
      .then(rec => rec ? getAdvisorSessions(rec.id) : [])
      .then(data => setRealSessions(data as RealSession[]))
      .catch(console.error)
      .finally(() => setLoadingReal(false))
  }, [isRealUser, user?.id])

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  function toggleType(type: string) {
    const next = new Set(typeFilter)
    if (next.has(type)) { if (next.size === 1) return; next.delete(type) }
    else next.add(type)
    setTypeFilter(next)
  }

  const filtered = ADV_SESSIONS.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (!typeFilter.has(s.type)) return false
    if (dateFrom && s.startedAt < dateFrom) return false
    if (dateTo && s.startedAt > dateTo + 'T23:59:59Z') return false
    return true
  })

  // ── Real user view ──────────────────────────────────────────
  if (isRealUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 4px' }}>
            My Sessions
          </h1>
          <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
            {loadingReal ? 'Loading…' : `${realSessions.length} completed session${realSessions.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loadingReal ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid #1E2D45', borderTopColor: '#C9A84C',
              borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : realSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <MessageCircle size={40} style={{ color: '#1E2D45', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: '#8B9BB4', fontSize: '15px', margin: '0 0 6px', fontWeight: 600 }}>No sessions yet</p>
            <p style={{ color: '#4B5563', fontSize: '13px', margin: 0 }}>
              Completed sessions will appear here once clients join your live sessions.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {realSessions.map(s => (
              <RealSessionCard key={s.id} session={s} />
            ))}
          </div>
        )}

        <Toast message={toast.msg} visible={toast.visible} />
      </div>
    )
  }

  // ── Dev mode view ───────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 4px' }}>
          My Sessions
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
          {ADV_SESSIONS.length} total session{ADV_SESSIONS.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '7px' }}>
            {STATUS_PILLS.map(pill => (
              <button key={pill.key} onClick={() => setStatusFilter(pill.key)} style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                border: `1px solid ${statusFilter === pill.key ? '#C9A84C' : '#1E2D45'}`,
                background: statusFilter === pill.key ? 'rgba(201,168,76,0.1)' : 'transparent',
                color: statusFilter === pill.key ? '#C9A84C' : '#8B9BB4',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>{pill.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ background: '#131929', border: '1px solid #1E2D45', borderRadius: '8px',
                padding: '5px 8px', color: '#F0F4FF', fontSize: '12px', outline: 'none', colorScheme: 'dark' }} />
            <span style={{ color: '#4B5563', fontSize: '12px', alignSelf: 'center' }}>to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ background: '#131929', border: '1px solid #1E2D45', borderRadius: '8px',
                padding: '5px 8px', color: '#F0F4FF', fontSize: '12px', outline: 'none', colorScheme: 'dark' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['chat', 'audio', 'video'] as const).map(type => {
            const active = typeFilter.has(type)
            const tStyle = TYPE_COLORS[type]
            return (
              <button key={type} onClick={() => toggleType(type)} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '4px 10px', borderRadius: '8px', fontSize: '12px',
                border: `1px solid ${active ? tStyle.color : '#1E2D45'}`,
                background: active ? tStyle.bg : 'transparent',
                color: active ? tStyle.color : '#4B5563', cursor: 'pointer',
              }}>
                {type === 'video' ? <Video size={11} /> : type === 'audio' ? <Mic size={11} /> : <MessageCircle size={11} />}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Session list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <MessageCircle size={40} style={{ color: '#1E2D45', margin: '0 auto 12px' }} />
          <p style={{ color: '#8B9BB4', fontSize: '14px' }}>No sessions found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              expanded={expandedId === session.id}
              onToggle={() => setExpandedId(expandedId === session.id ? null : session.id)}
              onNote={() => setNoteModal(session)}
              hasNote={!!notes[session.id]}
            />
          ))}
        </div>
      )}

      {/* Load more (UI only) */}
      {filtered.length > 0 && (
        <div style={{ textAlign: 'center' }}>
          <button style={{
            background: 'transparent', border: '1px solid rgba(201,168,76,0.4)',
            color: '#C9A84C', borderRadius: '10px', padding: '10px 28px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}>
            Load more
          </button>
        </div>
      )}

      {noteModal && (
        <NotesModal
          session={noteModal}
          existingNote={notes[noteModal.id] ?? ''}
          onSave={note => {
            setNotes(prev => ({ ...prev, [noteModal.id]: note }))
            setNoteModal(null)
            showToast('Note saved ✨')
          }}
          onClose={() => setNoteModal(null)}
        />
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}
