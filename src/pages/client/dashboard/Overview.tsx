import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Heart, Clock, Wallet, Video, Mic, Star } from 'lucide-react'
import { format } from 'date-fns'
import { getAdvisorById, getSessionsByClient, CLIENTS } from '../../../data/advisors'
import { useAuthStore } from '../../../store/authStore'
import { supabase } from '../../../lib/supabase'
import AdvisorCard from '../../../components/AdvisorCard'
import type { Advisor } from '../../../types'

// ─── Helpers ──────────────────────────────────────────────────

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

// ─── Session type badge colors ────────────────────────────────

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  chat:  { bg: 'rgba(45,212,191,0.12)',  color: '#2DD4BF' },
  audio: { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B' },
  video: { bg: 'rgba(139,92,246,0.12)',  color: '#8B5CF6' },
}

// ─── DB types ─────────────────────────────────────────────────

interface DbSession {
  id: number
  advisor_id: number
  advisor_name: string
  type: string
  status: string
  duration_minutes: number
  total_cost: number
  started_at: string
  has_review: boolean
}

// ─── Overview page ────────────────────────────────────────────

export default function Overview() {
  const { user } = useAuthStore()
  const [sessionsCount, setSessionsCount]   = useState(0)
  const [savedCount, setSavedCount]         = useState(0)
  const [recentSessions, setRecentSessions] = useState<DbSession[]>([])
  const [savedAdvisors, setSavedAdvisors]   = useState<Advisor[]>([])

  const isDevMode = user?.id === 'dev-client-001'

  useEffect(() => {
    if (!user?.id) return

    // Dev mode: use mock data so the dummy dashboard is fully populated
    if (isDevMode) {
      const mockSessions = getSessionsByClient(201)
      setSessionsCount(mockSessions.length)
      setRecentSessions(mockSessions.slice(0, 3).map(s => ({
        id: s.id,
        advisor_id: s.advisorId,
        advisor_name: s.advisorName,
        type: s.type,
        status: s.status,
        duration_minutes: s.durationMinutes,
        total_cost: s.totalCost,
        started_at: s.startedAt,
        has_review: s.hasReview,
      })))
      const mockClient = CLIENTS.find(c => c.id === 201)
      if (mockClient) {
        setSavedCount(mockClient.savedAdvisors.length)
        setSavedAdvisors(
          mockClient.savedAdvisors.slice(0, 3)
            .map(id => getAdvisorById(id))
            .filter((a): a is Advisor => a !== undefined)
        )
      }
      return
    }

    // Real user: fetch live data from Supabase
    const fetchData = async () => {
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, advisor_id, advisor_name, type, status, duration_minutes, total_cost, started_at, has_review')
        .eq('client_id', user.id)
        .order('started_at', { ascending: false })
      if (sessions) {
        setSessionsCount(sessions.length)
        setRecentSessions(sessions.slice(0, 3) as DbSession[])
      }

      const { data: saved } = await supabase
        .from('saved_advisors')
        .select('advisor_id')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
      if (saved) {
        setSavedCount(saved.length)
        const ids = saved.slice(0, 3).map(s => s.advisor_id)
        if (ids.length > 0) {
          const { data: advisorRows } = await supabase
            .from('advisors')
            .select('id, full_name, avatar, short_bio, status, rating, review_count, is_top_advisor, chat_price, audio_price, video_price, total_sessions')
            .in('id', ids)
          if (advisorRows) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setSavedAdvisors(advisorRows.map((a: any): Advisor => ({
              id: a.id,
              userId: 0,
              fullName: a.full_name ?? '',
              shortBio: a.short_bio ?? '',
              longBio: '',
              avatar: a.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(a.full_name ?? 'A')}&background=1E2D45&color=C9A84C`,
              backgroundImage: '',
              status: a.status ?? 'offline',
              accountStatus: 'active',
              isTopAdvisor: a.is_top_advisor ?? false,
              isNew: !a.is_top_advisor,
              languages: [],
              categories: [],
              specializations: [],
              skillsAndMethods: [],
              sessionTypes: [
                a.chat_price != null ? 'chat' : null,
                a.audio_price != null ? 'audio' : null,
                a.video_price != null ? 'video' : null,
              ].filter(Boolean) as Advisor['sessionTypes'],
              pricing: { chat: a.chat_price, audio: a.audio_price, video: a.video_price },
              rating: a.rating ?? 5.0,
              reviewCount: a.review_count ?? 0,
              totalSessions: a.total_sessions ?? 0,
              yearsActive: 0,
              responseTime: '—',
              withdrawalMethod: 'paypal',
              joinedAt: new Date().toISOString(),
              reviews: [],
            })))
          }
        }
      }
    }
    fetchData().catch(console.error)
  }, [user?.id, isDevMode])

  const lastSession = recentSessions[0]

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
          value={String(sessionsCount)}
          label="Total Sessions"
          sublabel="All time"
          iconColor="#2DD4BF"
        />
        <StatCard
          icon={<Heart size={20} />}
          value={String(savedCount)}
          label="Advisors Saved"
          sublabel="In your list"
          iconColor="#EF4444"
        />
        <StatCard
          icon={<Clock size={20} />}
          value={lastSession ? format(new Date(lastSession.started_at), 'MMM d') : '—'}
          label="Last Session"
          sublabel={lastSession?.advisor_name ?? '—'}
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
          {recentSessions.length === 0 ? (
            <p style={{ color: '#4B5563', fontSize: '14px', padding: '20px 0' }}>No sessions yet.</p>
          ) : (
            recentSessions.map(session => {
              const advisor = isDevMode ? getAdvisorById(session.advisor_id) : undefined
              const advisorAvatar = advisor?.avatar
                ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(session.advisor_name)}&background=1E2D45&color=C9A84C`
              const typeStyle = TYPE_COLORS[session.type] ?? TYPE_COLORS.chat
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 180px', minWidth: 0 }}>
                    <img
                      src={advisorAvatar}
                      alt={session.advisor_name}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: '#F0F4FF', fontSize: '13px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {session.advisor_name}
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

                  <div style={{ flex: '0 0 auto', textAlign: 'center' }}>
                    <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px', margin: 0 }}>
                      {session.duration_minutes} min · <span style={{ color: '#C9A84C' }}>${session.total_cost.toFixed(2)}</span>
                    </p>
                    <p style={{ color: '#4B5563', fontSize: '11px', margin: '2px 0 0' }}>
                      {format(new Date(session.started_at), 'MMM d, yyyy')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '0 0 auto' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                      background: isCompleted ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                      color: isCompleted ? '#22C55E' : '#EF4444',
                    }}>
                      {isCompleted ? 'Completed' : 'Cancelled'}
                    </span>
                    {isCompleted && !session.has_review && (
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
        {savedAdvisors.length === 0 ? (
          <p style={{ color: '#4B5563', fontSize: '14px', padding: '20px 0' }}>No saved advisors yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {savedAdvisors.map(advisor => (
              <AdvisorCard key={advisor.id} advisor={advisor} />
            ))}
          </div>
        )}
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
