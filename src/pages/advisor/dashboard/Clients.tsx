// ============================================================
// WhiteStellar — Advisor Dashboard: My Clients
// src/pages/advisor/dashboard/Clients.tsx
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Search, MoreVertical, ChevronDown, ChevronUp, X,
  MessageCircle, Phone, Video, FileText, Ban, Undo2,
  User, Calendar, DollarSign,
} from 'lucide-react'
import { CLIENTS, getSessionsByAdvisor } from '../../../data/advisors'

// ─── Types ────────────────────────────────────────────────────

type FilterPill = 'all' | 'active' | 'blocked'

interface ClientMeta {
  clientId: number
  fullName: string
  avatar: string
  email: string
  totalSessions: number
  totalSpent: number   // advisor's cut
  lastSession: string
  blocked: boolean
  note: string
}

// ─── Build client CRM rows from advisor 1 sessions ────────────

function buildClients(): ClientMeta[] {
  const sessions = getSessionsByAdvisor(1)
  const map: Record<number, ClientMeta> = {}

  sessions.forEach(s => {
    const client = CLIENTS.find(c => c.id === s.clientId)
    if (!client) return
    if (!map[s.clientId]) {
      map[s.clientId] = {
        clientId: s.clientId,
        fullName: client.fullName,
        avatar: client.avatar,
        email: client.email,
        totalSessions: 0,
        totalSpent: 0,
        lastSession: s.startedAt,
        blocked: false,
        note: '',
      }
    }
    map[s.clientId].totalSessions++
    map[s.clientId].totalSpent += s.totalCost * 0.7
    if (s.startedAt > map[s.clientId].lastSession) {
      map[s.clientId].lastSession = s.startedAt
    }
  })

  // Add dummy extra client for variety
  if (!map[202]) {
    const c = CLIENTS.find(c => c.id === 202)
    if (c) {
      map[202] = {
        clientId: 202,
        fullName: c.fullName,
        avatar: c.avatar,
        email: c.email,
        totalSessions: 3,
        totalSpent: 122.26,
        lastSession: '2024-10-28T18:35:00Z',
        blocked: false,
        note: 'Prefers audio sessions. Interested in career guidance.',
      }
    }
  }

  return Object.values(map)
}

const INITIAL_CLIENTS = buildClients()

// ─── Sub-components ───────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    chat: <MessageCircle size={10} />,
    audio: <Phone size={10} />,
    video: <Video size={10} />,
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
      border: '1px solid rgba(201,168,76,0.2)',
      borderRadius: '4px', padding: '1px 6px', fontSize: '11px',
    }}>
      {icons[type]} {type}
    </span>
  )
}

function Dot3Menu({
  blocked, onNote, onBlock, onUnblock,
}: {
  blocked: boolean
  onNote: () => void
  onBlock: () => void
  onUnblock: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#8B9BB4', padding: '4px', borderRadius: '6px',
          display: 'flex', alignItems: 'center',
        }}
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', zIndex: 50,
          background: '#141C2E', border: '1px solid #1E2D45',
          borderRadius: '10px', padding: '6px', minWidth: '160px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <MenuItem icon={<FileText size={13} />} label="Add Note" onClick={() => { onNote(); setOpen(false) }} />
          {blocked
            ? <MenuItem icon={<Undo2 size={13} />} label="Unblock Client" onClick={() => { onUnblock(); setOpen(false) }} danger={false} />
            : <MenuItem icon={<Ban size={13} />} label="Block Client" onClick={() => { onBlock(); setOpen(false) }} danger />
          }
        </div>
      )}
    </div>
  )
}

function MenuItem({
  icon, label, onClick, danger = false,
}: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        width: '100%', padding: '8px 10px', borderRadius: '7px',
        background: hov ? (danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)') : 'none',
        border: 'none', cursor: 'pointer',
        color: hov ? (danger ? '#EF4444' : '#F0F4FF') : '#8B9BB4',
        fontSize: '13px', textAlign: 'left',
      }}
    >
      {icon} {label}
    </button>
  )
}

// ─── Block Confirm Modal ──────────────────────────────────────

function BlockModal({
  client, onConfirm, onCancel,
}: { client: ClientMeta; onConfirm: () => void; onCancel: () => void }) {
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
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'rgba(239,68,68,0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
        }}>
          <Ban size={22} color="#EF4444" />
        </div>
        <h3 style={{ color: '#F0F4FF', fontWeight: 700, margin: '0 0 8px', fontSize: '17px' }}>
          Block {client.fullName}?
        </h3>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6 }}>
          This client will no longer be able to send you session requests. You can unblock them at any time.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              background: '#1A2540', border: '1px solid #1E2D45',
              color: '#8B9BB4', fontSize: '14px', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              background: '#EF4444', border: 'none',
              color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Block Client
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Note Modal ───────────────────────────────────────────────

