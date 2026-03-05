// ============================================================
// WhiteStellar — Super Admin: Dashboard
// src/pages/admin/Dashboard.tsx
// ============================================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Users, UserCheck, MessageSquare, DollarSign, Calendar, Star, CheckCircle } from 'lucide-react'
import { ADVISORS, DASHBOARD_STATS, REVENUE_GRAPH_DATA } from '../../data/advisors'
import Toast from '../../components/Toast'

// ─── Platform health bar ──────────────────────────────────────

const HEALTH = [
  { label: 'API',           status: 'operational' },
  { label: 'Payments',      status: 'operational' },
  { label: 'Sessions',      status: 'operational' },
  { label: 'Notifications', status: 'degraded'    },
  { label: 'Auth',          status: 'operational' },
]

function HealthBar() {
  return (
    <div style={{
      background: '#0D1221', border: '1px solid #1A2235',
      borderRadius: '14px', padding: '14px 20px', marginBottom: '24px',
      display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
    }}>
      <span style={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '8px' }}>
        Platform Status
      </span>
      {HEALTH.map(h => (
        <div key={h.label} style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: '#080C16', border: '1px solid #1A2235',
          borderRadius: '20px', padding: '4px 12px',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
            background: h.status === 'operational' ? '#22C55E' : h.status === 'degraded' ? '#F59E0B' : '#EF4444',
            boxShadow: h.status === 'operational' ? '0 0 5px #22C55E' : 'none',
          }} />
          <span style={{ color: '#8B9BB4', fontSize: '12px' }}>{h.label}</span>
          <span style={{
            color: h.status === 'operational' ? '#22C55E' : h.status === 'degraded' ? '#F59E0B' : '#EF4444',
            fontSize: '11px', fontWeight: 600,
          }}>
            {h.status === 'operational' ? 'OK' : h.status === 'degraded' ? 'Degraded' : 'Down'}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = '#C9A84C' }: {
  icon: React.ElementType; label: string; value: string; sub: string; color?: string
}) {
  return (
    <div style={{
      background: '#0D1221', border: '1px solid #1A2235',
      borderRadius: '14px', padding: '18px 20px', flex: '1 1 180px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '16px', right: '16px',
        width: '34px', height: '34px', borderRadius: '8px',
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
      }}>
        <Icon size={17} />
      </div>
      <p style={{ color: '#4B5563', fontSize: '12px', margin: '0 0 8px', fontWeight: 500 }}>{label}</p>
      <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>{value}</p>
      <p style={{ color: '#4B5563', fontSize: '11px', margin: 0 }}>{sub}</p>
    </div>
  )
}

// ─── Revenue chart tooltip ────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0D1221', border: '1px solid #1A2235', borderRadius: '10px', padding: '10px 14px', fontSize: '12px',
    }}>
      <p style={{ color: '#8B9BB4', margin: '0 0 6px', fontWeight: 600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: '2px 0', color: p.color }}>
          {p.name}: ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

// ─── Activity feed ────────────────────────────────────────────

const ACTIVITY = [
  { icon: '🟢', text: 'Luna Starweaver went online', time: '2 min ago', border: '#22C55E' },
  { icon: '💬', text: 'New session started: Sarah M. + Marcus V.', time: '5 min ago', border: '#3B82F6' },
  { icon: '⭐', text: 'New 5-star review submitted', time: '12 min ago', border: '#C9A84C' },
  { icon: '👤', text: 'New client registered: Elena K.', time: '18 min ago', border: '#8B5CF6' },
  { icon: '💰', text: 'Payout processed: $641.20 to Luna S.', time: '1 hr ago', border: '#22C55E' },
  { icon: '⚠️', text: 'Session cancelled due to connection issue', time: '2 hr ago', border: '#F59E0B' },
]

// ─── Main ─────────────────────────────────────────────────────

