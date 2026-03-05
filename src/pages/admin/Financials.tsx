// ============================================================
// WhiteStellar — Super Admin: Financials
// src/pages/admin/Financials.tsx
// ============================================================

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { DollarSign, TrendingUp, Calendar, Percent } from 'lucide-react'
import { REVENUE_GRAPH_DATA, TRANSACTIONS, ADVISORS } from '../../data/advisors'
import Toast from '../../components/Toast'

// ─── Dummy payout rows ────────────────────────────────────────

const PAYOUTS = [
  { id: 1, advisorId: 1, advisorName: 'Luna Starweaver',  amount: 641.20, method: 'PayPal',        status: 'processed', date: '2024-11-11' },
  { id: 2, advisorId: 2, advisorName: 'Marcus Veil',       amount: 312.50, method: 'Payoneer',      status: 'processed', date: '2024-11-11' },
  { id: 3, advisorId: 6, advisorName: 'Iris Moonwell',     amount: 489.80, method: 'PayPal',        status: 'pending',   date: '2024-11-18' },
  { id: 4, advisorId: 3, advisorName: 'Celestine Ora',     amount: 156.00, method: 'Bank Transfer', status: 'pending',   date: '2024-11-18' },
  { id: 5, advisorId: 5, advisorName: 'Solomon Grey',      amount: 98.40,  method: 'Payoneer',      status: 'failed',    date: '2024-11-04' },
]

type PayoutStatus = 'all' | 'pending' | 'processed' | 'failed'

// ─── Chart tooltip ────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '10px', padding: '10px 14px', fontSize: '12px' }}>
      <p style={{ color: '#8B9BB4', margin: '0 0 6px', fontWeight: 600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: '2px 0', color: p.color }}>
          {p.name}: ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

type Period = '7d' | '30d' | '6m' | '1y'

// ─── Main ─────────────────────────────────────────────────────

