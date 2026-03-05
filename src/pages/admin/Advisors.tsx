// ============================================================
// WhiteStellar — Super Admin: Advisors
// src/pages/admin/Advisors.tsx
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MoreVertical, Star } from 'lucide-react'
import { ADVISORS, CATEGORIES, type Advisor, type AccountStatus } from '../../data/advisors'
import Toast from '../../components/Toast'

// ─── Helpers ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: AccountStatus }) {
  const MAP = {
    active:   { bg: 'rgba(34,197,94,0.1)',   color: '#22C55E', border: 'rgba(34,197,94,0.25)',   label: 'Active'   },
    pending:  { bg: 'rgba(245,158,11,0.1)',  color: '#F59E0B', border: 'rgba(245,158,11,0.25)',  label: 'Pending'  },
    frozen:   { bg: 'rgba(59,130,246,0.1)',  color: '#3B82F6', border: 'rgba(59,130,246,0.25)',  label: 'Frozen'   },
    inactive: { bg: 'rgba(75,85,99,0.1)',    color: '#6B7280', border: 'rgba(75,85,99,0.25)',    label: 'Inactive' },
  }
  const c = MAP[status] ?? MAP.inactive
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600,
    }}>
      {c.label}
    </span>
  )
}

// ─── Confirm modal ────────────────────────────────────────────

function ConfirmModal({
  title, body, confirmLabel, confirmColor = '#EF4444', onConfirm, onClose,
}: {
  title: string; body: string; confirmLabel: string
  confirmColor?: string; onConfirm: () => void; onClose: () => void
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#0D1221', border: '1px solid #1A2235',
        borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%',
      }}>
        <h3 style={{ color: '#F0F4FF', fontWeight: 700, margin: '0 0 8px', fontSize: '17px' }}>{title}</h3>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6 }}>{body}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #1A2235',
            background: '#1A2540', color: '#8B9BB4', cursor: 'pointer', fontSize: '14px',
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
            background: confirmColor, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px',
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ─── 3-dot menu ───────────────────────────────────────────────

