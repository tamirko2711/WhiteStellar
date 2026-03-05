import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Radio, DollarSign, Calendar, MessageCircle, Star, Video, Mic, CheckCircle, XCircle, X } from 'lucide-react'
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { ADVISORS, CLIENTS, REVENUE_GRAPH_DATA, getSessionsByAdvisor } from '../../../data/advisors'
import { useAuthStore } from '../../../store/authStore'
import { useAdvisorStore } from '../../../store/advisorStore'
import Toast from '../../../components/Toast'

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
  const { availability, setAvailability } = useAdvisorStore()

  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [showIncoming, setShowIncoming] = useState(false)
  const [countdown, setCountdown] = useState(120)
  const [toast, setToast] = useState({ msg: '', visible: false })

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  // Countdown timer for incoming request
  useEffect(() => {
    if (!showIncoming) { setCountdown(120); return }
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { setShowIncoming(false); return 120 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [showIncoming])

  function handleAvailability() {
    const next = AVAIL_CYCLE[availability]
    setAvailability(next)
    if (next === 'online')  showToast('You are now visible to clients ✨')
    if (next === 'offline') showToast('You are now offline.')
  }

  const avail = AVAIL_CONFIG[availability]
  const isPending = ADVISOR_DATA.accountStatus === 'pending'
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
          <Link to={`/advisor/${ADVISOR_ID}`} style={{ color: '#C9A84C', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
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
        <StatCard icon={<DollarSign size={20} />} value="$0.00"      label="Today's Earnings" sublabel="Updated live"    iconColor="#C9A84C" />
        <StatCard icon={<Calendar size={20} />}   value="$2,847.30"  label="This Month"        sublabel="Nov 2024"        iconColor="#2DD4BF" />
        <StatCard icon={<MessageCircle size={20} />} value={String(ADVISOR_DATA.totalSessions)} label="Total Sessions"  sublabel="All time" iconColor="#8B5CF6" />
        <StatCard icon={<Star size={20} />}       value={String(ADVISOR_DATA.rating)} label="Rating"       sublabel={`${ADVISOR_DATA.reviewCount.toLocaleString()} reviews`} iconColor="#C9A84C" />
      </div>

      {/* ── Live session area ── */}
      <section style={{ background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
            Live Session
          </h2>
          {/* Dev button */}
          <button
            onClick={() => setShowIncoming(true)}
            style={{
              background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)',
              color: '#C9A84C', borderRadius: '8px', padding: '5px 12px',
              fontSize: '11px', cursor: 'pointer',
            }}
          >
            ⚡ Test Incoming Request
          </button>
        </div>

        {showIncoming ? (
          /* ── Incoming request card ── */
          <div style={{
            background: 'rgba(201,168,76,0.05)', border: '2px solid #C9A84C',
            borderRadius: '14px', padding: '24px',
            animation: 'requestPulse 1.5s ease infinite',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <img src={FAKE_CLIENT.avatar} alt={FAKE_CLIENT.fullName}
                style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #C9A84C' }} />
              <div>
                <p style={{ fontWeight: 700, color: '#F0F4FF', fontSize: '16px', margin: '0 0 4px' }}>
                  {FAKE_CLIENT.fullName} is requesting a Video Session
                </p>
                <span style={{ ...TYPE_COLORS.video, display: 'inline-flex', alignItems: 'center', gap: '5px',
                  borderRadius: '20px', padding: '3px 10px', fontSize: '12px', fontWeight: 600,
                  background: TYPE_COLORS.video.bg, color: TYPE_COLORS.video.color }}>
                  <Video size={12} /> Video · $5.99/min
                </span>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <p style={{ color: '#EF4444', fontWeight: 700, fontSize: '20px', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                  {timerDisplay}
                </p>
                <p style={{ color: '#4B5563', fontSize: '11px', margin: 0 }}>auto-decline</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setShowIncoming(false); showToast('Session accepted!') }}
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
                onClick={() => { setShowIncoming(false); showToast('Request declined.') }}
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
        ) : (
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
      </section>

      {/* ── Earnings mini chart ── */}
      <section style={{ background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
            Earnings This Month
          </h2>
          <span style={{ color: '#C9A84C', fontSize: '20px', fontWeight: 700 }}>$2,847.30</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={REVENUE_GRAPH_DATA} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false} tickLine={false}
              tick={{ fill: '#4B5563', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{ background: '#131929', border: '1px solid #1E2D45', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: '#F0F4FF' }}
              itemStyle={{ color: '#C9A84C' }}
              formatter={(v: number | undefined) => [`$${(v ?? 0).toLocaleString()}`, 'Revenue'] as [string, string]}
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