export default function AdminFinancials() {
  const [period, setPeriod] = useState<Period>('6m')
  const [payoutFilter, setPayoutFilter] = useState<PayoutStatus>('all')
  const [payouts, setPayouts] = useState(PAYOUTS)
  const [toast, setToast] = useState({ msg: '', visible: false })

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  const chartData = REVENUE_GRAPH_DATA.map(d => ({
    ...d,
    commission: Math.round(d.revenue * 0.3),
  }))

  const filteredPayouts = payouts.filter(p => payoutFilter === 'all' || p.status === payoutFilter)

  const PERIODS: { key: Period; label: string }[] = [
    { key: '7d', label: '7 Days' }, { key: '30d', label: '30 Days' },
    { key: '6m', label: '6 Months' }, { key: '1y', label: '1 Year' },
  ]

  function statusBadge(status: string) {
    const MAP: Record<string, { bg: string; color: string }> = {
      processed: { bg: 'rgba(34,197,94,0.1)', color: '#22C55E' },
      pending:   { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' },
      failed:    { bg: 'rgba(239,68,68,0.1)', color: '#EF4444' },
    }
    const s = MAP[status] ?? MAP.failed
    return (
      <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' }}>
        {status}
      </span>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>Financials</h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>Platform revenue, payouts, and transaction history.</p>
      </div>

      {/* Hero card */}
      <div style={{
        background: 'linear-gradient(135deg,#0D1221,#131D35)',
        border: '1px solid rgba(201,168,76,0.3)', borderRadius: '18px', padding: '28px', marginBottom: '24px',
      }}>
        <p style={{ color: '#8B9BB4', fontSize: '12px', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Platform Revenue (All Time)</p>
        <p style={{ color: '#C9A84C', fontSize: '40px', fontWeight: 700, margin: '0 0 16px', lineHeight: 1 }}>$192,480.30</p>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          {[
            { label: 'This Month', value: '$64,320.80', Icon: Calendar },
            { label: 'This Week',  value: '$14,820.50', Icon: TrendingUp },
            { label: 'Today',      value: '$2,341.50',  Icon: DollarSign },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <item.Icon size={15} color="#8B9BB4" />
              <div>
                <p style={{ color: '#4B5563', fontSize: '11px', margin: 0 }}>{item.label}</p>
                <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '16px', margin: 0 }}>{item.value}</p>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Percent size={15} color="#8B9BB4" />
            <div>
              <p style={{ color: '#4B5563', fontSize: '11px', margin: 0 }}>Commission Rate</p>
              <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '16px', margin: 0 }}>30% platform · 70% advisor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: 0, fontSize: '15px' }}>Revenue Breakdown</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)} style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                border: '1px solid', fontWeight: period === p.key ? 600 : 400,
                borderColor: period === p.key ? '#C9A84C' : '#1A2235',
                background: period === p.key ? 'rgba(201,168,76,0.1)' : '#080C16',
                color: period === p.key ? '#C9A84C' : '#8B9BB4',
              }}>{p.label}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A2235" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#4B5563', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4B5563', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="revenue" name="Total Revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
            <Bar dataKey="commission" name="Platform Commission" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
          <LegDot color="#C9A84C" label="Total Revenue" />
          <LegDot color="#2DD4BF" label="Platform Commission" />
        </div>
      </div>

      {/* Payouts table */}
      <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: 0, fontSize: '15px' }}>Advisor Payouts</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'pending', 'processed', 'failed'] as PayoutStatus[]).map(f => (
              <button key={f} onClick={() => setPayoutFilter(f)} style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                border: '1px solid', fontWeight: payoutFilter === f ? 600 : 400,
                borderColor: payoutFilter === f ? '#C9A84C' : '#1A2235',
                background: payoutFilter === f ? 'rgba(201,168,76,0.1)' : '#080C16',
                color: payoutFilter === f ? '#C9A84C' : '#8B9BB4',
                textTransform: 'capitalize',
              }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1A2235' }}>
                {['Advisor', 'Amount', 'Method', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px', color: '#4B5563', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.map(p => {
                const advisor = ADVISORS.find(a => a.id === p.advisorId)
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #1A2235' }}>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {advisor && <img src={advisor.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />}
                        <span style={{ color: '#F0F4FF', fontSize: '13px' }}>{p.advisorName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', color: '#C9A84C', fontWeight: 700 }}>${p.amount.toFixed(2)}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ background: '#1A2540', color: '#8B9BB4', borderRadius: '4px', padding: '2px 8px', fontSize: '11px' }}>{p.method}</span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>{statusBadge(p.status)}</td>
                    <td style={{ padding: '12px 10px', color: '#4B5563', fontSize: '12px' }}>{p.date}</td>
                    <td style={{ padding: '12px 10px' }}>
                      {p.status === 'pending' && (
                        <button onClick={() => {
                          setPayouts(prev => prev.map(x => x.id === p.id ? { ...x, status: 'processed' } : x))
                          showToast(`Payout of $${p.amount} processed ✓`)
                        }} style={{
                          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                          color: '#22C55E', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                        }}>Process</button>
                      )}
                      {p.status === 'failed' && (
                        <button onClick={() => {
                          setPayouts(prev => prev.map(x => x.id === p.id ? { ...x, status: 'pending' } : x))
                          showToast('Payout queued for retry.')
                        }} style={{
                          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                          color: '#F59E0B', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                        }}>Retry</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions */}
      <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: '0 0 16px', fontSize: '15px' }}>Client Transactions</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1A2235' }}>
                {['ID', 'Client ID', 'Type', 'Amount', 'Balance Before', 'Balance After', 'Description', 'Date'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px', color: '#4B5563', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #1A2235', background: i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'none' }}>
                  <td style={{ padding: '10px', color: '#4B5563', fontFamily: 'monospace', fontSize: '11px' }}>#{t.id}</td>
                  <td style={{ padding: '10px', color: '#8B9BB4' }}>{t.clientId}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      background: t.type === 'deposit' ? 'rgba(34,197,94,0.1)' : t.type === 'refund' ? 'rgba(59,130,246,0.1)' : 'rgba(201,168,76,0.08)',
                      color: t.type === 'deposit' ? '#22C55E' : t.type === 'refund' ? '#3B82F6' : '#C9A84C',
                      borderRadius: '4px', padding: '2px 7px', fontSize: '11px', fontWeight: 600,
                    }}>{t.type.replace('_', ' ')}</span>
                  </td>
                  <td style={{ padding: '10px', color: t.amount > 0 ? '#22C55E' : '#EF4444', fontWeight: 600 }}>
                    {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: '10px', color: '#8B9BB4' }}>${t.balanceBefore.toFixed(2)}</td>
                  <td style={{ padding: '10px', color: '#8B9BB4' }}>${t.balanceAfter.toFixed(2)}</td>
                  <td style={{ padding: '10px', color: '#8B9BB4', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</td>
                  <td style={{ padding: '10px', color: '#4B5563', fontSize: '12px', whiteSpace: 'nowrap' }}>{t.createdAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