function Dot3Menu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const items = ['Edit Profile', 'View Public Profile', 'Send Email', 'Delete Account']

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4', padding: '4px',
        display: 'flex', alignItems: 'center',
      }}>
        <MoreVertical size={15} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', zIndex: 50,
          background: '#0D1221', border: '1px solid #1A2235',
          borderRadius: '10px', padding: '6px', minWidth: '160px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          {items.map(item => {
            const isDanger = item === 'Delete Account'
            return (
              <button
                key={item}
                onClick={() => { if (isDanger) onDelete(); setOpen(false) }}
                style={{
                  display: 'block', width: '100%', padding: '8px 10px',
                  borderRadius: '7px', background: 'none', border: 'none',
                  cursor: 'pointer', color: isDanger ? '#EF4444' : '#8B9BB4',
                  fontSize: '13px', textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = isDanger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                {item}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Advisor row ──────────────────────────────────────────────

function AdvisorRow({
  advisor, onStatusChange, onDelete,
}: {
  advisor: Advisor & { _status: AccountStatus }
  onStatusChange: (id: number, s: AccountStatus) => void
  onDelete: (id: number) => void
}) {
  const [confirm, setConfirm] = useState<{ action: string; label: string; color: string; next: AccountStatus } | null>(null)

  const actionMap: Record<AccountStatus, Array<{ label: string; color: string; next: AccountStatus }>> = {
    active:   [{ label: 'Freeze', color: '#F59E0B', next: 'frozen' }],
    pending:  [
      { label: 'Approve', color: '#22C55E', next: 'active' },
      { label: 'Reject',  color: '#EF4444', next: 'inactive' },
    ],
    frozen:   [{ label: 'Reactivate', color: '#22C55E', next: 'active' }],
    inactive: [{ label: 'Reactivate', color: '#22C55E', next: 'active' }],
  }

  const actions = actionMap[advisor._status] ?? []

  return (
    <>
      <tr style={{ borderBottom: '1px solid #1A2235' }}>
        <td style={{ padding: '14px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={advisor.avatar} alt={advisor.fullName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            <div>
              <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px', margin: '0 0 2px' }}>{advisor.fullName}</p>
              <p style={{ color: '#4B5563', fontSize: '11px', margin: 0, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{advisor.shortBio}</p>
            </div>
          </div>
        </td>
        <td style={{ padding: '14px 12px' }}>
          {advisor.categories[0] && (
            <span style={{
              background: '#1A2540', color: '#8B9BB4', borderRadius: '4px', padding: '2px 8px', fontSize: '11px',
            }}>
              {advisor.categories[0].title}
            </span>
          )}
        </td>
        <td style={{ padding: '14px 12px' }}>
          <StatusBadge status={advisor._status} />
        </td>
        <td style={{ padding: '14px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={12} fill="#C9A84C" color="#C9A84C" />
            <span style={{ color: '#F0F4FF', fontSize: '13px' }}>{advisor.rating}</span>
            <span style={{ color: '#4B5563', fontSize: '11px' }}>({advisor.reviewCount.toLocaleString()})</span>
          </div>
        </td>
        <td style={{ padding: '14px 12px', color: '#8B9BB4', fontSize: '13px' }}>
          {advisor.totalSessions.toLocaleString()}
        </td>
        <td style={{ padding: '14px 12px', color: '#8B9BB4', fontSize: '12px' }}>
          {advisor.joinedAt}
        </td>
        <td style={{ padding: '14px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <Link to={`/admin/advisors/${advisor.id}`} style={{
              background: '#1A2540', border: '1px solid #1A2235',
              color: '#8B9BB4', borderRadius: '6px', padding: '4px 10px',
              fontSize: '12px', textDecoration: 'none', fontWeight: 500,
            }}>
              View
            </Link>
            {actions.map(a => (
              <button key={a.label}
                onClick={() => setConfirm({ action: a.label, label: a.label, color: a.color, next: a.next })}
                style={{
                  background: `${a.color}18`, border: `1px solid ${a.color}50`,
                  color: a.color, borderRadius: '6px', padding: '4px 10px',
                  fontSize: '12px', cursor: 'pointer', fontWeight: 600,
                }}
              >
                {a.label}
              </button>
            ))}
            <Dot3Menu onDelete={() => onDelete(advisor.id)} />
          </div>
        </td>
      </tr>

      {confirm && (
        <ConfirmModal
          title={`${confirm.action} "${advisor.fullName}"?`}
          body={`This will update the advisor's account status to ${confirm.next}.`}
          confirmLabel={confirm.label}
          confirmColor={confirm.color}
          onConfirm={() => { onStatusChange(advisor.id, confirm.next); setConfirm(null) }}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function AdminAdvisors() {
  const [advisors, setAdvisors] = useState(ADVISORS.map(a => ({ ...a, _status: a.accountStatus })))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [toast, setToast] = useState({ msg: '', visible: false })

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  function handleStatusChange(id: number, status: AccountStatus) {
    setAdvisors(prev => prev.map(a => a.id === id ? { ...a, _status: status } : a))
    showToast(`Status updated to "${status}" ✓`)
  }

  function handleDelete(id: number) {
    setAdvisors(prev => prev.filter(a => a.id !== id))
    showToast('Advisor account deleted.')
  }

  const filtered = advisors
    .filter(a => {
      if (search && !a.fullName.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && a._status !== statusFilter) return false
      if (categoryFilter !== 'all' && !a.categories.some(c => c.slug === categoryFilter)) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'rating')   return b.rating - a.rating
      if (sort === 'sessions') return b.totalSessions - a.totalSessions
      if (sort === 'alpha')    return a.fullName.localeCompare(b.fullName)
      return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
    })

  const selectStyle = {
    background: '#0D1221', border: '1px solid #1A2235',
    borderRadius: '8px', padding: '8px 12px', color: '#F0F4FF',
    fontSize: '13px', outline: 'none', cursor: 'pointer',
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>Advisors</h1>
          <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>Manage all advisor accounts.</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={13} color="#4B5563" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search advisors…" style={{
            ...selectStyle, paddingLeft: '30px', width: '100%', boxSizing: 'border-box',
          }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="frozen">Frozen</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} style={selectStyle}>
          <option value="newest">Newest</option>
          <option value="rating">Highest Rated</option>
          <option value="sessions">Most Sessions</option>
          <option value="alpha">Alphabetical</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1A2235', background: '#080C16' }}>
                {['Advisor', 'Category', 'Status', 'Rating', 'Sessions', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '12px', color: '#4B5563',
                    fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <AdvisorRow
                  key={a.id}
                  advisor={a}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderTop: '1px solid #1A2235', flexWrap: 'wrap', gap: '10px',
        }}>
          <span style={{ color: '#4B5563', fontSize: '13px' }}>
            Showing 1–{filtered.length} of 248 advisors
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['← Prev', '1', '2', '3', '...', '41', 'Next →'].map((label, i) => (
              <button key={i} style={{
                padding: '5px 10px', borderRadius: '6px', fontSize: '12px',
                background: label === '1' ? 'rgba(201,168,76,0.1)' : '#1A2540',
                border: `1px solid ${label === '1' ? '#C9A84C' : '#1A2235'}`,
                color: label === '1' ? '#C9A84C' : '#8B9BB4', cursor: 'pointer',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}
