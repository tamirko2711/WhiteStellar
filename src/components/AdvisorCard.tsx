import { Star, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Advisor } from '../types'

interface Props {
  advisor: Advisor
}

const STATUS_CONFIG = {
  online:  { label: 'Online',  color: '#2DD4BF' },
  busy:    { label: 'Busy',    color: '#F59E0B' },
  offline: { label: 'Offline', color: '#4B5563' },
} as const

function getLowestPrice(pricing: Advisor['pricing']): string {
  const prices = [pricing.chat, pricing.audio, pricing.video].filter(
    (p): p is number => p !== null
  )
  if (prices.length === 0) return 'N/A'
  return `$${Math.min(...prices).toFixed(2)}/min`
}

export default function AdvisorCard({ advisor }: Props) {
  const navigate = useNavigate()
  const status = STATUS_CONFIG[advisor.status]

  return (
    <article
      onClick={() => navigate(`/advisor/${advisor.id}`)}
      className="flex cursor-pointer gap-4 p-4 transition-all duration-[250ms] ease-in-out"
      style={{
        background: '#131929',
        border: '1px solid #1E2D45',
        borderRadius: '12px',
        minHeight: '160px',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-4px)'
        el.style.boxShadow = '0 8px 32px rgba(201, 168, 76, 0.15)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* ── Left: Avatar + badge + status ── */}
      <div className="flex shrink-0 flex-col items-center gap-2" style={{ width: '88px' }}>
        <div className="relative">
          <img
            src={advisor.avatar}
            alt={advisor.fullName}
            className="rounded-full object-cover"
            style={{ width: '80px', height: '80px' }}
          />
          {/* TOP / NEW badge — photo overlay */}
          {advisor.isTopAdvisor && (
            <span
              style={{
                position: 'absolute', top: '0px', left: '0px',
                background: '#C9A84C', color: '#0B0F1A',
                fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em',
              }}
            >
              TOP
            </span>
          )}
          {!advisor.isTopAdvisor && advisor.isNew && (
            <span
              style={{
                position: 'absolute', top: '0px', left: '0px',
                background: '#2DD4BF', color: '#0B0F1A',
                fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.04em',
              }}
            >
              NEW
            </span>
          )}
        </div>

        {/* Status pill */}
        <span
          className="flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{
            background: `${status.color}1A`,
            color: status.color,
            border: `1px solid ${status.color}40`,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.color }} />
          {status.label}
        </span>
      </div>

      {/* ── Right: Info ── */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex flex-col gap-1">
          {/* Name */}
          <h3 className="truncate text-base font-bold leading-snug" style={{ color: '#F0F4FF' }}>
            {advisor.fullName}
          </h3>

          {/* Top 2 specializations */}
          <p className="truncate text-xs" style={{ color: '#8B9BB4' }}>
            {advisor.specializations.slice(0, 2).map(s => s.title).join(' · ')}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs">
            <Star size={12} fill="#C9A84C" color="#C9A84C" />
            <span className="font-medium" style={{ color: '#F0F4FF' }}>
              {advisor.rating.toFixed(1)}
            </span>
            <span style={{ color: '#8B9BB4' }}>
              · {advisor.reviewCount.toLocaleString()} reviews
            </span>
          </div>

          {/* Experience + sessions */}
          <p className="text-xs" style={{ color: '#8B9BB4' }}>
            {advisor.yearsActive} yrs experience · {advisor.totalSessions.toLocaleString()} sessions
          </p>

          {/* Short bio — 2-line clamp */}
          <p
            className="text-xs leading-relaxed"
            style={{
              color: '#8B9BB4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {advisor.shortBio}
          </p>
          <span className="cursor-pointer text-xs" style={{ color: '#C9A84C' }}>
            Read more
          </span>
        </div>

        {/* Bottom row: price + CTA */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: '#C9A84C' }}>
              {getLowestPrice(advisor.pricing)}
            </span>
          </div>
          <button
            onClick={e => {
              e.stopPropagation()
              // Session start handled on profile page
            }}
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-[250ms] ease-in-out"
            style={{ background: '#C9A84C', color: '#0B0F1A' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E8C76A' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#C9A84C' }}
          >
            <MessageCircle size={12} />
            Start Chat
          </button>
        </div>
      </div>
    </article>
  )
}