type Period = '7d' | '30d' | '6m' | '1y'

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>('6m')
  const [toast, setToast] = useState({ msg: '', visible: false })

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  const pendingAdvisors = ADVISORS.filter(a => a.accountStatus === 'pending')

  const s = DASHBOARD_STATS
  const chartData = REVENUE_GRAPH_DATA.map(d => ({
    ...d,
    commission: Math.round(d.revenue * 0.3),
  }))

  const PERIODS: { key: Period; label: string }[] = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '6m', label: '6 Months' },
    { key: '1y', label: '1 Year' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>
          Platform Dashboard
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
          WhiteStellar — control center overview.
        </p>
      </div>

      <HealthBar />

      {/* Stats */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
        <StatCard icon={Users} label="Total Advisors" value={s.totalAdvisors.toLocaleString()}
          sub={`${s.activeAdvisors} active · ${s.pendingAdvisors} pending`} />
        <StatCard icon={UserCheck} label="Total Clients" value={s.totalClients.toLocaleString()}
          sub={`${s.activeClients.toLocaleString()} active today`} />
        <StatCard icon={MessageSquare} label="Sessions Today" value={String(s.totalSessionsToday)}
          sub="↑ 12% vs yesterday" />
        <StatCard icon={DollarSign} label="Revenue Today" value={`$${s.revenueToday.toLocaleString()}`}
          sub={`Platform share: $${(s.revenueToday * 0.3).toFixed(2)}`} color="#22C55E" />
        <StatCard icon={Calendar} label="Revenue This Month" value={`$${s.revenueThisMonth.toLocaleString()}`}
          sub={`Platform share: $${(s.revenueThisMonth * 0.3).toLocaleString()}`} color="#22C55E" />
        <StatCard icon={Star} label="Avg Platform Rating" value={String(s.platformCommissionRate === 30 ? 4.8 : 4.7)}
          sub="Based on 48,291 reviews" color="#C9A84C" />
      </div>

      {/* Revenue chart */}
      <div style={{
        background: '#0D1221', border: '1px solid #1A2235',
        borderRadius: '16px', padding: '24px', marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: 0, fontSize: '15px' }}>Revenue Overview</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)} style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                border: '1px solid', fontWeight: period === p.key ? 600 : 400,
                borderColor: period === p.key ? '#C9A84C' : '#1A2235',
                background: period === p.key ? 'rgba(201,168,76,0.1)' : '#080C16',
                color: period === p.key ? '#C9A84C' : '#8B9BB4',
              }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="goldG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="redG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: '#4B5563', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#goldG)" />
            <Area type="monotone" dataKey="commission" name="Platform Commission" stroke="#EF4444" strokeWidth={1.5} fill="url(#redG)" />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
          <LegDot color="#C9A84C" label="Total Revenue" />
          <LegDot color="#EF4444" label="Platform Commission (30%)" />
        </div>
      </div>

      {/* Two-column: Pending + Activity */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

        {/* Pending approvals */}
        <div style={{
          flex: '1 1 340px', background: '#0D1221', border: '1px solid #1A2235',
          borderRadius: '16px', padding: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: 0, fontSize: '15px' }}>
              Pending Approvals
            </h3>
            <span style={{
              background: 'rgba(239,68,68,0.1)', color: '#EF4444',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 700,
            }}>
              {pendingAdvisors.length}
            </span>
          </div>

          {pendingAdvisors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#4B5563' }}>
              <CheckCircle size={28} strokeWidth={1} style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '13px' }}>No pending approvals</p>
            </div>
          ) : (
            pendingAdvisors.map(a => (
              <div key={a.id} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                background: '#080C16', borderRadius: '12px', padding: '14px',
                marginBottom: '10px',
              }}>
                <img src={a.avatar} alt={a.fullName} style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px', margin: '0 0 2px' }}>{a.fullName}</p>
                  <p style={{ color: '#4B5563', fontSize: '11px', margin: '0 0 8px' }}>
                    Joined {a.joinedAt} · {a.categories[0]?.title}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <Link to={`/admin/advisors/${a.id}`} style={{
                      background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
                      color: '#C9A84C', borderRadius: '6px', padding: '4px 10px', fontSize: '12px',
                      fontWeight: 600, textDecoration: 'none',
                    }}>
                      Review
                    </Link>
                    <button onClick={() => showToast(`${a.fullName} approved ✓`)} style={{
                      background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                      color: '#22C55E', borderRadius: '6px', padding: '4px 10px', fontSize: '12px',
                      fontWeight: 600, cursor: 'pointer',
                    }}>
                      Approve
                    </button>
                    <button onClick={() => showToast(`${a.fullName} rejected.`)} style={{
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                      color: '#EF4444', borderRadius: '6px', padding: '4px 10px', fontSize: '12px',
                      fontWeight: 600, cursor: 'pointer',
                    }}>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Activity feed */}
        <div style={{
          flex: '1 1 300px', background: '#0D1221', border: '1px solid #1A2235',
          borderRadius: '16px', padding: '20px',
        }}>
          <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: '0 0 16px', fontSize: '15px' }}>
            Recent Activity
          </h3>
          <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '10px 12px', borderRadius: '8px',
                borderLeft: `3px solid ${a.border}`,
                background: '#080C16',
              }}>
                <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>{a.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#CBD5E1', fontSize: '13px', margin: '0 0 2px', lineHeight: 1.4 }}>{a.text}</p>
                  <p style={{ color: '#4B5563', fontSize: '11px', margin: 0 }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}

function LegDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: color }} />
      <span style={{ color: '#8B9BB4', fontSize: '12px' }}>{label}</span>
    </div>
  )
}
