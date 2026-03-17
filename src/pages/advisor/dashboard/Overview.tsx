import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Radio, DollarSign, Calendar, MessageCircle, Star, Video, Mic, CheckCircle, XCircle, X, Sparkles } from 'lucide-react'
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { ADVISORS, CLIENTS, REVENUE_GRAPH_DATA, getSessionsByAdvisor } from '../../../data/advisors'
import { useAuthStore } from '../../../store/authStore'
import { useAdvisorStore } from '../../../store/advisorStore'
import { useSessionStore } from '../../../store/sessionStore'
import type { ChatMessage } from '../../../store/sessionStore'
import Toast from '../../../components/Toast'
import {
  createLiveSession, getAdvisorActiveSessions, endLiveSession,
  type LiveSession,
} from '../../../lib/api/liveSessions'
import { getAdvisorByUserId, type AdvisorRecord } from '../../../lib/api/advisorProfile'
import { updateSessionStatus } from '../../../lib/api/sessions'
import { supabase } from '../../../lib/supabase'

// ─── Constants ────────────────────────────────────────────────

const ADVISOR_ID   = 1
const ADVISOR_DATA = ADVISORS.find(a => a.id === ADVISOR_ID)!
const ADV_SESSIONS = getSessionsByAdvisor(ADVISOR_ID)
  .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())

const AVAIL_CYCLE: Record<string, 'online' | 'busy' | 'offline'> = {
  online: 'busy', busy: 'offline', offline: 'online',
}

const AVAIL_CONFIG = {
  online:  { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  label: 'Available' },
  busy:    { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: 'Busy'      },
  offline: { color: '#4B5563', bg: 'rgba(75,85,99,0.12)',   border: 'rgba(75,85,99,0.3)',   label: 'Offline'   },
}

const FAKE_CLIENT = CLIENTS[0] // Sarah Mitchell for incoming request simulation

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  chat:  { bg: 'rgba(45,212,191,0.12)',  color: '#2DD4BF' },
  audio: { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B' },
  video: { bg: 'rgba(139,92,246,0.12)',  color: '#8B5CF6' },
}

const INTENT_CONFIG = {
  high:   { color: '#2DD4BF', bg: 'rgba(45,212,191,0.1)',   border: 'rgba(45,212,191,0.4)',  label: '⚡ High Intent'   },
  medium: { color: '#C9A84C', bg: 'rgba(201,168,76,0.1)',   border: 'rgba(201,168,76,0.4)',  label: '✦ Medium Intent' },
  low:    { color: '#8B9BB4', bg: 'rgba(139,155,180,0.08)', border: 'rgba(30,45,69,0.8)',    label: '○ Low Intent'    },
} as const

// Demo prescreen brief shown when test request fires
const DEMO_PRESCREEN_BRIEF = {
  intentScore: 'high' as const,
  scoreReasoning: 'Client shared detailed situation about a relationship. Emotionally invested and asking specific questions.',
  recommendedOpening: "I can feel the weight you've been carrying around this relationship — let's explore what the energy is telling us together.",
  conversationTranscript: [
    { role: 'user', content: "I've been in a relationship for 2 years and things have been really rocky lately. My partner seems distant and I'm not sure if we have a future together." },
    { role: 'user', content: "I really need some guidance on whether I should stay or move on. It's been affecting my sleep and work." },
    { role: 'user', content: "I feel like there's still something there but I'm scared of wasting more time if it's not meant to be." },
  ],
}

// ─── Stat card ────────────────────────────────────────────────

function StatCard({ icon, value, label, sublabel, iconColor }: {
  icon: React.ReactNode; value: string; label: string; sublabel: string; iconColor: string
}) {
  return (
    <div style={{
      background: '#131929', border: '1px solid #1E2D45', borderRadius: '12px',
      padding: '20px', position: 'relative', flex: 1, minWidth: 0,
    }}>
      <div style={{ position: 'absolute', top: '16px', right: '16px', color: iconColor }}>
        {icon}
      </div>
      <p style={{ fontSize: '26px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 4px', lineHeight: 1.1 }}>{value}</p>
      <p style={{ fontSize: '13px', fontWeight: 500, color: '#F0F4FF', margin: '0 0 2px' }}>{label}</p>
      <p style={{ fontSize: '11px', color: '#4B5563', margin: 0 }}>{sublabel}</p>
    </div>
  )
}

