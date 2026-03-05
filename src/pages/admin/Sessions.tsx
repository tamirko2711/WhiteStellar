// ============================================================
// WhiteStellar — Super Admin: Sessions
// src/pages/admin/Sessions.tsx
// ============================================================

import { useState } from 'react'
import { format } from 'date-fns'
import { Download, ChevronDown, ChevronUp, MessageCircle, Phone, Video } from 'lucide-react'
import { SESSIONS, ADVISORS } from '../../data/advisors'

// ─── Summary bar ──────────────────────────────────────────────

const SUMMARY = [
  { label: 'Active Now', value: '0',     color: '#22C55E' },
  { label: 'Today',      value: '142',   color: '#C9A84C' },
  { label: 'This Week',  value: '876',   color: '#C9A84C' },
  { label: 'This Month', value: '3,876', color: '#C9A84C' },
]

// ─── Type icon ────────────────────────────────────────────────

function TypeIcon({ type }: { type: string }) {
  const map: Record<string, React.ReactNode> = {
    chat: <MessageCircle size={13} />, audio: <Phone size={13} />, video: <Video size={13} />,
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: 'rgba(201,168,76,0.08)', color: '#C9A84C',
      border: '1px solid rgba(201,168,76,0.2)', borderRadius: '4px', padding: '2px 7px', fontSize: '11px',
    }}>
      {map[type]} {type}
    </span>
  )
}

// ─── Session row ──────────────────────────────────────────────

function SessionRow({ session, expanded, onToggle }: {
  session: typeof SESSIONS[0]; expanded: boolean; onToggle: () => void
}) {
  const advisor = ADVISORS.find(a => a.id === session.advisorId)

  return (
    <>
      <tr style={{ borderBottom: expanded ? 'none' : '1px solid #1A2235' }}>
        <td style={{ padding: '12px', color: '#4B5563', fontSize: '11px', fontFamily: 'monospace' }}>#{session.id}</td>
        <td style={{ padding: '12px' }}>
          <span style={{ color: '#F0F4FF', fontSize: '13px' }}>{session.clientName}</span>
        </td>
        <td style={{ padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {advisor && <img src={advisor.avatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />}
            <span style={{ color: '#F0F4FF', fontSize: '13px' }}>{session.advisorName}</span>
          </div>
        </td>
        <td style={{ padding: '12px' }}><TypeIcon type={session.type} /></td>
        <td style={{ padding: '12px', color: '#8B9BB4', fontSize: '13px' }}>{session.durationMinutes} min</td>
        <td style={{ padding: '12px', color: '#C9A84C', fontWeight: 600, fontSize: '13px' }}>${session.totalCost.toFixed(2)}</td>
        <td style={{ padding: '12px', color: '#4B5563', fontSize: '12px' }}>${(session.totalCost * 0.3).toFixed(2)}</td>
        <td style={{ padding: '12px' }}>
          <span style={{
            background: session.status === 'completed' ? 'rgba(34,197,94,0.1)' : session.status === 'cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
            color: session.status === 'completed' ? '#22C55E' : session.status === 'cancelled' ? '#EF4444' : '#F59E0B',
            borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600,
          }}>{session.status}</span>
        </td>
        <td style={{ padding: '12px', color: '#4B5563', fontSize: '12px' }}>
          {format(new Date(session.startedAt), 'MMM d, HH:mm')}
        </td>
        <td style={{ padding: '12px' }}>
          <button onClick={onToggle} style={{
            background: '#1A2540', border: '1px solid #1A2235', color: '#8B9BB4',
            borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />} Details
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={10} style={{ borderBottom: '1px solid #1A2235', padding: 0 }}>
            <div style={{ background: '#080C16', padding: '14px 20px', display: 'flex', gap: '32px', flexWrap: 'wrap', fontSize: '13px' }}>
              <InfoItem label="Session ID" value={`#${session.id}`} />
              <InfoItem label="Rate" value={`$${session.pricePerMinute}/min`} />
              <InfoItem label="Platform Fee" value={`$${(session.totalCost * 0.3).toFixed(2)} (30%)`} />
              <InfoItem label="Advisor Earnings" value={`$${(session.totalCost * 0.7).toFixed(2)} (70%)`} />
              <InfoItem label="Start" value={format(new Date(session.startedAt), 'MMM d, yyyy HH:mm')} />
              <InfoItem label="End" value={format(new Date(session.endedAt), 'MMM d, yyyy HH:mm')} />
              {session.notes && <InfoItem label="Notes" value={session.notes} />}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ color: '#4B5563', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', margin: '0 0 2px' }}>{label}</p>
      <p style={{ color: '#F0F4FF', margin: 0 }}>{value}</p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function AdminSessions() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [advisorFilter, setAdvisorFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const filtered = SESSIONS
    .filter(s => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (typeFilter !== 'all' && s.type !== typeFilter) return false
      if (advisorFilter !== 'all' && String(s.advisorId) !== advisorFilter) return false
      return true
    })

  const selectStyle = { background: '#0D1221', border: '1px solid #1A2235', borderRadius: '8px', padding: '8px 12px', color: '#F0F4FF', fontSize: '13px', outline: 'none', cursor: 'pointer' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>Sessions</h1>
          <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>Monitor all platform sessions.</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1A2540', border: '1px solid #1A2235', color: '#8B9BB4', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {SUMMARY.map(s => (
          <div key={s.label} style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '12px', padding: '14px 20px', flex: '1 1 120px', textAlign: 'center' }}>
            <p style={{ color: s.label === 'Active Now' ? '#22C55E' : '#C9A84C', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>{s.value}</p>
            <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="in_progress">In Progress</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Types</option>
          <option value="chat">Chat</option>
          <option value="audio">Audio</option>
          <option value="video">Video</option>
        </select>
        <select value={advisorFilter} onChange={e => setAdvisorFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Advisors</option>
          {ADVISORS.map(a => <option key={a.id} value={String(a.id)}>{a.fullName}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1A2235', background: '#080C16' }}>
                {['ID', 'Client', 'Advisor', 'Type', 'Duration', 'Cost', 'Platform Fee', 'Status', 'Date', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', padding: '12px', color: '#4B5563', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <SessionRow
                  key={s.id}
                  session={s}
                  expanded={expandedId === s.id}
                  onToggle={() => setExpandedId(prev => prev === s.id ? null : s.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '14px 16px', borderTop: '1px solid #1A2235' }}>
          <span style={{ color: '#4B5563', fontSize: '13px' }}>Showing {filtered.length} sessions</span>
        </div>
      </div>
    </div>
  )
}
