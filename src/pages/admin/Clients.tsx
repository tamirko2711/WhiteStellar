// ============================================================
// WhiteStellar — Super Admin: Clients
// src/pages/admin/Clients.tsx
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { Search, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react'
import { CLIENTS, SESSIONS, type Client, type AccountStatus } from '../../data/advisors'
import Toast from '../../components/Toast'

// ─── Types ────────────────────────────────────────────────────

type ClientRow = Client & { _status: AccountStatus }

// ─── Status badge ─────────────────────────────────────────────

function StatusBadge({ status }: { status: AccountStatus }) {
  const MAP = {
    active:   { bg: 'rgba(34,197,94,0.1)',  color: '#22C55E', label: 'Active'   },
    frozen:   { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6', label: 'Frozen'   },
    inactive: { bg: 'rgba(239,68,68,0.1)',  color: '#EF4444', label: 'Blocked'  },
    pending:  { bg: 'rgba(75,85,99,0.1)',   color: '#6B7280', label: 'Pending'  },
  }
  const c = MAP[status] ?? MAP.inactive
  return (
    <span style={{
      background: c.bg, color: c.color,
      borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600,
    }}>{c.label}</span>
  )
}

// ─── Confirm modal ────────────────────────────────────────────

function ConfirmModal({ title, body, confirmLabel, confirmColor = '#EF4444', onConfirm, onClose }: {
  title: string; body: string; confirmLabel: string; confirmColor?: string; onConfirm: () => void; onClose: () => void
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%' }}>
        <h3 style={{ color: '#F0F4FF', fontWeight: 700, margin: '0 0 8px' }}>{title}</h3>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6 }}>{body}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #1A2235', background: '#1A2540', color: '#8B9BB4', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: confirmColor, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ─── 3-dot menu ───────────────────────────────────────────────

function Dot3Menu({ onBlock, onFreeze, onDelete }: { onBlock: () => void; onFreeze: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const items = [
    { label: 'Block', danger: false, action: onBlock },
    { label: 'Freeze', danger: false, action: onFreeze },
    { label: 'Send Email', danger: false, action: () => {} },
    { label: 'Delete Account', danger: true, action: onDelete },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4', padding: '4px', display: 'flex' }}>
        <MoreVertical size={15} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: '#0D1221', border: '1px solid #1A2235', borderRadius: '10px', padding: '6px', minWidth: '160px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {items.map(item => (
            <button key={item.label} onClick={() => { item.action(); setOpen(false) }}
              style={{ display: 'block', width: '100%', padding: '8px 10px', borderRadius: '7px', background: 'none', border: 'none', cursor: 'pointer', color: item.danger ? '#EF4444' : '#8B9BB4', fontSize: '13px', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Client row ───────────────────────────────────────────────

const COUNTRY_FLAGS: Record<string, string> = {
  'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Canada': '🇨🇦',
  'Australia': '🇦🇺', 'Germany': '🇩🇪', 'France': '🇫🇷',
}

function ClientTableRow({ client, expanded, onToggle, onStatusChange, onDelete, showToast }: {
  client: ClientRow; expanded: boolean; onToggle: () => void
  onStatusChange: (id: number, s: AccountStatus) => void
  onDelete: (id: number) => void
  showToast: (msg: string) => void
}) {
  const [confirm, setConfirm] = useState<{ title: string; body: string; confirmLabel: string; confirmColor: string; action: () => void } | null>(null)
  const clientSessions = SESSIONS.filter(s => s.clientId === client.id)
  const flag = COUNTRY_FLAGS[client.country] ?? '🌐'

  return (
    <>
      <tr style={{ borderBottom: expanded ? 'none' : '1px solid #1A2235', cursor: 'pointer' }} onClick={onToggle}>
        <td style={{ padding: '14px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={client.avatar} alt={client.fullName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px', margin: '0 0 2px' }}>{client.fullName}</p>
              <p style={{ color: '#4B5563', fontSize: '11px', margin: 0 }}>{client.email}</p>
            </div>
          </div>
        </td>
        <td style={{ padding: '14px 12px', color: '#4B5563', fontSize: '12px' }}>{flag} {client.country}</td>
        <td style={{ padding: '14px 12px' }}><StatusBadge status={client._status} /></td>
        <td style={{ padding: '14px 12px', color: '#8B9BB4', fontSize: '13px' }}>{client.totalSessions}</td>
        <td style={{ padding: '14px 12px', color: '#C9A84C', fontWeight: 600, fontSize: '13px' }}>${client.totalSpent.toFixed(2)}</td>
        <td style={{ padding: '14px 12px', color: '#4B5563', fontSize: '12px' }}>{client.joinedAt}</td>
        <td style={{ padding: '14px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={e => e.stopPropagation()}>
            <button onClick={onToggle} style={{ background: '#1A2540', border: '1px solid #1A2235', color: '#8B9BB4', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />} View
            </button>
            <Dot3Menu
              onBlock={() => setConfirm({ title: `Block ${client.fullName}?`, body: 'This client will not be able to book sessions.', confirmLabel: 'Block', confirmColor: '#EF4444', action: () => { onStatusChange(client.id, 'inactive'); showToast('Client blocked.') } })}
              onFreeze={() => setConfirm({ title: `Freeze ${client.fullName}?`, body: 'Their account will be temporarily suspended.', confirmLabel: 'Freeze', confirmColor: '#3B82F6', action: () => { onStatusChange(client.id, 'frozen'); showToast('Client frozen.') } })}
              onDelete={() => setConfirm({ title: 'Delete Account?', body: 'This permanently removes all client data.', confirmLabel: 'Delete', confirmColor: '#EF4444', action: () => { onDelete(client.id); showToast('Client deleted.') } })}
            />
          </div>
        </td>
      </tr>

      {/* Accordion */}
      {expanded && (
        <tr>
          <td colSpan={7} style={{ borderBottom: '1px solid #1A2235', padding: 0 }}>
            <div style={{ background: '#080C16', padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <img src={client.avatar} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%' }} />
                <div>
                  <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '15px', margin: '0 0 2px' }}>{client.fullName}</p>
                  <p style={{ color: '#4B5563', fontSize: '12px', margin: '0 0 2px' }}>{client.email} · {client.phone}</p>
                  <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>{flag} {client.country} · Joined {client.joinedAt}</p>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '18px', margin: '0 0 2px' }}>${client.walletBalance.toFixed(2)}</p>
                  <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>Wallet balance</p>
                </div>
              </div>
              <p style={{ color: '#4B5563', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Last Sessions</p>
              {clientSessions.slice(0, 3).map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#0D1221', borderRadius: '8px', padding: '8px 12px', marginBottom: '4px', fontSize: '12px' }}>
                  <span style={{ color: '#8B9BB4' }}>{s.advisorName} · {s.type} · {s.durationMinutes} min</span>
                  <span style={{ color: '#C9A84C', fontWeight: 600 }}>${s.totalCost.toFixed(2)}</span>
                </div>
              ))}
              {clientSessions.length === 0 && <p style={{ color: '#4B5563', fontSize: '12px' }}>No sessions yet.</p>}
            </div>
          </td>
        </tr>
      )}

      {confirm && (
        <ConfirmModal {...confirm} onConfirm={() => { confirm.action(); setConfirm(null) }} onClose={() => setConfirm(null)} />
      )}
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function AdminClients() {
  const [clients, setClients] = useState<ClientRow[]>(CLIENTS.map(c => ({ ...c, _status: c.accountStatus })))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [toast, setToast] = useState({ msg: '', visible: false })

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  function handleStatusChange(id: number, status: AccountStatus) {
    setClients(prev => prev.map(c => c.id === id ? { ...c, _status: status } : c))
  }

  function handleDelete(id: number) {
    setClients(prev => prev.filter(c => c.id !== id))
  }

  const filtered = clients
    .filter(c => {
      if (search && !c.fullName.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && c._status !== statusFilter) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'sessions') return b.totalSessions - a.totalSessions
      if (sort === 'spent') return b.totalSpent - a.totalSpent
      if (sort === 'alpha') return a.fullName.localeCompare(b.fullName)
      return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
    })

  const selectStyle = { background: '#0D1221', border: '1px solid #1A2235', borderRadius: '8px', padding: '8px 12px', color: '#F0F4FF', fontSize: '13px', outline: 'none', cursor: 'pointer' }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>Clients</h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>Manage client accounts across the platform.</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={13} color="#4B5563" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" style={{ ...selectStyle, paddingLeft: '30px', width: '100%', boxSizing: 'border-box' }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Blocked</option>
          <option value="frozen">Frozen</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} style={selectStyle}>
          <option value="newest">Newest</option>
          <option value="sessions">Most Sessions</option>
          <option value="spent">Highest Spend</option>
          <option value="alpha">Alphabetical</option>
        </select>
      </div>

      <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1A2235', background: '#080C16' }}>
                {['Client', 'Country', 'Status', 'Sessions', 'Total Spent', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px', color: '#4B5563', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <ClientTableRow
                  key={c.id}
                  client={c}
                  expanded={expandedId === c.id}
                  onToggle={() => setExpandedId(prev => prev === c.id ? null : c.id)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  showToast={showToast}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '14px 16px', borderTop: '1px solid #1A2235' }}>
          <span style={{ color: '#4B5563', fontSize: '13px' }}>Showing {filtered.length} of 12,847 clients</span>
        </div>
      </div>

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}
