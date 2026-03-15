// ============================================================
// WhiteStellar — Advisor Client Info Panel (shown during sessions)
// src/components/session/AdvisorClientPanel.tsx
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronDown, ChevronUp, User, Clock, Notebook, History } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'

// ─── Zodiac helper ────────────────────────────────────────────

function getZodiac(dob: string): { sign: string; symbol: string } {
  const d = new Date(dob + 'T00:00:00')
  const m = d.getMonth() + 1
  const day = d.getDate()
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return { sign: 'Aries', symbol: '♈' }
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return { sign: 'Taurus', symbol: '♉' }
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return { sign: 'Gemini', symbol: '♊' }
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return { sign: 'Cancer', symbol: '♋' }
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return { sign: 'Leo', symbol: '♌' }
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return { sign: 'Virgo', symbol: '♍' }
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return { sign: 'Libra', symbol: '♎' }
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return { sign: 'Scorpio', symbol: '♏' }
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return { sign: 'Sagittarius', symbol: '♐' }
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return { sign: 'Capricorn', symbol: '♑' }
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return { sign: 'Aquarius', symbol: '♒' }
  return { sign: 'Pisces', symbol: '♓' }
}

// ─── Tier helper ──────────────────────────────────────────────

type Tier = 'New' | 'Silver' | 'Gold'

function getClientTier(count: number, lastIso: string | null): Tier {
  if (count <= 2) return 'New'
  if (!lastIso) return 'Silver'
  const daysSince = (Date.now() - new Date(lastIso).getTime()) / (86400 * 1000)
  return daysSince <= 7 ? 'Gold' : 'Silver'
}

const TIER_STYLE: Record<Tier, { bg: string; color: string; border: string }> = {
  New:    { bg: 'rgba(59,130,246,0.12)',  color: '#60A5FA', border: 'rgba(59,130,246,0.3)' },
  Silver: { bg: 'rgba(148,163,184,0.12)', color: '#CBD5E1', border: 'rgba(148,163,184,0.3)' },
  Gold:   { bg: 'rgba(201,168,76,0.12)',  color: '#C9A84C', border: 'rgba(201,168,76,0.35)' },
}

// ─── Section wrapper ──────────────────────────────────────────