// ─── Overview page ────────────────────────────────────────────

export default function AdvisorOverview() {
  const { user } = useAuthStore()
  const {
    availability, setAvailability,
    incomingSession, countdown, setIncomingSession, clearIncomingSession,
  } = useAdvisorStore()
  const showIncoming = incomingSession !== null
  const { startSession, setActive, addMessage } = useSessionStore()
  const navigate = useNavigate()

  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [showBrief, setShowBrief] = useState(false)
  const [toast, setToast] = useState({ msg: '', visible: false })

  // Show brief panel whenever a new incoming session arrives
  useEffect(() => { if (incomingSession) setShowBrief(true) }, [incomingSession?.id])

  const isRealUser = user && !user.id.startsWith('dev-')

  // ── Real advisor record from Supabase ──
  const [advisorRecord, setAdvisorRecord] = useState<AdvisorRecord | null>(null)
  useEffect(() => {
    if (!isRealUser) return
    const fetch = () => getAdvisorByUserId(user!.id).then(setAdvisorRecord)
    fetch()
    // Re-fetch when advisor switches back to this tab (picks up updated rating/review_count)
    const onVisibility = () => { if (!document.hidden) fetch() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [isRealUser, user?.id])

  // ── Earnings from completed sessions ──
  const [earnings, setEarnings] = useState({ today: 0, thisMonth: 0 })
  const [earningsChartData, setEarningsChartData] = useState<{ day: string; revenue: number }[]>([])
  useEffect(() => {
    if (!isRealUser || !advisorRecord) return
    supabase
      .from('sessions')
      .select('total_cost, started_at')
      .eq('advisor_id', advisorRecord.id)
      .eq('status', 'completed')
      .then(({ data }) => {
        if (!data) return
        const now2 = new Date()
        const todayStart = new Date(now2); todayStart.setHours(0, 0, 0, 0)
        const monthStart = new Date(now2.getFullYear(), now2.getMonth(), 1)
        let today = 0, thisMonth = 0
        data.forEach(s => {
          const amt = (s.total_cost ?? 0) * 0.7
          const d = new Date(s.started_at)
          if (d >= todayStart) today += amt
          if (d >= monthStart) thisMonth += amt
        })
        setEarnings({ today: +today.toFixed(2), thisMonth: +thisMonth.toFixed(2) })
        // Build daily chart data for current month
        const daysInMonth = new Date(now2.getFullYear(), now2.getMonth() + 1, 0).getDate()
        const dailyMap: Record<number, number> = {}
        data.forEach(s => {
          const d = new Date(s.started_at)
          if (d.getFullYear() === now2.getFullYear() && d.getMonth() === now2.getMonth()) {
            const day = d.getDate()
            dailyMap[day] = (dailyMap[day] ?? 0) + (s.total_cost ?? 0) * 0.7
          }
        })
        setEarningsChartData(
          Array.from({ length: daysInMonth }, (_, i) => ({
            day: String(i + 1),
            revenue: +(dailyMap[i + 1] ?? 0).toFixed(2),
          }))
        )
      })
  }, [isRealUser, advisorRecord?.id])


  // ── Recent completed sessions ──
  const [recentSessions, setRecentSessions] = useState<Array<{
    id: number
    client_name: string
    type: string
    total_cost: number | null
    started_at: string
  }>>([])
  useEffect(() => {
    if (!isRealUser || !advisorRecord) return
    supabase
      .from('sessions')
      .select('id, client_name, type, total_cost, started_at')
      .eq('advisor_id', advisorRecord.id)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setRecentSessions(data ?? []))
  }, [isRealUser, advisorRecord?.id])

  // ── Live sessions (real Supabase) ──
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([])
  const [creatingSession, setCreatingSession] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!isRealUser) return
    getAdvisorActiveSessions(user!.id).then(setLiveSessions)
  }, [isRealUser, user?.id])

  async function handleCreateLiveSession() {
    if (!user) return
    setCreatingSession(true)
    try {
      const session = await createLiveSession(user.id, 'chat', 0)
      setLiveSessions(prev => [session, ...prev])
      showToast('Session created! Share the link with your client.')
    } catch {
      showToast('Failed to create session.')
    } finally {
      setCreatingSession(false)
    }
  }

  async function handleEndLiveSession(sessionId: string) {
    try {
      await endLiveSession(sessionId)
      setLiveSessions(prev => prev.filter(s => s.id !== sessionId))
      showToast('Session ended.')
    } catch {
      showToast('Failed to end session.')
    }
  }

  function copySessionLink(sessionId: string) {
    const url = `${window.location.origin}/session/live/${sessionId}`
    navigator.clipboard.writeText(url)
    setCopiedId(sessionId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }


  function handleAvailability() {
    const next = AVAIL_CYCLE[availability]
    setAvailability(next)
    if (next === 'online')  showToast('You are now visible to clients ✨')
    if (next === 'offline') showToast('You are now offline.')
  }

  const avail = AVAIL_CONFIG[availability]
  // For real users use their actual account_status; for Dev Mode use mock
  const isPending = isRealUser
    ? advisorRecord?.account_status === 'pending'
    : ADVISOR_DATA.accountStatus === 'pending'
  const totalSessions = isRealUser ? (advisorRecord?.total_sessions ?? 0) : ADVISOR_DATA.totalSessions
  const rating = isRealUser ? (advisorRecord?.rating ?? 0) : ADVISOR_DATA.rating
  const reviewCount = isRealUser ? (advisorRecord?.review_count ?? 0) : ADVISOR_DATA.reviewCount
  const profileLink = isRealUser && advisorRecord
    ? `/advisor/${advisorRecord.id}`
    : `/advisor/${ADVISOR_ID}`
  const timerDisplay = `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Pending account banner ── */}
      {isPending && !bannerDismissed && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '12px', padding: '14px 20px',
        }}>
          <p style={{ color: '#F59E0B', fontSize: '14px', margin: 0 }}>
            ⏳ Your account is under review. Our team will approve your profile within 48 hours.
          </p>
          <button
            onClick={() => setBannerDismissed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F59E0B', flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Welcome + status ── */}
      <div style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.07) 0%, #0D1221 65%)',
        border: '1px solid #1E2D45', borderRadius: '16px', padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 6px' }}>
            Welcome back, {user?.fullName?.split(' ')[0]} ✨
          </h1>
          <Link to={profileLink} style={{ color: '#C9A84C', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            View my public profile →
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <p style={{ fontSize: '11px', color: '#4B5563', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your status
          </p>
          <button
            onClick={handleAvailability}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: avail.bg, border: `1px solid ${avail.border}`,
              color: avail.color, borderRadius: '20px',
              padding: '8px 18px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <span style={{
              width: '9px', height: '9px', borderRadius: '50%', background: avail.color, flexShrink: 0,
              boxShadow: availability === 'online' ? `0 0 8px ${avail.color}` : 'none',
            }} />
            {avail.label}
            <span style={{ fontSize: '11px', opacity: 0.6 }}>click to change</span>
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={<DollarSign size={20} />} value={isRealUser ? `$${earnings.today.toFixed(2)}` : '$0.00'} label="Today's Earnings" sublabel="Updated live" iconColor="#C9A84C" />
        <StatCard icon={<Calendar size={20} />}   value={isRealUser ? `$${earnings.thisMonth.toFixed(2)}` : '$2,847.30'} label="This Month" sublabel={new Date().toLocaleString('default',{month:'long',year:'numeric'})} iconColor="#2DD4BF" />
        <StatCard icon={<MessageCircle size={20} />} value={String(totalSessions)} label="Total Sessions" sublabel="All time" iconColor="#8B5CF6" />
        <StatCard icon={<Star size={20} />} value={rating > 0 ? rating.toFixed(1) : '—'} label="Rating" sublabel={reviewCount > 0 ? `${reviewCount} reviews` : 'No reviews yet'} iconColor="#C9A84C" />
      </div>

      {/* ── Live session area ── */}
      <section style={{ background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
            Live Session
          </h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Real live session button (only for real Supabase users) */}
            {isRealUser && (
              <button
                onClick={handleCreateLiveSession}
                disabled={creatingSession}
                style={{
                  background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
                  border: 'none', color: '#0B0F1A',
                  borderRadius: '8px', padding: '6px 14px',
                  fontSize: '12px', fontWeight: 700,
                  cursor: creatingSession ? 'default' : 'pointer',
                  opacity: creatingSession ? 0.7 : 1,
                }}
              >
                {creatingSession ? 'Creating...' : '+ Start New Session'}
              </button>
            )}
            {/* Dev mode demo button */}
            {!isRealUser && (
              <button
                onClick={() => {
                  setIncomingSession({ id: 0, clientId: '', clientName: FAKE_CLIENT.fullName, sessionType: 'video', pricePerMinute: 5.99 })
                  setShowBrief(true)
                }}
                style={{
                  background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)',
                  color: '#C9A84C', borderRadius: '8px', padding: '5px 12px',
                  fontSize: '11px', cursor: 'pointer',
                }}
              >
                ⚡ Test Incoming Request
              </button>
            )}
          </div>
        </div>

        {/* ── Real live sessions list ── */}
        {isRealUser && liveSessions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {liveSessions.map(ls => (
              <div key={ls.id} style={{
                background: ls.status === 'active' ? 'rgba(34,197,94,0.05)' : 'rgba(201,168,76,0.05)',
                border: `1px solid ${ls.status === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(201,168,76,0.25)'}`,
                borderRadius: '12px', padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                      background: ls.status === 'active' ? '#22C55E' : '#F59E0B',
                    }} />
                    <span style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px' }}>
                      {ls.status === 'active' ? 'Active — client connected' : 'Waiting for client'}
                    </span>
                  </div>
                  <p style={{ color: '#4B5563', fontSize: '11px', margin: 0, fontFamily: 'monospace' }}>
                    {window.location.origin}/session/live/{ls.id.slice(0, 8)}...
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => copySessionLink(ls.id)}
                    style={{
                      background: copiedId === ls.id ? 'rgba(34,197,94,0.12)' : 'rgba(201,168,76,0.1)',
                      border: `1px solid ${copiedId === ls.id ? 'rgba(34,197,94,0.4)' : 'rgba(201,168,76,0.3)'}`,
                      color: copiedId === ls.id ? '#22C55E' : '#C9A84C',
                      borderRadius: '8px', padding: '5px 12px',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {copiedId === ls.id ? '✓ Copied' : 'Copy Link'}
                  </button>
                  <button
                    onClick={() => navigate(`/session/live/${ls.id}`)}
                    style={{
                      background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                      color: '#22C55E', borderRadius: '8px', padding: '5px 12px',
                      fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    Join →
                  </button>
                  <button
                    onClick={() => handleEndLiveSession(ls.id)}
                    style={{
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                      color: '#EF4444', borderRadius: '8px', padding: '5px 10px',
                      fontSize: '12px', cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showIncoming ? (() => {
          const dName  = isRealUser && incomingSession ? incomingSession.clientName   : FAKE_CLIENT.fullName
          const dType  = isRealUser && incomingSession ? incomingSession.sessionType  : 'video' as const
          const dPrice = isRealUser && incomingSession ? incomingSession.pricePerMinute : 5.99
          const tStyle = TYPE_COLORS[dType]
          const TIcon  = dType === 'video' ? Video : dType === 'audio' ? Mic : MessageCircle
          const tCap   = dType.charAt(0).toUpperCase() + dType.slice(1)
          return (
          /* ── Incoming request card ── */
          <div style={{
            background: 'rgba(201,168,76,0.05)', border: '2px solid #C9A84C',
            borderRadius: '14px', padding: '24px',
            animation: 'requestPulse 1.5s ease infinite',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {!isRealUser ? (
                <img src={FAKE_CLIENT.avatar} alt={dName}
                  style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #C9A84C' }} />
              ) : (
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #C9A84C',
                  background: 'linear-gradient(135deg,#1E2D45,#0B0F1A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '20px' }}>{dName[0]}</span>
                </div>
              )}
              <div>
                <p style={{ fontWeight: 700, color: '#F0F4FF', fontSize: '16px', margin: '0 0 4px' }}>
                  {dName} is requesting a {tCap} Session
                </p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px',
                  borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600,
                  background: tStyle.bg, color: tStyle.color }}>
                  <TIcon size={12} /> {tCap} · ${dPrice.toFixed(2)}/min
                </span>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <p style={{ color: '#EF4444', fontWeight: 700, fontSize: '20px', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {timerDisplay}
                </p>
                <p style={{ color: '#4B5563', fontSize: '11px', margin: 0 }}>auto-decline</p>
              </div>
            </div>

            {/* ── Pre-brief panel ── */}
            {showBrief && (() => {
              const cfg = INTENT_CONFIG[DEMO_PRESCREEN_BRIEF.intentScore]
              return (
                <div style={{
                  background: '#0B0F1A', border: `1px solid ${cfg.border}`,
                  borderRadius: '12px', padding: '18px', marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Sparkles size={15} color="#C9A84C" />
                    <p style={{ color: '#F0F4FF', fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '14px', margin: 0 }}>
                      Client Pre-Brief
                    </p>
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '4px 12px', borderRadius: '20px', marginBottom: '10px',
                    background: cfg.bg, border: `1px solid ${cfg.border}`,
                  }}>
                    <span style={{ color: cfg.color, fontWeight: 700, fontSize: '12px' }}>{cfg.label}</span>
                  </div>
                  <p style={{ color: '#8B9BB4', fontSize: '13px', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {DEMO_PRESCREEN_BRIEF.scoreReasoning}
                  </p>
                  <div style={{ background: '#131929', borderRadius: '8px', padding: '10px', marginBottom: '12px', maxHeight: '120px', overflowY: 'auto' }}>
                    <p style={{ color: '#4B5563', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                      What they shared
                    </p>
                    {DEMO_PRESCREEN_BRIEF.conversationTranscript.filter(m => m.role === 'user').map((m, i) => (
                      <p key={i} style={{ color: '#F0F4FF', fontSize: '12px', margin: '0 0 6px', lineHeight: 1.5 }}>
                        <span style={{ color: '#C9A84C', fontWeight: 600 }}>Client: </span>{m.content}
                      </p>
                    ))}
                  </div>
                  <div style={{
                    background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.25)',
                    borderRadius: '8px', padding: '10px 12px',
                  }}>
                    <p style={{ color: '#C9A84C', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
                      Suggested opening
                    </p>
                    <p style={{ color: '#F0F4FF', fontSize: '13px', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                      "{DEMO_PRESCREEN_BRIEF.recommendedOpening}"
                    </p>
                  </div>
                </div>
              )
            })()}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={async () => {
                  if (isRealUser && incomingSession) {
                    try { await updateSessionStatus(incomingSession.id, 'in_progress') } catch { showToast('Failed to accept.'); return }
                    // Fetch real client avatar from profiles
                    let clientAvatar = ''
                    try {
                      const { data: prof } = await supabase.from('profiles').select('avatar_url').eq('id', incomingSession.clientId).single()
                      clientAvatar = prof?.avatar_url ?? ''
                    } catch {}
                    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    const initMsgs: ChatMessage[] = [
                      { id: 'sys-0', senderId: 0, senderName: 'System', senderAvatar: '', text: 'Session started', timestamp: now, isSystem: true },
                    ]
                    startSession({
                      sessionType: incomingSession.sessionType,
                      clientId: incomingSession.clientId,
                      clientName: incomingSession.clientName,
                      clientAvatar,
                      advisorId: advisorRecord!.id,
                      advisorName: user!.fullName,
                      advisorAvatar: user!.avatar ?? '',
                      pricePerMinute: incomingSession.pricePerMinute,
                      walletBalance: 0,
                      isNewClient: false,
                      supabaseSessionId: incomingSession.id,
                    })
                    initMsgs.forEach(addMessage)
                    setActive()
                    clearIncomingSession(); setShowBrief(false)
                    showToast('Session accepted!')
                    const dest = incomingSession.sessionType === 'audio' ? '/session/audio' : incomingSession.sessionType === 'video' ? '/session/video' : '/session/chat'
                    navigate(dest)
                  } else {
                    // Dev mode
                    startSession({
                      sessionType: 'video',
                      clientId: String(FAKE_CLIENT.id),
                      clientName: FAKE_CLIENT.fullName,
                      clientAvatar: FAKE_CLIENT.avatar,
                      advisorId: ADVISOR_ID,
                      advisorName: ADVISOR_DATA.fullName,
                      advisorAvatar: ADVISOR_DATA.avatar,
                      pricePerMinute: 5.99,
                      walletBalance: 0,
                      isNewClient: false,
                    })
                    setActive()
                    clearIncomingSession(); setShowBrief(false)
                    showToast('Session accepted!')
                    navigate('/session/video')
                  }
                }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
                  color: '#22C55E', borderRadius: '12px', padding: '14px',
                  fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                <CheckCircle size={18} /> Accept ✓
              </button>
              <button
                onClick={async () => {
                  if (isRealUser && incomingSession) {
                    try { await updateSessionStatus(incomingSession.id, 'cancelled') } catch {}
                  }
                  clearIncomingSession(); setShowBrief(false)
                  showToast('Request declined.')
                }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)',
                  color: '#EF4444', borderRadius: '12px', padding: '14px',
                  fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                <XCircle size={18} /> Decline ✗
              </button>
            </div>
          </div>
          )
        })() : (
          /* ── Idle state ── */
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '72px', height: '72px', borderRadius: '50%',
              background: availability === 'online' ? 'rgba(34,197,94,0.1)' : 'rgba(75,85,99,0.1)',
              marginBottom: '16px',
              animation: availability === 'online' ? 'idlePulse 2s ease infinite' : 'none',
            }}>
              <Radio size={32} style={{ color: availability === 'online' ? '#22C55E' : '#4B5563' }} />
            </div>
            <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
              {availability === 'online'
                ? 'Waiting for a session request...'
                : availability === 'busy'
                ? 'You are marked as busy'
                : 'You are currently offline'}
            </p>
          </div>
        )}
      </section>

      {/* ── Recent Sessions ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
            Recent Sessions
          </h2>
          <Link to="/advisor/dashboard/sessions" style={{ color: '#C9A84C', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            View All →
          </Link>
        </div>
        {isRealUser ? (
          recentSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <MessageCircle size={36} style={{ color: '#1E2D45', margin: '0 auto 10px', display: 'block' }} />
              <p style={{ color: '#4B5563', fontSize: '14px', margin: 0 }}>No sessions yet. Start a live session to connect with clients.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentSessions.map(session => {
                const typeStyle = TYPE_COLORS[session.type] ?? TYPE_COLORS.chat
                const net = +((session.total_cost ?? 0) * 0.7).toFixed(2)
                const initials = (session.client_name ?? '?')[0].toUpperCase()
                return (
                  <div key={session.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: '#131929', border: '1px solid #1E2D45', borderRadius: '12px',
                    padding: '14px 18px', flexWrap: 'wrap',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg,#1E2D45,#0B0F1A)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '14px' }}>{initials}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: '#F0F4FF', fontSize: '13px', margin: '0 0 2px' }}>{session.client_name}</p>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        background: typeStyle.bg, color: typeStyle.color,
                        borderRadius: '20px', padding: '1px 8px', fontSize: '11px', fontWeight: 600,
                      }}>
                        {session.type === 'video' ? <Video size={10} /> : session.type === 'audio' ? <Mic size={10} /> : <MessageCircle size={10} />}
                        {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                      </span>
                    </div>
                    <p style={{ color: '#4B5563', fontSize: '12px', flexShrink: 0 }}>
                      {format(new Date(session.started_at), 'MMM d, yyyy')}
                    </p>
                    <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '14px', flexShrink: 0, margin: 0 }}>
                      +${net}
                    </p>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ADV_SESSIONS.slice(0, 5).map(session => {
              const client = CLIENTS.find(c => c.id === session.clientId)
              const typeStyle = TYPE_COLORS[session.type]
              const net = +(session.totalCost * 0.7).toFixed(2)
              return (
                <div key={session.id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: '#131929', border: '1px solid #1E2D45', borderRadius: '12px',
                  padding: '14px 18px', flexWrap: 'wrap',
                }}>
                  <img src={client?.avatar} alt={session.clientName}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: '#F0F4FF', fontSize: '13px', margin: '0 0 2px' }}>{session.clientName}</p>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: typeStyle.bg, color: typeStyle.color,
                      borderRadius: '20px', padding: '1px 8px', fontSize: '11px', fontWeight: 600,
                    }}>
                      {session.type === 'video' ? <Video size={10} /> : session.type === 'audio' ? <Mic size={10} /> : <MessageCircle size={10} />}
                      {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                    </span>
                  </div>
                  <p style={{ color: '#4B5563', fontSize: '12px', flexShrink: 0 }}>
                    {format(new Date(session.startedAt), 'MMM d, yyyy')}
                  </p>
                  <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '14px', flexShrink: 0, margin: 0 }}>
                    +${net}
                  </p>
                </div>
              )
            })}
            {ADV_SESSIONS.length === 0 && (
              <p style={{ color: '#4B5563', fontSize: '14px', padding: '20px 0' }}>No sessions yet.</p>
            )}
          </div>
        )}
      </section>

      {/* ── Earnings mini chart ── */}
      <section style={{ background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
            Earnings This Month
          </h2>
          <span style={{ color: '#C9A84C', fontSize: '20px', fontWeight: 700 }}>
            {isRealUser ? `$${earnings.thisMonth.toFixed(2)}` : '$2,847.30'}
          </span>
        </div>
        {isRealUser && earningsChartData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <DollarSign size={36} style={{ color: '#1E2D45', margin: '0 auto 10px', display: 'block' }} />
            <p style={{ color: '#4B5563', fontSize: '14px', margin: 0 }}>Earnings will appear here once you complete sessions.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart
              data={isRealUser ? earningsChartData : REVENUE_GRAPH_DATA}
              margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey={isRealUser ? 'day' : 'month'}
                axisLine={false} tickLine={false}
                tick={{ fill: '#4B5563', fontSize: 11 }}
                interval={isRealUser ? 4 : 0}
              />
              <Tooltip
                contentStyle={{ background: '#131929', border: '1px solid #1E2D45', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#F0F4FF' }}
                itemStyle={{ color: '#C9A84C' }}
                formatter={(v: number | undefined) => [`$${(v ?? 0).toLocaleString()}`, 'Earnings'] as [string, string]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C9A84C"
                strokeWidth={2}
                fill="url(#goldGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </section>

      <Toast message={toast.msg} visible={toast.visible} />

      <style>{`
        @keyframes requestPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.15); }
          50%       { box-shadow: 0 0 0 8px rgba(201,168,76,0); }
        }
        @keyframes idlePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}