function NoteModal({
  client, onSave, onClose,
}: { client: ClientMeta; onSave: (note: string) => void; onClose: () => void }) {
  const [note, setNote] = useState(client.note)
  const MAX = 800

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#0F1828', border: '1px solid #1E2D45',
        borderRadius: '16px', padding: '28px', maxWidth: '480px', width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ color: '#F0F4FF', fontWeight: 700, margin: 0, fontSize: '17px' }}>
            Private Note — {client.fullName}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4' }}>
            <X size={18} />
          </button>
        </div>
        <p style={{ color: '#4B5563', fontSize: '12px', margin: '0 0 12px' }}>
          Only you can see this note. It is never shared with the client.
        </p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value.slice(0, MAX))}
          rows={6}
          placeholder="Add private notes about this client..."
          style={{
            width: '100%', background: '#1A2540', border: '1px solid #1E2D45',
            borderRadius: '10px', padding: '12px', color: '#F0F4FF',
            fontSize: '14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ color: '#4B5563', fontSize: '12px' }}>{note.length}/{MAX}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{
              padding: '8px 16px', borderRadius: '8px',
              background: '#1A2540', border: '1px solid #1E2D45',
              color: '#8B9BB4', cursor: 'pointer', fontSize: '13px',
            }}>
              Cancel
            </button>
            <button
              onClick={() => { onSave(note); onClose() }}
              style={{
                padding: '8px 16px', borderRadius: '8px',
                background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
                border: 'none', color: '#0B0F1A', fontWeight: 700,
                cursor: 'pointer', fontSize: '13px',
              }}
            >
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Client Row ───────────────────────────────────────────────

