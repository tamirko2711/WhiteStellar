// ============================================================
// WhiteStellar — Advisor Dashboard: Reviews
// src/pages/advisor/dashboard/Reviews.tsx
// ============================================================

import { useState } from 'react'
import { Star, MessageSquare, X, Check } from 'lucide-react'
import { format } from 'date-fns'

// ─── Data ─────────────────────────────────────────────────────

interface ReviewRow {
  id: number
  clientName: string
  clientAvatar: string
  rating: number
  comment: string
  sessionType: string
  createdAt: string
  response?: string
}

// Expand on the dummy reviews to show a fuller page
const REVIEWS: ReviewRow[] = [
  {
    id: 1,
    clientName: 'Sarah M.',
    clientAvatar: 'https://i.pravatar.cc/40?img=5',
    rating: 5,
    comment: 'Luna is absolutely incredible. She picked up on details no one could have known. Life-changing reading.',
    sessionType: 'video',
    createdAt: '2024-11-15',
    response: 'Thank you so much Sarah! It was a joy connecting with you. I hope our session brought the clarity you were looking for. 🌟',
  },
  {
    id: 2,
    clientName: 'James T.',
    clientAvatar: 'https://i.pravatar.cc/40?img=12',
    rating: 5,
    comment: "Every session with Luna leaves me feeling grounded and clear. She's my go-to advisor.",
    sessionType: 'audio',
    createdAt: '2024-10-28',
  },
  {
    id: 3,
    clientName: 'Maria R.',
    clientAvatar: 'https://i.pravatar.cc/40?img=25',
    rating: 4,
    comment: 'Great reading, Luna was spot on about my career situation. Only downside was minor audio issues but that\'s probably on my end.',
    sessionType: 'audio',
    createdAt: '2024-10-05',
  },
  {
    id: 4,
    clientName: 'Chris P.',
    clientAvatar: 'https://i.pravatar.cc/40?img=30',
    rating: 5,
    comment: 'I was skeptical at first but Luna immediately tapped into something very specific about my relationship. Truly gifted.',
    sessionType: 'chat',
    createdAt: '2024-09-18',
  },
  {
    id: 5,
    clientName: 'Nadia S.',
    clientAvatar: 'https://i.pravatar.cc/40?img=16',
    rating: 3,
    comment: 'The session was okay. I felt like the guidance was a bit general. Maybe I wasn\'t ready to hear certain things.',
    sessionType: 'video',
    createdAt: '2024-08-30',
  },
]

type FilterKey = 'all' | '5' | '4' | '3' | '1-2'

// ─── Star display ─────────────────────────────────────────────

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          fill={i <= rating ? '#C9A84C' : 'transparent'}
          color={i <= rating ? '#C9A84C' : '#4B5563'}
        />
      ))}
    </div>
  )
}

// ─── Response modal ───────────────────────────────────────────

