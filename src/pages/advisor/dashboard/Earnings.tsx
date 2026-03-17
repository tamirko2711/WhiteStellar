// ============================================================
// WhiteStellar — Advisor Dashboard: Earnings
// src/pages/advisor/dashboard/Earnings.tsx
// ============================================================

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { TrendingUp, DollarSign, Clock, Star, CreditCard, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'
import { requestPayout } from '../../../lib/api/payments'
import { supabase } from '../../../lib/supabase'

// ─── Dummy earnings data ──────────────────────────────────────

const WEEKLY_DATA = [
  { label: 'Mon', gross: 42.5,  net: 29.75 },
  { label: 'Tue', gross: 78.3,  net: 54.81 },
  { label: 'Wed', gross: 131.78, net: 92.25 },
  { label: 'Thu', gross: 55.0,  net: 38.5  },
  { label: 'Fri', gross: 174.65, net: 122.26 },
  { label: 'Sat', gross: 90.0,  net: 63.0  },
  { label: 'Sun', gross: 28.0,  net: 19.6  },
]

const MONTHLY_DATA = [
  { label: 'Jan', gross: 820,  net: 574 },
  { label: 'Feb', gross: 960,  net: 672 },
  { label: 'Mar', gross: 1120, net: 784 },
  { label: 'Apr', gross: 980,  net: 686 },
  { label: 'May', gross: 1380, net: 966 },
  { label: 'Jun', gross: 1540, net: 1078 },
  { label: 'Jul', gross: 1210, net: 847 },
  { label: 'Aug', gross: 1680, net: 1176 },
  { label: 'Sep', gross: 1450, net: 1015 },
  { label: 'Oct', gross: 1790, net: 1253 },
  { label: 'Nov', gross: 1920, net: 1344 },
  { label: 'Dec', gross: 600,  net: 420 },
]

const YEARLY_DATA = [
  { label: '2021', gross: 4200,  net: 2940 },
  { label: '2022', gross: 8900,  net: 6230 },
  { label: '2023', gross: 14200, net: 9940 },
  { label: '2024', gross: 18480, net: 12936 },
]

type Period = 'week' | 'month' | 'year'

const CHART_DATA: Record<Period, typeof WEEKLY_DATA> = {
  week: WEEKLY_DATA,
  month: MONTHLY_DATA,
  year: YEARLY_DATA,
}

const PERIOD_TOTALS: Record<Period, { gross: number; net: number; sessions: number; hours: number }> = {
  week:  { gross: 600.23,  net: 420.17, sessions: 12,  hours: 6.2  },
  month: { gross: 1920.00, net: 1344.00, sessions: 48,  hours: 24.5 },
  year:  { gross: 18480.00, net: 12936.00, sessions: 521, hours: 287  },
}

// ─── Breakdown rows ───────────────────────────────────────────

const BREAKDOWN_ROWS = [
  { id: 1, date: '2024-11-15', client: 'Sarah Mitchell', type: 'video', duration: 22, gross: 131.78, net: 92.25 },
  { id: 2, date: '2024-10-28', client: 'James Torres',   type: 'audio', duration: 35, gross: 174.65, net: 122.26 },
  { id: 3, date: '2024-10-10', client: 'Sarah Mitchell', type: 'chat',  duration: 18, gross: 53.82,  net: 37.67 },
  { id: 4, date: '2024-09-22', client: 'James Torres',   type: 'video', duration: 40, gross: 239.60, net: 167.72 },
]

// ─── Custom tooltip ───────────────────────────────────────────

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0F1828', border: '1px solid #1E2D45', borderRadius: '10px',
      padding: '10px 14px', fontSize: '13px',
    }}>
      <p style={{ color: '#8B9BB4', margin: '0 0 6px', fontWeight: 600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: '2px 0', color: p.name === 'net' ? '#C9A84C' : '#4B5563' }}>
          {p.name === 'net' ? 'Your earnings' : 'Gross'}: ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

// ─── Payout request modal ─────────────────────────────────────

