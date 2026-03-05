// ============================================================
// WhiteStellar — Super Admin: Reviews
// src/pages/admin/Reviews.tsx
// ============================================================

import { useState } from 'react'
import { Star, Check, X, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ADVISORS } from '../../data/advisors'
import Toast from '../../components/Toast'

// ─── Collect all reviews from all advisors ────────────────────

interface AdminReview {
  id: number
  advisorId: number
  advisorName: string
  clientName: string
  clientAvatar: string
  rating: number
  comment: string
  sessionType: string
  createdAt: string
  isApproved: boolean
  status: 'approved' | 'pending' | 'rejected'
}

const ALL_REVIEWS: AdminReview[] = ADVISORS.flatMap(a =>
  a.reviews.map(r => ({
    ...r,
    advisorId: a.id,
    advisorName: a.fullName,
    status: (r.isApproved ? 'approved' : 'pending') as AdminReview['status'],
  }))
)

// Extra dummy reviews for richer demo
const EXTRA: AdminReview[] = [
  {
    id: 100, advisorId: 2, advisorName: 'Marcus Veil',
    clientName: 'Oliver W.', clientAvatar: 'https://i.pravatar.cc/40?img=60',
    rating: 2, comment: 'Reading felt very generic, not specific to my situation.',
    sessionType: 'chat', createdAt: '2024-11-10', isApproved: false, status: 'pending',
  },
  {
    id: 101, advisorId: 6, advisorName: 'Iris Moonwell',
    clientName: 'Priya N.', clientAvatar: 'https://i.pravatar.cc/40?img=49',
    rating: 5, comment: 'Iris connected to my dream patterns instantly. Profound session.',
    sessionType: 'video', createdAt: '2024-11-12', isApproved: false, status: 'pending',
  },
]

type RatingFilter = 'all' | '5' | '4' | '3' | '1-2'
type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected'

// ─── Stars ────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13} fill={i <= rating ? '#C9A84C' : 'transparent'} color={i <= rating ? '#C9A84C' : '#4B5563'} />
      ))}
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────

function StatusBadge({ status }: { status: AdminReview['status'] }) {
  const MAP = {
    approved: { bg: 'rgba(34,197,94,0.1)', color: '#22C55E', label: 'Approved' },
    pending:  { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', label: 'Pending'  },
    rejected: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', label: 'Rejected' },
  }
  const c = MAP[status]
  return (
    <span style={{ background: c.bg, color: c.color, borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>
      {c.label}
    </span>
  )
}

// ─── Review card ──────────────────────────────────────────────

function ReviewCard({ review, onApprove, onReject, onDelete }: {
  review: AdminReview
  onApprove: () => void
  onReject: () => void
  onDelete: () => void
}) {
  return (
    <div style={{
      background: '#0D1221', border: '1px solid #1A2235',
      borderRadius: '14px', padding: '18px 20px', marginBottom: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={review.clientAvatar} alt={review.clientName} style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
          <div>
            <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px', margin: '0 0 2px' }}>{review.clientName}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Stars rating={review.rating} />
              <span style={{ color: '#4B5563', fontSize: '11px' }}>
                for <strong style={{ color: '#C9A84C' }}>{review.advisorName}</strong>
                {' '}· via {review.sessionType}
                {' '}· {format(new Date(review.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={review.status} />
      </div>

      <p style={{ color: '#CBD5E1', fontSize: '14px', lineHeight: 1.6, margin: '0 0 14px' }}>
        "{review.comment}"
      </p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {review.status !== 'approved' && (
          <button onClick={onApprove} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#22C55E', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
          }}>
            <Check size={12} /> Approve
          </button>
        )}
        {review.status !== 'rejected' && (
          <button onClick={onReject} style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#EF4444', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
          }}>
            <X size={12} /> Reject
          </button>
        )}
        <button onClick={onDelete} style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: 'none', border: '1px solid #1A2235',
          color: '#4B5563', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px',
        }}>
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function AdminReviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([...ALL_REVIEWS, ...EXTRA])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all')
  const [advisorFilter, setAdvisorFilter] = useState('all')
  const [toast, setToast] = useState({ msg: '', visible: false })

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  function updateStatus(id: number, status: AdminReview['status']) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    showToast(status === 'approved' ? 'Review approved ✓' : 'Review rejected.')
  }

  function deleteReview(id: number) {
    setReviews(prev => prev.filter(r => r.id !== id))
    showToast('Review deleted.')
  }

  const filtered = reviews.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (advisorFilter !== 'all' && String(r.advisorId) !== advisorFilter) return false
    if (ratingFilter === '5') return r.rating === 5
    if (ratingFilter === '4') return r.rating === 4
    if (ratingFilter === '3') return r.rating === 3
    if (ratingFilter === '1-2') return r.rating <= 2
    return true
  })

  const selectStyle = { background: '#0D1221', border: '1px solid #1A2235', borderRadius: '8px', padding: '8px 12px', color: '#F0F4FF', fontSize: '13px', outline: 'none', cursor: 'pointer' }

  const PILL_STATUS: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: `All (${reviews.length})` },
    { key: 'pending', label: `Pending (${reviews.filter(r => r.status === 'pending').length})` },
    { key: 'approved', label: `Approved (${reviews.filter(r => r.status === 'approved').length})` },
    { key: 'rejected', label: `Rejected (${reviews.filter(r => r.status === 'rejected').length})` },
  ]

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>Reviews</h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>Moderate and manage client reviews.</p>
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {PILL_STATUS.map(p => (
            <button key={p.key} onClick={() => setStatusFilter(p.key)} style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
              fontWeight: statusFilter === p.key ? 600 : 400,
              border: '1px solid', borderColor: statusFilter === p.key ? '#C9A84C' : '#1A2235',
              background: statusFilter === p.key ? 'rgba(201,168,76,0.1)' : '#0D1221',
              color: statusFilter === p.key ? '#C9A84C' : '#8B9BB4',
            }}>{p.label}</button>
          ))}
        </div>
        <select value={advisorFilter} onChange={e => setAdvisorFilter(e.target.value)} style={selectStyle}>
          <option value="all">All Advisors</option>
          {ADVISORS.map(a => <option key={a.id} value={String(a.id)}>{a.fullName}</option>)}
        </select>
        <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value as RatingFilter)} style={selectStyle}>
          <option value="all">All Ratings</option>
          <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
          <option value="4">⭐⭐⭐⭐ 4 Stars</option>
          <option value="3">⭐⭐⭐ 3 Stars</option>
          <option value="1-2">⭐⭐ 1-2 Stars</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#4B5563' }}>
          <Star size={36} strokeWidth={1} style={{ marginBottom: '10px', opacity: 0.4 }} />
          <p style={{ margin: 0 }}>No reviews match this filter.</p>
        </div>
      ) : (
        filtered.map(r => (
          <ReviewCard
            key={r.id}
            review={r}
            onApprove={() => updateStatus(r.id, 'approved')}
            onReject={() => updateStatus(r.id, 'rejected')}
            onDelete={() => deleteReview(r.id)}
          />
        ))
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}