function ClientRow({
  client, expanded, onToggle, onNote, onBlock, onUnblock, sessions,
}: {
  client: ClientMeta
  expanded: boolean
  onToggle: () => void
  onNote: () => void
  onBlock: () => void
  onUnblock: () => void
  sessions: ReturnType<typeof getSessionsByAdvisor>
}) {
  const clientSessions = sessions.filter(s => s.clientId === client.clientId)

  return (
    <div style={{
      background: '#0F1828', border: `1px solid ${client.blocked ? 'rgba(239,68,68,0.25)' : '#1E2D45'}`,
      borderRadius: '14px', overflow: 'hidden', marginBottom: '10px',
      opacity: client.blocked ? 0.7 : 1,
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '16px 20px', cursor: 'pointer',
      }} onClick={onToggle}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={client.avatar}
            alt={client.fullName}
            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
          />
          {client.blocked && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(239,68,68,0.3)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ban size={16} color="#EF4444" />
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '15px' }}>{client.fullName}</span>
            {client.blocked && (
              <span style={{
                background: 'rgba(239,68,68,0.1)', color: '#EF4444',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '20px', padding: '1px 8px', fontSize: '10px', fontWeight: 600,
              }}>
                Blocked
              </span>
            )}
            {client.note && (
              <span style={{
                background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
                border: '1px solid rgba(201,168,76,0.2)',
                borderRadius: '20px', padding: '1px 8px', fontSize: '10px', fontWeight: 600,
              }}>
                Note
              </span>
            )}
          </div>
          <span style={{ color: '#8B9BB4', fontSize: '12px' }}>{client.email}</span>
        </div>

        {/* Stats — hidden on mobile */}
        <div className="hidden md:flex" style={{ gap: '28px' }}>
          <Stat icon={<Calendar size={13} />} label="Sessions" value={String(client.totalSessions)} />
          <Stat icon={<DollarSign size={13} />} label="Revenue" value={`$${client.totalSpent.toFixed(0)}`} />
          <Stat icon={<User size={13} />} label="Last seen" value={format(new Date(client.lastSession), 'MMM d')} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <Dot3Menu
            blocked={client.blocked}
            onNote={onNote}
            onBlock={onBlock}
            onUnblock={onUnblock}
          />
          <button
            onClick={e => { e.stopPropagation(); onToggle() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4', padding: '4px' }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Accordion */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1E2D45', padding: '16px 20px', background: '#0B0F1A' }}>
          {/* Private note */}
          {client.note && (
            <div style={{
              background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)',
              borderRadius: '10px', padding: '12px 14px', marginBottom: '14px',
            }}>
              <p style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Private Note
              </p>
              <p style={{ color: '#C9A84C', fontSize: '13px', margin: 0, opacity: 0.9 }}>{client.note}</p>
            </div>
          )}

          {/* Session history */}
          <p style={{ color: '#4B5563', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
            Session History
          </p>
          {clientSessions.length === 0 ? (
            <p style={{ color: '#4B5563', fontSize: '13px' }}>No sessions yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {clientSessions.map(s => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#0F1828', borderRadius: '8px', padding: '10px 14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TypeBadge type={s.type} />
                    <span style={{ color: '#8B9BB4', fontSize: '12px' }}>
                      {format(new Date(s.startedAt), 'MMM d, yyyy')} · {s.durationMinutes} min
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                      background: s.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: s.status === 'completed' ? '#22C55E' : '#EF4444',
                    }}>
                      {s.status}
                    </span>
                    <span style={{ color: '#C9A84C', fontWeight: 600, fontSize: '13px' }}>
                      ${(s.totalCost * 0.7).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4B5563', fontSize: '11px', marginBottom: '2px' }}>
        {icon} {label}
      </div>
      <span style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px' }}>{value}</span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────

export default function AdvisorClients() {
  const [clients, setClients] = useState<ClientMeta[]>(INITIAL_CLIENTS)
  const [filter, setFilter] = useState<FilterPill>('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [blockTarget, setBlockTarget] = useState<ClientMeta | null>(null)
  const [noteTarget, setNoteTarget] = useState<ClientMeta | null>(null)

  const sessions = getSessionsByAdvisor(1)

  const filtered = clients
    .filter(c => {
      if (filter === 'active') return !c.blocked
      if (filter === 'blocked') return c.blocked
      return true
    })
    .filter(c => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    })

  function toggleExpand(id: number) {
    setExpandedId(prev => prev === id ? null : id)
  }

  function handleBlock(id: number) {
    setClients(prev => prev.map(c => c.clientId === id ? { ...c, blocked: true } : c))
    setBlockTarget(null)
  }

  function handleUnblock(id: number) {
    setClients(prev => prev.map(c => c.clientId === id ? { ...c, blocked: false } : c))
  }

  function handleSaveNote(id: number, note: string) {
    setClients(prev => prev.map(c => c.clientId === id ? { ...c, note } : c))
  }

  const PILLS: { key: FilterPill; label: string }[] = [
    { key: 'all', label: `All Clients (${clients.length})` },
    { key: 'active', label: `Active (${clients.filter(c => !c.blocked).length})` },
    { key: 'blocked', label: `Blocked (${clients.filter(c => c.blocked).length})` },
  ]

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>
          My Clients
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
          View and manage all clients you've had sessions with.
        </p>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={14} color="#4B5563" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{
              width: '100%', background: '#0F1828', border: '1px solid #1E2D45',
              borderRadius: '10px', padding: '10px 12px 10px 36px',
              color: '#F0F4FF', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PILLS.map(p => (
            <button
              key={p.key}
              onClick={() => setFilter(p.key)}
              style={{
                padding: '7px 14px', borderRadius: '20px', fontSize: '13px',
                fontWeight: filter === p.key ? 600 : 400, cursor: 'pointer',
                border: '1px solid',
                borderColor: filter === p.key ? '#C9A84C' : '#1E2D45',
                background: filter === p.key ? 'rgba(201,168,76,0.1)' : '#0F1828',
                color: filter === p.key ? '#C9A84C' : '#8B9BB4',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#4B5563' }}>
          <User size={40} strokeWidth={1} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: '15px' }}>No clients found.</p>
        </div>
      ) : (
        filtered.map(client => (
          <ClientRow
            key={client.clientId}
            client={client}
            expanded={expandedId === client.clientId}
            onToggle={() => toggleExpand(client.clientId)}
            onNote={() => setNoteTarget(client)}
            onBlock={() => setBlockTarget(client)}
            onUnblock={() => handleUnblock(client.clientId)}
            sessions={sessions}
          />
        ))
      )}

      {/* Modals */}
      {blockTarget && (
        <BlockModal
          client={blockTarget}
          onConfirm={() => handleBlock(blockTarget.clientId)}
          onCancel={() => setBlockTarget(null)}
        />
      )}
      {noteTarget && (
        <NoteModal
          client={noteTarget}
          onSave={note => handleSaveNote(noteTarget.clientId, note)}
          onClose={() => setNoteTarget(null)}
        />
      )}
    </div>
  )
}