function PayoutModal({ available, onClose }: { available: number; onClose: () => void }) {
  const { user } = useAuthStore()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  async function request() {
    if (!user?.id) return
    setLoading(true)
    setErrMsg('')
    try {
      await requestPayout(user.id, available)
      setSent(true)
    } catch (err) {
      setErrMsg((err as Error).message ?? 'Payout request failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#0F1828', border: '1px solid #1E2D45',
        borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%',
      }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircle size={40} color="#22C55E" style={{ marginBottom: '12px' }} />
            <h3 style={{ color: '#F0F4FF', fontWeight: 700, margin: '0 0 8px' }}>Payout Requested!</h3>
            <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 20px' }}>
              Your payout of <strong style={{ color: '#C9A84C' }}>${available.toFixed(2)}</strong> has been submitted.
              Funds typically arrive within 2–5 business days.
            </p>
            <button
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
                border: 'none', color: '#0B0F1A', fontWeight: 700,
                padding: '10px 28px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#F0F4FF', fontWeight: 700, margin: 0, fontSize: '17px' }}>Request Payout</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{
              background: '#1A2540', borderRadius: '12px', padding: '16px',
              textAlign: 'center', marginBottom: '20px',
            }}>
              <p style={{ color: '#8B9BB4', fontSize: '12px', margin: '0 0 4px' }}>Available Balance</p>
              <p style={{ color: '#C9A84C', fontSize: '28px', fontWeight: 700, margin: 0 }}>
                ${available.toFixed(2)}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', padding: '12px 14px', background: '#1A2540', borderRadius: '10px' }}>
              <CreditCard size={18} color="#8B9BB4" />
              <div>
                <p style={{ color: '#F0F4FF', fontSize: '14px', margin: '0 0 2px' }}>PayPal</p>
                <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>luna@example.com</p>
              </div>
            </div>
            {errMsg && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', padding: '10px 14px', marginBottom: '4px',
              }}>
                <AlertCircle size={15} color="#EF4444" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ color: '#EF4444', fontSize: '13px', margin: 0 }}>{errMsg}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={onClose} style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                background: '#1A2540', border: '1px solid #1E2D45',
                color: '#8B9BB4', cursor: 'pointer', fontSize: '14px',
              }}>
                Cancel
              </button>
              <button
                onClick={request}
                disabled={loading}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px',
                  background: loading ? '#4B5563' : 'linear-gradient(135deg,#C9A84C,#E8C96D)',
                  border: 'none', color: '#0B0F1A', fontWeight: 700,
                  cursor: loading ? 'wait' : 'pointer', fontSize: '14px',
                }}
              >
                {loading ? 'Processing…' : 'Request Payout'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string; sub?: string
}) {
  return (
    <div style={{
      background: '#0F1828', border: '1px solid #1E2D45', borderRadius: '14px',
      padding: '18px 20px', flex: '1 1 140px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#C9A84C',
        }}>
          {icon}
        </div>
        <span style={{ color: '#4B5563', fontSize: '12px' }}>{label}</span>
      </div>
      <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 2px' }}>{value}</p>
      {sub && <p style={{ color: '#4B5563', fontSize: '11px', margin: 0 }}>{sub}</p>}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────

export default function AdvisorEarnings() {
  const { user } = useAuthStore()
  const isRealUser = !!(user && !user.id.startsWith('dev-'))
  const [period, setPeriod] = useState<Period>('month')
  const [showPayout, setShowPayout] = useState(false)

  // ── Real session data ──
  const [sessions, setSessions] = useState<Array<{
    id: string
    client_name: string
    type: string
    duration_minutes: number | null
    total_cost: number | null
    started_at: string
  }>>([])

  useEffect(() => {
    if (!isRealUser || !user) return
    async function load() {
      const { data: adv } = await supabase
        .from('advisors')
        .select('id')
        .eq('user_id', user!.id)
        .single()
      if (!adv) return
      const { data: sess } = await supabase
        .from('sessions')
        .select('id, client_name, type, duration_minutes, total_cost, started_at')
        .eq('advisor_id', adv.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
      setSessions(sess ?? [])
    }
    load()
  }, [isRealUser, user?.id])

  // ── Compute real chart data from sessions ──
  function buildWeekData() {
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i))
      const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999)
      const gross = sessions
        .filter(s => { const sd = new Date(s.started_at); return sd >= dayStart && sd <= dayEnd })
        .reduce((sum, s) => sum + (s.total_cost ?? 0), 0)
      return { label: DAYS[d.getDay()], gross: +gross.toFixed(2), net: +(gross * 0.7).toFixed(2) }
    })
  }
  function buildMonthData() {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const year = new Date().getFullYear()
    return MONTHS.map((label, i) => {
      const gross = sessions
        .filter(s => { const d = new Date(s.started_at); return d.getFullYear() === year && d.getMonth() === i })
        .reduce((sum, s) => sum + (s.total_cost ?? 0), 0)
      return { label, gross: +gross.toFixed(2), net: +(gross * 0.7).toFixed(2) }
    })
  }
  function buildYearData() {
    const yr = new Date().getFullYear()
    return [yr - 3, yr - 2, yr - 1, yr].map(y => {
      const gross = sessions
        .filter(s => new Date(s.started_at).getFullYear() === y)
        .reduce((sum, s) => sum + (s.total_cost ?? 0), 0)
      return { label: String(y), gross: +gross.toFixed(2), net: +(gross * 0.7).toFixed(2) }
    })
  }
  function computeTotals(start: Date) {
    const f = sessions.filter(s => new Date(s.started_at) >= start)
    const gross = f.reduce((s, r) => s + (r.total_cost ?? 0), 0)
    const mins = f.reduce((s, r) => s + (r.duration_minutes ?? 0), 0)
    return { gross: +gross.toFixed(2), net: +(gross * 0.7).toFixed(2), sessions: f.length, hours: +(mins / 60).toFixed(1) }
  }

  const _now = new Date()
  const _weekStart = new Date(_now); _weekStart.setDate(_now.getDate() - 6); _weekStart.setHours(0, 0, 0, 0)
  const _monthStart = new Date(_now.getFullYear(), _now.getMonth(), 1)
  const _yearStart = new Date(_now.getFullYear(), 0, 1)
  const realChart = { week: buildWeekData(), month: buildMonthData(), year: buildYearData() }
  const realTotals = { week: computeTotals(_weekStart), month: computeTotals(_monthStart), year: computeTotals(_yearStart) }
  const allTimeNet = sessions.reduce((s, r) => s + (r.total_cost ?? 0) * 0.7, 0)

  const data = isRealUser ? realChart[period] : CHART_DATA[period]
  const totals = isRealUser ? realTotals[period] : PERIOD_TOTALS[period]
  const available = isRealUser ? +allTimeNet.toFixed(2) : 420.17  // net earnings / payout balance

  const PERIODS: { key: Period; label: string }[] = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
  ]

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>
          Earnings
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
          Track your income and request payouts.
        </p>
      </div>

      {/* Hero card */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: '18px', padding: '28px', marginBottom: '24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '20px',
      }}>
        <div>
          <p style={{ color: '#8B9BB4', fontSize: '13px', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Available for Payout
          </p>
          <p style={{ color: '#C9A84C', fontSize: '38px', fontWeight: 700, margin: '0 0 4px', lineHeight: 1 }}>
            ${available.toFixed(2)}
          </p>
          <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>
            Next auto-payout on Dec 15, 2024
          </p>
        </div>
        <button
          onClick={() => setShowPayout(true)}
          style={{
            background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
            border: 'none', color: '#0B0F1A', fontWeight: 700,
            padding: '12px 28px', borderRadius: '12px', cursor: 'pointer',
            fontSize: '15px',
          }}
        >
          Request Payout
        </button>
      </div>

      {/* Period tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            style={{
              padding: '8px 18px', borderRadius: '20px', fontSize: '13px',
              fontWeight: period === p.key ? 600 : 400, cursor: 'pointer',
              border: '1px solid',
              borderColor: period === p.key ? '#C9A84C' : '#1E2D45',
              background: period === p.key ? 'rgba(201,168,76,0.1)' : '#0F1828',
              color: period === p.key ? '#C9A84C' : '#8B9BB4',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <StatCard
          icon={<DollarSign size={16} />}
          label="Your Earnings"
          value={`$${totals.net.toLocaleString()}`}
          sub="After 30% platform fee"
        />
        <StatCard
          icon={<TrendingUp size={16} />}
          label="Gross Revenue"
          value={`$${totals.gross.toLocaleString()}`}
          sub="Client payments"
        />
        <StatCard
          icon={<Star size={16} />}
          label="Sessions"
          value={String(totals.sessions)}
          sub="Completed"
        />
        <StatCard
          icon={<Clock size={16} />}
          label="Hours"
          value={String(totals.hours)}
          sub="Total time"
        />
      </div>

      {/* Bar chart */}
      <div style={{
        background: '#0F1828', border: '1px solid #1E2D45',
        borderRadius: '16px', padding: '24px', marginBottom: '24px',
      }}>
        <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: '0 0 20px', fontSize: '15px' }}>
          Earnings Overview
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D45" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#4B5563', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4B5563', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="gross" name="gross" fill="#1E2D45" radius={[4, 4, 0, 0]} />
            <Bar dataKey="net" name="net" fill="#C9A84C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
          <LegendDot color="#C9A84C" label="Your Earnings (70%)" />
          <LegendDot color="#1E2D45" label="Platform Fee (30%)" />
        </div>
      </div>

      {/* Payout history */}
      <div style={{
        background: '#0F1828', border: '1px solid #1E2D45',
        borderRadius: '16px', padding: '24px', marginBottom: '24px',
      }}>
        <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: '0 0 16px', fontSize: '15px' }}>
          Payout History
        </h3>
        {isRealUser ? (
          <p style={{ color: '#4B5563', fontSize: '14px', margin: 0 }}>No payout history yet.</p>
        ) : [
          { date: 'Nov 1, 2024', method: 'PayPal', amount: 380.50, status: 'Paid' },
          { date: 'Oct 1, 2024', method: 'PayPal', amount: 512.00, status: 'Paid' },
          { date: 'Sep 1, 2024', method: 'PayPal', amount: 298.75, status: 'Paid' },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: i < 2 ? '1px solid #1E2D45' : 'none',
          }}>
            <div>
              <p style={{ color: '#F0F4FF', fontSize: '14px', margin: '0 0 2px' }}>{row.method}</p>
              <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>{row.date}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#22C55E', fontWeight: 700, fontSize: '15px', margin: '0 0 2px' }}>
                ${row.amount.toFixed(2)}
              </p>
              <span style={{
                background: 'rgba(34,197,94,0.1)', color: '#22C55E',
                borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600,
              }}>
                {row.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Earnings breakdown table */}
      <div style={{ background: '#0F1828', border: '1px solid #1E2D45', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: '0 0 16px', fontSize: '15px' }}>
          Session Breakdown
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                {['Date', 'Client', 'Type', 'Duration', 'Gross', 'Your Cut'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px',
                    color: '#4B5563', fontWeight: 600, fontSize: '11px',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    borderBottom: '1px solid #1E2D45',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(isRealUser
                ? sessions.slice(0, 20).map((s, i) => ({
                    id: i,
                    date: s.started_at.slice(0, 10),
                    client: s.client_name ?? '—',
                    type: s.type ?? 'chat',
                    duration: s.duration_minutes ?? 0,
                    gross: +(s.total_cost ?? 0).toFixed(2),
                    net: +((s.total_cost ?? 0) * 0.7).toFixed(2),
                  }))
                : BREAKDOWN_ROWS
              ).map((row, i) => (
                <tr key={row.id} style={{ background: i % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'none' }}>
                  <td style={{ padding: '12px', color: '#8B9BB4' }}>{row.date}</td>
                  <td style={{ padding: '12px', color: '#F0F4FF' }}>{row.client}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      background: 'rgba(201,168,76,0.08)', color: '#C9A84C',
                      border: '1px solid rgba(201,168,76,0.2)',
                      borderRadius: '4px', padding: '1px 6px', fontSize: '11px',
                    }}>
                      {row.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#8B9BB4' }}>{row.duration} min</td>
                  <td style={{ padding: '12px', color: '#8B9BB4' }}>${row.gross.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#C9A84C', fontWeight: 700 }}>${row.net.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPayout && <PayoutModal available={available} onClose={() => setShowPayout(false)} />}
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, flexShrink: 0 }} />
      <span style={{ color: '#8B9BB4', fontSize: '12px' }}>{label}</span>
    </div>
  )
}