function Section({
  icon, title, open, onToggle, children,
}: {
  icon: React.ReactNode; title: string; open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div style={{ borderBottom: '1px solid #1A2235' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', background: 'none', border: 'none',
          cursor: 'pointer', padding: '10px 14px',
        }}
      >
        <span style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: '#8B9BB4',
        }}>
          {icon}
          {title}
        </span>
        {open
          ? <ChevronUp size={13} color="#4B5563" />
          : <ChevronDown size={13} color="#4B5563" />}
      </button>
      {open && (
        <div style={{ padding: '0 14px 12px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Avatar circle ────────────────────────────────────────────

function AvatarCircle({ src, name, size }: { src?: string | null; name: string; size: number }) {
  const isValid = typeof src === 'string' && src.trim().length > 0
  const initial = (name || '?').trim()[0].toUpperCase()
  const shared: React.CSSProperties = { width: size, height: size, borderRadius: '50%', flexShrink: 0 }
  if (isValid) {
    return <img src={src!} alt={name} style={{ ...shared, objectFit: 'cover', border: '2px solid #C9A84C' }} />
  }
  return (
    <div style={{ ...shared, border: '2px solid #C9A84C', background: '#1A2C45', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: Math.round(size * 0.42) }}>{initial}</span>
    </div>
  )
}

// ─── Detail row ───────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
      <span style={{ fontSize: '10px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
        {label}
      </span>
      <span style={{ fontSize: '13px', color: '#F0F4FF', fontWeight: 500 }}>
        {value}
      </span>
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────

interface ClientProfile {
  full_name: string
  avatar_url: string | null
  date_of_birth: string | null
  time_of_birth: string | null
  place_of_birth: string | null
}

interface SessionRow {
  id: number
  started_at: string
  duration_minutes: number | null
  total_cost: number | null
  type: string
}

// ─── Main component ───────────────────────────────────────────

interface Props {
  clientId: string
  clientName: string
  clientAvatar: string
  advisorId: number
  onEndSession: () => void
}

export default function AdvisorClientPanel({ clientId, clientName, clientAvatar, advisorId, onEndSession }: Props) {
  const { user } = useAuthStore()

  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [notesLoading, setNotesLoading] = useState(true)

  const [showBirth, setShowBirth]           = useState(true)
  const [showHistory, setShowHistory]       = useState(true)
  const [showLastSession, setShowLastSession] = useState(false)
  const [showNotes, setShowNotes]           = useState(true)
  const [showDates, setShowDates]           = useState(false)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch client profile ──────────────────────────────────────
  useEffect(() => {
    supabase
      .from('profiles')
      .select('full_name, avatar_url, date_of_birth, time_of_birth, place_of_birth')
      .eq('id', clientId)
      .single()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any }) => { if (data) setProfile(data) })
  }, [clientId])

  // ── Fetch session history ─────────────────────────────────────
  useEffect(() => {
    supabase
      .from('sessions')
      .select('id, started_at, duration_minutes, total_cost, type')
      .eq('advisor_id', advisorId)
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any[] | null }) => { if (data) setSessions(data) })
  }, [advisorId, clientId])

  // ── Fetch advisor notes ───────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return
    setNotesLoading(true)
    supabase
      .from('advisor_client_notes')
      .select('notes')
      .eq('advisor_id', user.id)
      .eq('client_id', clientId)
      .maybeSingle()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: { data: any }) => {
        setNotes(data?.notes ?? '')
        setNotesLoading(false)
      })
  }, [user?.id, clientId])

  // ── Auto-save notes with 800ms debounce ──────────────────────
  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setNotes(value)
    setNotesSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      if (!user?.id) return
      await supabase
        .from('advisor_client_notes')
        .upsert(
          { advisor_id: user.id, client_id: clientId, notes: value, updated_at: new Date().toISOString() },
          { onConflict: 'advisor_id,client_id' }
        )
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    }, 800)
  }, [user?.id, clientId])

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current) }, [])

  // ── Derived values ────────────────────────────────────────────
  const zodiac     = profile?.date_of_birth ? getZodiac(profile.date_of_birth) : null
  const lastSess   = sessions[0] ?? null
  const tier       = getClientTier(sessions.length, lastSess?.started_at ?? null)
  const tierStyle  = TIER_STYLE[tier]

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }
  function formatDOB(iso: string) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  function formatTime12(t: string) {
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${((h % 12) || 12)}:${String(m).padStart(2, '0')} ${ampm}`
  }
  function formatDuration(mins: number | null) {
    if (!mins) return '—'
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
  }
  function sessionTypeLabel(type: string) {
    return type === 'chat' ? '💬 Chat' : type === 'audio' ? '🎙 Audio' : '📹 Video'
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Client header ── */}
      <div style={{ padding: '48px 14px 14px', borderBottom: '1px solid #1A2235', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AvatarCircle src={clientAvatar} name={clientName} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '14px', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {clientName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {/* Tier badge */}
              <span style={{
                fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                background: tierStyle.bg, color: tierStyle.color, border: `1px solid ${tierStyle.border}`,
              }}>
                {tier === 'Gold' ? '★ ' : ''}{tier}
              </span>
              {/* Zodiac badge */}
              {zodiac && (
                <span style={{
                  fontSize: '11px', color: '#8B9BB4', fontStyle: 'italic',
                }}>
                  {zodiac.symbol} {zodiac.sign}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable sections ── */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#1A2235 transparent' }}>

        {/* ── Birth Details ── */}
        <Section icon={<User size={11} />} title="Birth Details" open={showBirth} onToggle={() => setShowBirth(o => !o)}>
          {profile?.date_of_birth ? (
            <>
              <DetailRow label="Date of Birth" value={formatDOB(profile.date_of_birth)} />
              {profile.time_of_birth && (
                <DetailRow label="Time of Birth" value={formatTime12(profile.time_of_birth)} />
              )}
              {profile.place_of_birth && (
                <DetailRow label="Place of Birth" value={profile.place_of_birth} />
              )}
              {zodiac && (
                <DetailRow label="Sun Sign" value={`${zodiac.symbol} ${zodiac.sign}`} />
              )}
            </>
          ) : (
            <p style={{ color: '#4B5563', fontSize: '12px', fontStyle: 'italic', margin: 0 }}>
              No birth details on file
            </p>
          )}
        </Section>

        {/* ── Session History ── */}
        <Section icon={<History size={11} />} title="Session History" open={showHistory} onToggle={() => setShowHistory(o => !o)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ textAlign: 'center', flex: 1, background: '#0B0F1A', borderRadius: '8px', padding: '8px 4px' }}>
              <p style={{ color: '#C9A84C', fontWeight: 800, fontSize: '22px', margin: 0 }}>{sessions.length}</p>
              <p style={{ color: '#4B5563', fontSize: '10px', fontWeight: 600, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sessions</p>
            </div>
            <div style={{ textAlign: 'center', flex: 1, background: '#0B0F1A', borderRadius: '8px', padding: '8px 4px' }}>
              <p style={{ color: tierStyle.color, fontWeight: 800, fontSize: '16px', margin: 0 }}>{tier}</p>
              <p style={{ color: '#4B5563', fontSize: '10px', fontWeight: 600, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tier</p>
            </div>
          </div>

          {sessions.length > 0 && (
            <>
              <button
                onClick={() => setShowDates(o => !o)}
                style={{
                  background: 'none', border: '1px solid #1A2235', borderRadius: '6px',
                  color: '#8B9BB4', fontSize: '11px', cursor: 'pointer', padding: '5px 10px',
                  display: 'flex', alignItems: 'center', gap: '4px', width: '100%',
                  justifyContent: 'center',
                }}
              >
                {showDates ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showDates ? 'Hide' : 'View'} Past Sessions
              </button>

              {showDates && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {sessions.map(s => (
                    <div
                      key={s.id}
                      style={{
                        background: '#0B0F1A', borderRadius: '6px', padding: '7px 10px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      <div>
                        <p style={{ color: '#F0F4FF', fontSize: '11px', margin: 0, fontWeight: 600 }}>
                          {formatDate(s.started_at)}
                        </p>
                        <p style={{ color: '#4B5563', fontSize: '10px', margin: '1px 0 0' }}>
                          {sessionTypeLabel(s.type)} · {formatDuration(s.duration_minutes)}
                        </p>
                      </div>
                      {s.total_cost != null && (
                        <span style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 700 }}>
                          ${s.total_cost.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {sessions.length === 0 && (
            <p style={{ color: '#4B5563', fontSize: '12px', fontStyle: 'italic', margin: 0, marginTop: '4px' }}>
              First session together
            </p>
          )}
        </Section>

        {/* ── Last Session Summary ── */}
        {lastSess && (
          <Section icon={<Clock size={11} />} title="Last Session" open={showLastSession} onToggle={() => setShowLastSession(o => !o)}>
            <DetailRow label="Date" value={formatDate(lastSess.started_at)} />
            <DetailRow label="Type" value={sessionTypeLabel(lastSess.type)} />
            <DetailRow label="Duration" value={formatDuration(lastSess.duration_minutes)} />
            {lastSess.total_cost != null && (
              <DetailRow label="Cost" value={`$${lastSess.total_cost.toFixed(2)}`} />
            )}
          </Section>
        )}

        {/* ── Advisor Notes ── */}
        <Section icon={<Notebook size={11} />} title="My Notes" open={showNotes} onToggle={() => setShowNotes(o => !o)}>
          <p style={{ color: '#4B5563', fontSize: '10px', margin: '0 0 6px', lineHeight: 1.5 }}>
            Private — only you can see these
          </p>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            disabled={notesLoading}
            placeholder={notesLoading ? 'Loading…' : 'Add notes about this client…'}
            rows={5}
            style={{
              width: '100%', background: '#0B0F1A', border: '1px solid #1A2235',
              borderRadius: '8px', padding: '8px 10px', color: '#F0F4FF',
              fontSize: '12px', resize: 'vertical', outline: 'none',
              lineHeight: 1.55, fontFamily: 'inherit', boxSizing: 'border-box',
              opacity: notesLoading ? 0.5 : 1,
              minHeight: '90px',
            }}
          />
          <p style={{
            color: notesSaved ? '#22C55E' : '#4B5563',
            fontSize: '10px', margin: '4px 0 0', textAlign: 'right',
            transition: 'color 0.3s',
          }}>
            {notesSaved ? '✓ Saved' : 'Auto-saved'}
          </p>
        </Section>

      </div>

      {/* ── End Session button ── */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #1A2235', flexShrink: 0 }}>
        <button
          onClick={onEndSession}
          style={{
            width: '100%', padding: '11px',
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
            color: '#EF4444', borderRadius: '10px',
            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
          }}
        >
          End Session
        </button>
      </div>

    </div>
  )
}
