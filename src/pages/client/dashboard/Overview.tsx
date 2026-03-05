import { Link } from 'react-router-dom'
import { MessageCircle, Heart, Clock, Wallet, Video, Mic, Star } from 'lucide-react'
import { format } from 'date-fns'
import { SESSIONS, TRANSACTIONS, ADVISORS, CLIENTS, getAdvisorById } from '../../../data/advisors'
import { useAuthStore } from '../../../store/authStore'
import AdvisorCard from '../../../components/AdvisorCard'

// ─── Helpers ──────────────────────────────────────────────────

const CLIENT_ID = 201
const CLIENT     = CLIENTS.find(c => c.id === CLIENT_ID)!
const CLIENT_SESSIONS = SESSIONS
  .filter(s => s.clientId === CLIENT_ID)
  .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())

const SAVED_ADVISORS = ADVISORS.filter(a => CLIENT.savedAdvisors.includes(a.id)).slice(0, 3)

const LAST_DEPOSIT = [...TRANSACTIONS]
  .filter(t => t.clientId === CLIENT_ID && t.type === 'deposit')
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function sessionTypeIcon(type: string) {
  if (type === 'video') return <Video size={13} />
  if (type === 'audio') return <Mic size={13} />
  return <MessageCircle size={13} />
}

// ─── Stat card ────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
  sublabel: string
  iconColor: string
}

function StatCard({ icon, value, label, sublabel, iconColor }: StatCardProps) {
  return (
    <div
      style={{
        background: '#131929', border: '1px solid #1E2D45', borderRadius: '12px',
        padding: '20px', position: 'relative', flex: 1, minWidth: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '16px', right: '16px',
        color: iconColor, display: 'flex', alignItems: 'center',
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '28px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 4px', lineHeight: 1.1 }}>
        {value}
      </p>
      <p style={{ fontSize: '13px', fontWeight: 500, color: '#F0F4FF', margin: '0 0 2px' }}>{label}</p>
      <p style={{ fontSize: '11px', color: '#4B5563', margin: 0 }}>{sublabel}</p>
    </div>
  )
}

// ─── Session type badge ───────────────────────────────────────

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  chat:  { bg: 'rgba(45,212,191,0.12)',  color: '#2DD4BF' },
  audio: { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B' },
  video: { bg: 'rgba(139,92,246,0.12)',  color: '#8B5CF6' },
}

// ─── Overview page ────────────────────────────────────────────

export default function Overview() {
  const { user } = useAuthStore()

  // Last session
  const lastSession = CLIENT_SESSIONS[0]
  const lastAdvisor = lastSession ? getAdvisorById(lastSession.advisorId) : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Welcome banner ── */}
      <div
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.08) 0%, #0D1221 65%)',
          border: '1px solid #1E2D45', borderRadius: '16px', padding: '28px 32px',
        }}
      >
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700,
          color: '#F0F4FF', margin: '0 0 6px',
        }}>
          Good {getGreeting()}, {user?.fullName?.split(' ')[0]} ✨
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
          Here's what's happening with your account
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={<MessageCircle size={20} />}
          value={String(CLIENT.totalSessions)}
          label="Total Sessions"
          sublabel="All time"
          iconColor="#2DD4BF"
        />
        <StatCard
          icon={<Heart size={20} />}
          value={String(CLIENT.savedAdvisors.length)}
          label="Advisors Saved"
          sublabel="In your list"
          iconColor="#EF4444"
        />
        <StatCard
          icon={<Clock size={20} />}
          value={lastSession ? format(new Date(lastSession.startedAt), 'MMM d') : '—'}
          label="Last Session"
          sublabel={lastAdvisor?.fullName ?? '—'}
          iconColor="#8B9BB4"
        />
      </div>

      {/* ── Recent Sessions ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
            Recent Sessions
          </h2>
          <Link to="/dashboard/sessions" style={{ color: '#C9A84C', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            View All →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {CLIENT_SESSIONS.slice(0, 3).length === 0 ? (
            <p style={{ color: '#4B5563', fontSize: '14px', padding: '20px 0' }}>No sessions yet.</p>
          ) : (
            CLIENT_SESSIONS.slice(0, 3).map(session => {
              const advisor = getAdvisorById(session.advisorId)
              const typeStyle = TYPE_COLORS[session.type]
              const isCompleted = session.status === 'completed'

              return (
                <div
                  key={session.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    background: '#131929', border: '1px solid #1E2D45', borderRadius: '12px',
                    padding: '14px 20px', flexWrap: 'wrap',
                  }}
                >
                  {/* Avatar + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 180px', minWidth: 0 }}>
                    <img
                      src={advisor?.avatar}
                      alt={session.advisorName}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: '#F0F4FF', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {session.advisorName}
                      </p>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        background: typeStyle.bg, color: typeStyle.color,
                        borderRadius: '20px', padding: '1px 8px', fontSize: '11px', fontWeight: 600, marginTop: '2px',
                      }}>
                        {sessionTypeIcon(session.type)}
                        {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Duration + cost */}
                  <div style={{ flex: '0 0 auto', textAlign: 'center' }}>
                    <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px', margin: 0 }}>
                      {session.durationMinutes} min · <span style={{ color: '#C9A84C' }}>${session.totalCost.toFixed(2)}</span>
                    </p>
                    <p style={{ color: '#4B5563', fontSize: '11px', margin: '2px 0 0' }}>
                      {format(new Date(session.startedAt), 'MMM d, yyyy')}
                    </p>
                  </div>

                  {/* Status + Rate */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '0 0 auto' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                      background: isCompleted ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                      color: isCompleted ? '#22C55E' : '#EF4444',
                    }}>
                      {isCompleted ? 'Completed' : 'Cancelled'}
                    </span>
                    {isCompleted && !session.hasReview && (
                      <button style={{
                        background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.4)',
                        color: '#C9A84C', borderRadius: '20px', padding: '3px 12px',
                        fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      }}>
                        Rate
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* ── Saved Advisors preview ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
            Your Saved Advisors
          </h2>
          <Link to="/dashboard/saved" style={{ color: '#C9A84C', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            View All →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {SAVED_ADVISORS.map(advisor => (
            <AdvisorCard key={advisor.id} advisor={advisor} />
          ))}
        </div>
      </section>

      {/* ── Wallet summary ── */}
      <section>
        <div
          style={{
            background: 'radial-gradient(ellipse at 80% 50%, rgba(201,168,76,0.06) 0%, #131929 70%)',
            border: '1px solid #1E2D45', borderRadius: '16px', padding: '24px 28px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
          }}
        >
          <div>
            <p style={{ color: '#8B9BB4', fontSize: '12px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Available Balance
            </p>
            <p style={{ fontSize: '36px', fontWeight: 700, color: '#C9A84C', margin: '0 0 8px' }}>
              ${user?.walletBalance.toFixed(2)}
            </p>
            {LAST_DEPOSIT && (
              <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>
                Last deposit: ${LAST_DEPOSIT.amount.toFixed(2)} on {format(new Date(LAST_DEPOSIT.createdAt), 'MMM d')}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#C9A84C' }}>
              <Wallet size={16} />
              <Star size={12} />
            </div>
            <Link
              to="/dashboard/wallet"
              style={{
                background: '#C9A84C', color: '#0B0F1A', borderRadius: '10px',
                padding: '10px 20px', fontWeight: 700, fontSize: '14px',
                textDecoration: 'none', display: 'inline-block',
              }}
            >
              Top Up Wallet
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