function ResponseModal({
  review, existing, onSave, onClose,
}: {
  review: ReviewRow
  existing: string
  onSave: (text: string) => void
  onClose: () => void
}) {
  const [text, setText] = useState(existing)
  const [saved, setSaved] = useState(false)
  const MAX = 500

  function handleSave() {
    onSave(text)
    setSaved(true)
    setTimeout(onClose, 1000)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#0F1828', border: '1px solid #1E2D45',
        borderRadius: '16px', padding: '28px', maxWidth: '520px', width: '100%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <h3 style={{ color: '#F0F4FF', fontWeight: 700, margin: 0, fontSize: '17px' }}>
            {existing ? 'Edit Response' : 'Write a Response'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4' }}>
            <X size={18} />
          </button>
        </div>

        {/* Original review preview */}
        <div style={{
          background: '#0B0F1A', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px',
          borderLeft: '3px solid #1E2D45',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <img src={review.clientAvatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            <span style={{ color: '#8B9BB4', fontSize: '13px', fontWeight: 600 }}>{review.clientName}</span>
            <Stars rating={review.rating} size={11} />
          </div>
          <p style={{ color: '#8B9BB4', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>"{review.comment}"</p>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value.slice(0, MAX))}
          rows={5}
          placeholder="Write a professional, heartfelt response visible to all visitors…"
          style={{
            width: '100%', background: '#1A2540', border: '1px solid #1E2D45',
            borderRadius: '10px', padding: '12px', color: '#F0F4FF',
            fontSize: '14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <span style={{ color: '#4B5563', fontSize: '12px' }}>{text.length}/{MAX}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{
              padding: '8px 16px', borderRadius: '8px',
              background: '#1A2540', border: '1px solid #1E2D45',
              color: '#8B9BB4', cursor: 'pointer', fontSize: '13px',
            }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!text.trim() || saved}
              style={{
                padding: '8px 16px', borderRadius: '8px',
                background: saved ? '#22C55E' : text.trim() ? 'linear-gradient(135deg,#C9A84C,#E8C96D)' : '#4B5563',
                border: 'none', color: saved ? '#fff' : '#0B0F1A',
                fontWeight: 700, cursor: text.trim() && !saved ? 'pointer' : 'default',
                fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {saved ? <><Check size={13} /> Saved!</> : 'Post Response'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Review card ──────────────────────────────────────────────

function ReviewCard({
  review, onRespond,
}: { review: ReviewRow; onRespond: () => void }) {
  return (
    <div style={{
      background: '#0F1828', border: '1px solid #1E2D45',
      borderRadius: '14px', padding: '20px', marginBottom: '12px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={review.clientAvatar}
            alt={review.clientName}
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px', margin: '0 0 2px' }}>
              {review.clientName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stars rating={review.rating} />
              <span style={{ color: '#4B5563', fontSize: '12px' }}>
                via {review.sessionType} · {format(new Date(review.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onRespond}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: review.response ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${review.response ? 'rgba(201,168,76,0.3)' : '#1E2D45'}`,
            color: review.response ? '#C9A84C' : '#8B9BB4',
            borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px',
          }}
        >
          <MessageSquare size={12} />
          {review.response ? 'Edit Reply' : 'Reply'}
        </button>
      </div>

      {/* Comment */}
      <p style={{ color: '#CBD5E1', fontSize: '14px', lineHeight: 1.65, margin: '0 0 12px' }}>
        "{review.comment}"
      </p>

      {/* Existing response */}
      {review.response && (
        <div style={{
          background: 'rgba(201,168,76,0.06)', borderLeft: '3px solid rgba(201,168,76,0.4)',
          borderRadius: '0 8px 8px 0', padding: '12px 14px',
        }}>
          <p style={{ color: '#C9A84C', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>
            Your Response
          </p>
          <p style={{ color: '#C9A84C', fontSize: '13px', margin: 0, opacity: 0.9, lineHeight: 1.6 }}>
            {review.response}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────

export default function AdvisorReviews() {
  const [reviews, setReviews] = useState<ReviewRow[]>(REVIEWS)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [respondTo, setRespondTo] = useState<ReviewRow | null>(null)

  const filtered = reviews.filter(r => {
    if (filter === 'all') return true
    if (filter === '5') return r.rating === 5
    if (filter === '4') return r.rating === 4
    if (filter === '3') return r.rating === 3
    if (filter === '1-2') return r.rating <= 2
    return true
  })

  function saveResponse(id: number, response: string) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, response } : r))
  }

  // Rating summary
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  const countMap: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach(r => countMap[r.rating]++)

  const PILLS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: `All (${reviews.length})` },
    { key: '5', label: '5 Stars' },
    { key: '4', label: '4 Stars' },
    { key: '3', label: '3 Stars' },
    { key: '1-2', label: '1–2 Stars' },
  ]

  return (
    <div style={{ maxWidth: '860px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>
          Reviews
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
          Read client feedback and respond publicly to build trust.
        </p>
      </div>

      {/* Rating summary */}
      <div style={{
        background: '#0F1828', border: '1px solid #1E2D45',
        borderRadius: '16px', padding: '24px', marginBottom: '24px',
        display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Big number */}
        <div style={{ textAlign: 'center', minWidth: '90px' }}>
          <p style={{ color: '#C9A84C', fontSize: '48px', fontWeight: 700, margin: '0 0 4px', lineHeight: 1 }}>
            {avg.toFixed(1)}
          </p>
          <Stars rating={Math.round(avg)} size={16} />
          <p style={{ color: '#4B5563', fontSize: '12px', margin: '6px 0 0' }}>
            {reviews.length} reviews
          </p>
        </div>

        {/* Bar breakdown */}
        <div style={{ flex: 1, minWidth: '180px' }}>
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              <span style={{ color: '#8B9BB4', fontSize: '12px', width: '14px' }}>{star}</span>
              <Star size={11} fill="#C9A84C" color="#C9A84C" />
              <div style={{ flex: 1, background: '#1E2D45', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: `${reviews.length ? (countMap[star] / reviews.length) * 100 : 0}%`,
                  height: '100%', background: '#C9A84C', borderRadius: '4px',
                }} />
              </div>
              <span style={{ color: '#4B5563', fontSize: '12px', width: '16px' }}>{countMap[star]}</span>
            </div>
          ))}
        </div>

        {/* Response rate */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#F0F4FF', fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>
            {Math.round((reviews.filter(r => r.response).length / reviews.length) * 100)}%
          </p>
          <p style={{ color: '#8B9BB4', fontSize: '13px', margin: 0 }}>Response Rate</p>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
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

      {/* Review list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#4B5563' }}>
          <Star size={40} strokeWidth={1} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <p style={{ margin: 0 }}>No reviews match this filter.</p>
        </div>
      ) : (
        filtered.map(r => (
          <ReviewCard
            key={r.id}
            review={r}
            onRespond={() => setRespondTo(r)}
          />
        ))
      )}

      {respondTo && (
        <ResponseModal
          review={respondTo}
          existing={respondTo.response ?? ''}
          onSave={text => saveResponse(respondTo.id, text)}
          onClose={() => setRespondTo(null)}
        />
      )}
    </div>
  )
}
