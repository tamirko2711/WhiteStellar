import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Star, Clock, MessageCircle, Phone, Video, Heart, Share2,
  Wallet, CheckCircle, AlertTriangle, ChevronDown,
  ChevronUp, ArrowLeft, X,
} from 'lucide-react'
import { ADVISORS } from '../../data/advisors'
import { getAdvisorById as fetchAdvisorFromDB, getAdvisorReviews } from '../../lib/api/advisors'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import Toast from '../../components/Toast'
import StartSessionModal from '../../components/modals/StartSessionModal'
import type { SessionType, Advisor, Review } from '../../types'

// ─── Constants ────────────────────────────────────────────────

const STATUS_CONFIG = {
  online:  { label: 'Online',  color: '#2DD4BF' },
  busy:    { label: 'Busy',    color: '#F59E0B' },
  offline: { label: 'Offline', color: '#4B5563' },
} as const

const SESSION_CONFIG: Record<SessionType, { label: string; icon: React.ReactNode }> = {
  chat:  { label: 'Chat',  icon: <MessageCircle size={16} /> },
  audio: { label: 'Audio', icon: <Phone size={16} /> },
  video: { label: 'Video', icon: <Video size={16} /> },
}

const DURATION_PRESETS = [5, 10, 20, 30]

// Computed dynamically from real reviews inside ReviewsCard

const FLAGS: Record<string, string> = {
  en: '🇺🇸', es: '🇪🇸', fr: '🇫🇷', pt: '🇧🇷',
  de: '🇩🇪', it: '🇮🇹', he: '🇮🇱', ar: '🇸🇦',
}

const DARK_CARD: React.CSSProperties = {
  background: '#131929',
  border: '1px solid #1E2D45',
  borderRadius: '16px',
  padding: '24px',
}

// ─── Shared small components ──────────────────────────────────

function StatusPill({ status }: { status: Advisor['status'] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: `${cfg.color}1A`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  )
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(rating) ? '#C9A84C' : 'transparent'}
          color={i <= Math.round(rating) ? '#C9A84C' : '#4B5563'}
        />
      ))}
    </div>
  )
}

// ─── Profile header card ──────────────────────────────────────

function ProfileHeaderCard({ advisor }: { advisor: Advisor }) {
  return (
    <div style={{ ...DARK_CARD, padding: 0, overflow: 'visible' }}>
      {/* Background image */}
      <div style={{ position: 'relative', height: '200px', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
        <img
          src={advisor.backgroundImage}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(19,25,41,0.1) 0%, #131929 100%)' }} />
      </div>

      {/* Content below image */}
      <div style={{ padding: '0 24px 24px' }}>
        {/* Avatar row — negative margin overlaps image */}
        <div className="flex items-end gap-4" style={{ marginTop: '-50px', marginBottom: '16px' }}>
          <img
            src={advisor.avatar}
            alt={advisor.fullName}
            style={{
              width: '100px', height: '100px', borderRadius: '50%',
              objectFit: 'cover', border: '3px solid #C9A84C',
              position: 'relative', zIndex: 2, flexShrink: 0,
            }}
          />
          <div style={{ marginBottom: '6px' }}>
            <StatusPill status={advisor.status} />
          </div>
        </div>

        {/* Name + badges */}
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
            {advisor.fullName}
          </h1>
          {advisor.isTopAdvisor && (
            <span className="rounded-full px-2.5 py-1 text-xs font-bold tracking-wider" style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.4)' }}>
              ★ TOP ADVISOR
            </span>
          )}
          {!advisor.isTopAdvisor && advisor.isNew && (
            <span className="rounded-full px-2.5 py-1 text-xs font-bold tracking-wider" style={{ background: 'rgba(45,212,191,0.15)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.4)' }}>
              NEW
            </span>
          )}
        </div>

        {/* Short bio */}
        <p className="mb-5 text-sm leading-relaxed" style={{ color: '#8B9BB4' }}>
          {advisor.shortBio}
        </p>

        {/* Stats row */}
        <div
          className="mb-4 flex flex-wrap gap-0"
          style={{ borderTop: '1px solid #1E2D45', borderBottom: '1px solid #1E2D45', padding: '16px 0' }}
        >
          {[
            { label: 'Rating', value: advisor.rating.toFixed(1), icon: '⭐' },
            { label: 'Reviews', value: advisor.reviewCount.toLocaleString(), icon: '💬' },
            { label: 'Sessions', value: advisor.totalSessions.toLocaleString(), icon: '🕐' },
            { label: 'Years Active', value: `${advisor.yearsActive} yrs`, icon: '📅' },
          ].map((stat, i, arr) => (
            <div
              key={stat.label}
              className="flex flex-1 flex-col items-center py-1 text-center"
              style={{ borderRight: i < arr.length - 1 ? '1px solid #1E2D45' : 'none', minWidth: '80px' }}
            >
              <span className="text-base">{stat.icon}</span>
              <span className="mt-1 text-base font-bold" style={{ color: '#F0F4FF' }}>{stat.value}</span>
              <span className="text-xs" style={{ color: '#8B9BB4' }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Response time */}
        <div className="flex items-center gap-2">
          <Clock size={14} style={{ color: '#8B9BB4' }} />
          <span className="text-sm" style={{ color: '#8B9BB4' }}>
            Typically responds in <span style={{ color: '#F0F4FF' }}>{advisor.responseTime}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── About card ───────────────────────────────────────────────

function AboutCard({ advisor }: { advisor: Advisor }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={DARK_CARD}>
      <h2 className="mb-4 text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#F0F4FF' }}>
        About {advisor.fullName.split(' ')[0]}
      </h2>
      <p
        className="text-sm leading-relaxed"
        style={{
          color: '#8B9BB4',
          display: expanded ? 'block' : '-webkit-box',
          WebkitLineClamp: expanded ? undefined : 3,
          WebkitBoxOrient: 'vertical',
          overflow: expanded ? 'visible' : 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        {advisor.longBio}
      </p>
      <button
        onClick={() => setExpanded(v => !v)}
        className="mt-3 flex items-center gap-1 text-sm font-semibold"
        style={{ color: '#C9A84C', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        {expanded ? 'Show less' : 'Read more'}
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
    </div>
  )
}

// ─── Specs card ───────────────────────────────────────────────

function SpecsCard({ advisor }: { advisor: Advisor }) {
  return (
    <div style={DARK_CARD}>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {/* Specializations */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: '#8B9BB4' }}>
            Specializes In
          </h3>
          <div className="flex flex-wrap gap-2">
            {advisor.specializations.map(s => (
              <span key={s.id} className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: '#1E2D45', color: '#F0F4FF' }}>
                {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Skills & Methods */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: '#8B9BB4' }}>
            Skills & Methods
          </h3>
          <div className="flex flex-wrap gap-2">
            {advisor.skillsAndMethods.map(sk => (
              <span
                key={sk.id}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: '#1E2D45', color: '#2DD4BF', borderLeft: '2px solid rgba(45,212,191,0.5)' }}
              >
                {sk.title}
              </span>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: '#8B9BB4' }}>
            Languages
          </h3>
          <div className="flex flex-col gap-2">
            {advisor.languages.map(lang => (
              <span key={lang.id} className="flex items-center gap-2 text-sm" style={{ color: '#F0F4FF' }}>
                <span>{FLAGS[lang.code] ?? '🌐'}</span>
                {lang.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Reviews card ─────────────────────────────────────────────

function ReviewsCard({ advisor }: { advisor: Advisor }) {
  // Compute rating distribution from real reviews
  const countMap: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  advisor.reviews.forEach(r => { countMap[Math.round(r.rating)] = (countMap[Math.round(r.rating)] ?? 0) + 1 })
  const total = advisor.reviews.length || 1
  const ratingBars = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    pct: Math.round((countMap[stars] / total) * 100),
  }))

  return (
    <div style={DARK_CARD}>
      {/* Heading */}
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#F0F4FF' }}>
          Client Reviews
        </h2>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}>
          {advisor.reviewCount.toLocaleString()}
        </span>
      </div>

      {/* Rating summary */}
      <div className="mb-6 flex gap-8">
        {/* Big number */}
        <div className="flex flex-col items-center justify-center">
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '48px', fontWeight: 700, color: '#C9A84C', lineHeight: 1 }}>
            {advisor.rating.toFixed(1)}
          </span>
          <StarRow rating={advisor.rating} size={16} />
          <span className="mt-1 text-xs" style={{ color: '#8B9BB4' }}>{advisor.reviewCount.toLocaleString()} reviews</span>
        </div>

        {/* Bars */}
        <div className="flex flex-1 flex-col gap-2">
          {ratingBars.map(bar => (
            <div key={bar.stars} className="flex items-center gap-3">
              <span className="w-4 shrink-0 text-right text-xs" style={{ color: '#8B9BB4' }}>{bar.stars}★</span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full" style={{ background: '#1E2D45' }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{ width: `${bar.pct}%`, background: '#C9A84C' }}
                />
              </div>
              <span className="w-8 text-xs" style={{ color: '#8B9BB4' }}>{bar.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Individual reviews */}
      {advisor.reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <Star size={32} style={{ color: '#1E2D45' }} />
          <p className="text-sm" style={{ color: '#8B9BB4' }}>No reviews yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {advisor.reviews.map((rev, i) => (
            <div key={rev.id}>
              {i > 0 && <div style={{ borderTop: '1px solid #1E2D45', marginBottom: '20px' }} />}
              <div className="flex items-start gap-3">
                <img src={rev.clientAvatar} alt={rev.clientName} className="rounded-full object-cover shrink-0" style={{ width: '36px', height: '36px' }} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-semibold" style={{ color: '#F0F4FF' }}>{rev.clientName}</span>
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium capitalize" style={{ background: 'rgba(45,212,191,0.12)', color: '#2DD4BF' }}>
                      {rev.sessionType} Session
                    </span>
                    <span className="text-xs" style={{ color: '#4B5563' }}>
                      {format(new Date(rev.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <StarRow rating={rev.rating} size={13} />
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: '#8B9BB4' }}>{rev.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      <button
        className="mt-6 w-full rounded-xl py-2.5 text-sm font-semibold transition-colors"
        style={{ background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,168,76,0.06)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
      >
        Load more reviews
      </button>
    </div>
  )
}

// ─── Connect Panel ────────────────────────────────────────────

interface ConnectPanelProps {
  advisor: Advisor
  selectedType: SessionType
  setSelectedType: (t: SessionType) => void
  selectedMinutes: number
  setSelectedMinutes: (m: number) => void
  saved: boolean
  setSaved: (v: boolean) => void
  notifyEnabled: boolean
  setNotifyEnabled: (v: boolean) => void
  onShare: () => void
  walletBalance: number
  onStartSession: () => void
  onTopUp: () => void
}

function ConnectPanel({
  advisor, selectedType, setSelectedType,
  selectedMinutes, setSelectedMinutes,
  saved, setSaved, notifyEnabled, setNotifyEnabled,
  onShare, walletBalance, onStartSession, onTopUp,
}: ConnectPanelProps) {
  const pricePerMin = advisor.pricing[selectedType] ?? 0
  const estimatedCost = pricePerMin * selectedMinutes
  const hasFunds = walletBalance >= estimatedCost
  const firstName = advisor.fullName.split(' ')[0]

  const ctaStyle: React.CSSProperties = (() => {
    if (advisor.status === 'online') {
      return { background: '#C9A84C', color: '#0B0F1A', animation: 'goldGlow 2s ease-in-out infinite' }
    }
    if (advisor.status === 'busy') {
      return { background: '#F59E0B', color: '#0B0F1A' }
    }
    return { background: '#131929', color: '#4B5563', border: '1px solid #1E2D45', cursor: 'default' }
  })()

  const ctaLabel = (() => {
    if (advisor.status === 'online') return `Start ${SESSION_CONFIG[selectedType].label} Session`
    if (advisor.status === 'busy') return `Advisor is Busy — Notify Me`
    return `Advisor Offline — Notify Me`
  })()

  return (
    <div style={{ ...DARK_CARD, border: '1px solid rgba(201,168,76,0.5)' }}>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: '#F0F4FF' }}>
          Connect with {firstName}
        </h2>
        <StatusPill status={advisor.status} />
      </div>

      {/* Session type selector */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#8B9BB4' }}>
          Session Type
        </p>
        <div className="flex gap-2">
          {(['chat', 'audio', 'video'] as SessionType[]).map(type => {
            const isAvailable = advisor.sessionTypes.includes(type) && advisor.pricing[type] !== null
            const isActive = selectedType === type

            return (
              <button
                key={type}
                disabled={!isAvailable}
                onClick={() => isAvailable && setSelectedType(type)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200"
                style={{
                  background: isActive ? '#C9A84C' : '#0B0F1A',
                  color: isActive ? '#0B0F1A' : isAvailable ? '#8B9BB4' : '#2A3548',
                  border: isActive ? 'none' : `1px solid ${isAvailable ? '#1E2D45' : '#151D2E'}`,
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  opacity: isAvailable ? 1 : 0.4,
                }}
              >
                {SESSION_CONFIG[type].icon}
                {SESSION_CONFIG[type].label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Price per minute */}
      <div className="mb-5 rounded-xl p-3 text-center" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)' }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 700, color: '#C9A84C' }}>
          ${pricePerMin.toFixed(2)}
        </span>
        <span className="ml-1 text-sm" style={{ color: '#8B9BB4' }}>per minute</span>
      </div>

      {/* Duration presets */}
      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#8B9BB4' }}>
          Duration
        </p>
        <div className="flex gap-2">
          {DURATION_PRESETS.map(min => (
            <button
              key={min}
              onClick={() => setSelectedMinutes(min)}
              className="flex-1 rounded-xl py-2 text-sm font-semibold transition-all duration-200"
              style={{
                background: selectedMinutes === min ? '#C9A84C' : '#0B0F1A',
                color: selectedMinutes === min ? '#0B0F1A' : '#8B9BB4',
                border: selectedMinutes === min ? 'none' : '1px solid #1E2D45',
              }}
            >
              {min}m
            </button>
          ))}
        </div>

        {/* Estimated cost */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm" style={{ color: '#8B9BB4' }}>Estimated cost</span>
          <span className="text-base font-bold" style={{ color: '#F0F4FF' }}>${estimatedCost.toFixed(2)}</span>
        </div>
        <p className="mt-1 text-xs" style={{ color: '#4B5563' }}>*Billed per minute. Session ends when balance runs out.</p>
      </div>

      {/* Wallet balance row */}
      <div className="mb-5 flex items-center justify-between rounded-xl p-3" style={{ background: '#0B0F1A', border: '1px solid #1E2D45' }}>
        <div className="flex items-center gap-2">
          <Wallet size={15} style={{ color: '#8B9BB4' }} />
          <span className="text-sm" style={{ color: '#8B9BB4' }}>Your balance</span>
          <span className="text-sm font-semibold" style={{ color: '#F0F4FF' }}>${walletBalance.toFixed(2)}</span>
        </div>
        {hasFunds ? (
          <div className="flex items-center gap-1">
            <CheckCircle size={14} style={{ color: '#2DD4BF' }} />
            <span className="text-xs font-medium" style={{ color: '#2DD4BF' }}>Sufficient</span>
          </div>
        ) : (
          <button onClick={onTopUp} className="flex items-center gap-1 text-xs font-medium" style={{ color: '#C9A84C', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <AlertTriangle size={14} />
            Top Up Wallet
          </button>
        )}
      </div>

      {/* CTA button */}
      <button
        className="mb-3 w-full rounded-xl py-4 text-base font-bold transition-all duration-200"
        style={ctaStyle}
        onClick={advisor.status === 'online' ? onStartSession : undefined}
        onMouseEnter={e => {
          if (advisor.status === 'online') (e.currentTarget as HTMLButtonElement).style.background = '#E8C76A'
        }}
        onMouseLeave={e => {
          if (advisor.status === 'online') (e.currentTarget as HTMLButtonElement).style.background = '#C9A84C'
        }}
      >
        {ctaLabel}
      </button>
      {advisor.status === 'online' && (
        <p className="mb-4 text-center text-xs" style={{ color: '#8B9BB4' }}>
          ⚡ Available now · Typically starts in {advisor.responseTime}
        </p>
      )}

      {/* Notify Me toggle (busy/offline) */}
      {advisor.status !== 'online' && (
        <div className="mb-4 flex items-center justify-between rounded-xl p-3" style={{ background: '#0B0F1A', border: '1px solid #1E2D45' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: '#F0F4FF' }}>Notify Me</p>
            {notifyEnabled && (
              <p className="mt-0.5 text-xs" style={{ color: '#2DD4BF' }}>
                We'll notify you when {firstName} comes online ✓
              </p>
            )}
          </div>
          {/* Toggle switch */}
          <button
            onClick={() => setNotifyEnabled(!notifyEnabled)}
            style={{
              width: '44px', height: '24px', borderRadius: '12px',
              background: notifyEnabled ? '#2DD4BF' : '#1E2D45',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.2s', flexShrink: 0,
            }}
            aria-label="Toggle notifications"
          >
            <span
              style={{
                position: 'absolute', top: '2px',
                left: notifyEnabled ? '22px' : '2px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
              }}
            />
          </button>
        </div>
      )}

      {/* Trust badges */}
      <div className="mb-4 flex justify-around" style={{ borderTop: '1px solid #1E2D45', paddingTop: '16px' }}>
        {[
          { icon: '🔒', label: 'Secure & Confidential' },
          { icon: '✓',  label: 'Satisfaction Guaranteed' },
          { icon: '⭐', label: 'Verified Advisor' },
        ].map(b => (
          <div key={b.label} className="flex flex-col items-center gap-1 text-center">
            <span className="text-sm">{b.icon}</span>
            <span className="text-[10px] leading-tight" style={{ color: '#4B5563', maxWidth: '64px' }}>{b.label}</span>
          </div>
        ))}
      </div>

      {/* Share & Save */}
      <div className="flex gap-3" style={{ borderTop: '1px solid #1E2D45', paddingTop: '16px' }}>
        <button
          onClick={() => setSaved(!saved)}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-200"
          style={{
            background: 'transparent',
            border: '1px solid #1E2D45',
            color: saved ? '#C9A84C' : '#8B9BB4',
          }}
        >
          <Heart size={15} fill={saved ? '#C9A84C' : 'none'} color={saved ? '#C9A84C' : '#8B9BB4'} />
          {saved ? 'Saved' : 'Save Advisor'}
        </button>
        <button
          onClick={onShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-200"
          style={{ background: 'transparent', border: '1px solid #1E2D45', color: '#8B9BB4' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#F0F4FF' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#8B9BB4' }}
        >
          <Share2 size={15} />
          Share Profile
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────

// ─── Map Supabase row → Advisor type ─────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAdvisorRow(row: any): Advisor {
  const sessionTypes: Advisor['sessionTypes'] = []
  if (row.chat_price)  sessionTypes.push('chat')
  if (row.audio_price) sessionTypes.push('audio')
  if (row.video_price) sessionTypes.push('video')

  return {
    id: row.id,
    userId: 0,
    fullName: row.full_name ?? 'Advisor',
    shortBio: row.short_bio ?? '',
    longBio: row.long_bio ?? '',
    avatar: row.avatar
      ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(row.full_name ?? 'A')}&background=1E2D45&color=C9A84C`,
    backgroundImage: row.background_image
      ?? 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800',
    status: row.status ?? 'offline',
    accountStatus: row.account_status ?? 'active',
    isTopAdvisor: row.is_top_advisor ?? false,
    isNew: !row.is_top_advisor,
    languages: (row.advisor_languages ?? []).map((jl: any) => ({
      id: jl.language_id,
      name: jl.languages?.name ?? '',
      code: jl.languages?.code ?? '',
    })),
    categories: (row.advisor_categories ?? []).map((jc: any) => ({
      id: jc.category_id,
      slug: jc.categories?.slug ?? '',
      title: jc.categories?.title ?? '',
      icon: 'Star',
      description: '',
      advisorCount: 0,
    })),
    specializations: (row.advisor_specializations ?? []).map((js: any) => ({
      id: js.specialization_id,
      title: js.specializations?.title ?? '',
      categoryId: 0,
    })),
    skillsAndMethods: (row.advisor_skills ?? []).map((sk: any) => ({
      id: sk.skill_id,
      title: sk.skills_and_methods?.title ?? '',
    })),
    sessionTypes,
    pricing: {
      chat: row.chat_price ?? null,
      audio: row.audio_price ?? null,
      video: row.video_price ?? null,
    },
    rating: row.rating ?? 5.0,
    reviewCount: row.review_count ?? 0,
    totalSessions: row.total_sessions ?? 0,
    yearsActive: row.years_active ?? 0,
    responseTime: row.response_time ?? '—',
    withdrawalMethod: 'paypal',
    joinedAt: row.created_at ?? new Date().toISOString(),
    reviews: [],
  }
}

export default function AdvisorProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const walletBalance = useAuthStore(s => s.user?.walletBalance ?? 45.00)
  const user = useAuthStore(s => s.user)
  const userType = useAuthStore(s => s.userType)
  const isOwnProfile = userType === 'advisor'

  const [advisor, setAdvisor] = useState<Advisor | null>(null)
  const [loadingAdvisor, setLoadingAdvisor] = useState(true)

  // Fetch from Supabase first; fall back to mock data for dev IDs
  useEffect(() => {
    if (!id) { setAdvisor(ADVISORS[0]); setLoadingAdvisor(false); return }
    const numId = Number(id)
    fetchAdvisorFromDB(numId)
      .then(row => { setAdvisor(mapAdvisorRow(row)) })
      .catch(() => {
        // Fall back to mock data (used in dev mode)
        const mock = ADVISORS.find(a => a.id === numId) ?? null
        setAdvisor(mock)
      })
      .finally(() => setLoadingAdvisor(false))
  }, [id])

  // Fetch real reviews from Supabase once advisor is loaded
  useEffect(() => {
    const numId = Number(id)
    if (!advisor?.id || isNaN(numId)) return
    getAdvisorReviews(numId)
      .then(rows => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: Review[] = rows.map((r: any) => ({
          id: r.id,
          advisorId: r.advisor_id,
          clientId: 0,
          clientName: r.client_name ?? r.profiles?.full_name ?? 'Client',
          clientAvatar: r.client_avatar ?? r.profiles?.avatar_url
            ?? `https://i.pravatar.cc/150?img=${r.id % 70}`,
          rating: r.rating,
          comment: r.comment ?? '',
          sessionType: r.session_type ?? 'chat',
          createdAt: r.created_at,
          isApproved: r.is_approved ?? true,
        }))
        setAdvisor(prev => prev ? { ...prev, reviews: mapped } : prev)
      })
      .catch(console.error)
  }, [advisor?.id, id])

  // Connect panel state
  const [selectedType, setSelectedType] = useState<SessionType>('chat')
  const [selectedMinutes, setSelectedMinutes] = useState(10)
  const [saved, setSaved] = useState(false)

  // Sync selectedType once advisor loads; auto-open modal if returning from wallet top-up
  useEffect(() => {
    if (!advisor) return
    const returnSession = (location.state as any)?.openSession as { sessionType: string } | undefined
    if (returnSession?.sessionType) {
      setSelectedType(returnSession.sessionType as SessionType)
      setSessionModalOpen(true)
    } else if (advisor.sessionTypes.length) {
      setSelectedType(advisor.sessionTypes[0])
    }
  }, [advisor])

  useEffect(() => {
    if (!user?.id || !id) return
    supabase
      .from('saved_advisors')
      .select('advisor_id')
      .eq('client_id', user.id)
      .eq('advisor_id', Number(id))
      .maybeSingle()
      .then(({ data }) => setSaved(!!data))
  }, [user?.id, id])

  async function handleToggleSave(newSaved: boolean) {
    setSaved(newSaved)
    if (!user?.id) return
    if (newSaved) {
      await supabase.from('saved_advisors').insert({ client_id: user.id, advisor_id: Number(id) })
    } else {
      await supabase.from('saved_advisors').delete()
        .eq('client_id', user.id).eq('advisor_id', Number(id))
    }
  }

  const [notifyEnabled, setNotifyEnabled] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [mobileConnectOpen, setMobileConnectOpen] = useState(false)
  const [sessionModalOpen, setSessionModalOpen] = useState(false)

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2000)
  }, [])

  // Loading state
  if (loadingAdvisor) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center" style={{ background: '#0B0F1A' }}>
        <p style={{ color: '#8B9BB4', fontSize: '14px' }}>Loading advisor profile…</p>
      </div>
    )
  }

  // "Advisor not found" state
  if (id && !advisor) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5" style={{ background: '#0B0F1A' }}>
        <Star size={48} style={{ color: '#1E2D45' }} />
        <p className="text-lg font-semibold" style={{ color: '#F0F4FF' }}>Advisor not found</p>
        <p className="text-sm" style={{ color: '#8B9BB4' }}>This advisor profile doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold"
          style={{ background: '#131929', border: '1px solid #1E2D45', color: '#F0F4FF' }}
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    )
  }

  if (!advisor) return null

  const connectProps: ConnectPanelProps = {
    advisor, selectedType, setSelectedType,
    selectedMinutes, setSelectedMinutes,
    saved, setSaved: handleToggleSave, notifyEnabled, setNotifyEnabled,
    onShare: handleShare, walletBalance,
    onStartSession: () => setSessionModalOpen(true),
    onTopUp: () => navigate('/dashboard/wallet', {
      state: { returnTo: location.pathname, openSession: { sessionType: selectedType } },
    }),
  }

  return (
    <div style={{ background: '#0B0F1A', minHeight: '100vh', color: '#F0F4FF' }}>
      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-6">

        {/* ── Breadcrumb / Back button ── */}
        {isOwnProfile ? (
          <div className="mb-6">
            <button
              onClick={() => navigate('/advisor/dashboard')}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
              style={{ background: '#131929', border: '1px solid #1E2D45', color: '#C9A84C', cursor: 'pointer' }}
            >
              <ArrowLeft size={15} />
              Back to Dashboard
            </button>
          </div>
        ) : (
          <nav className="mb-6 flex items-center gap-2 text-sm">
            <Link to="/" style={{ color: '#C9A84C', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: '#4B5563' }}>›</span>
            <Link to="/advisors" style={{ color: '#C9A84C', textDecoration: 'none' }}>Advisors</Link>
            <span style={{ color: '#4B5563' }}>›</span>
            <span style={{ color: '#F0F4FF' }}>{advisor.fullName}</span>
          </nav>
        )}

        {/* ── Two-column layout ── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">

          {/* ── LEFT COLUMN (65%) ── */}
          <div className="flex flex-col gap-6 min-w-0 lg:flex-1">
            <ProfileHeaderCard advisor={advisor} />
            <AboutCard advisor={advisor} />
            <SpecsCard advisor={advisor} />
            <ReviewsCard advisor={advisor} />
          </div>

          {/* ── RIGHT COLUMN (35%) — desktop sticky panel ── */}
          <div className="hidden lg:block" style={{ width: '380px', flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: '80px' }}>
              <ConnectPanel {...connectProps} />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MOBILE — Fixed bottom bar + slide-up sheet               */}
      {/* ══════════════════════════════════════════════════════════ */}

      {/* Bottom bar */}
      <div
        className="lg:hidden fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 px-4 py-3"
        style={{
          background: 'rgba(11,15,26,0.97)',
          borderTop: '1px solid #1E2D45',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div>
          <p className="text-xs" style={{ color: '#8B9BB4' }}>Starting from</p>
          <p className="text-lg font-bold" style={{ color: '#C9A84C' }}>
            ${advisor.pricing[selectedType]?.toFixed(2)}/min
          </p>
        </div>
        <button
          onClick={() => setMobileConnectOpen(true)}
          className="flex-1 rounded-xl py-3 text-sm font-bold"
          style={{ background: '#C9A84C', color: '#0B0F1A' }}
        >
          Connect with {advisor.fullName.split(' ')[0]}
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className="lg:hidden fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          opacity: mobileConnectOpen ? 1 : 0,
          pointerEvents: mobileConnectOpen ? 'auto' : 'none',
        }}
        onClick={() => setMobileConnectOpen(false)}
      />

      {/* Mobile sheet */}
      <div
        className="lg:hidden fixed inset-x-0 bottom-0 z-50 overflow-y-auto rounded-t-3xl"
        style={{
          background: '#0D1221',
          maxHeight: '90vh',
          transform: mobileConnectOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
          padding: '8px 16px 32px',
        }}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-4 mt-2 h-1 w-12 rounded-full" style={{ background: '#1E2D45' }} />
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: '#F0F4FF' }}>Connect with {advisor.fullName.split(' ')[0]}</span>
          <button onClick={() => setMobileConnectOpen(false)} style={{ color: '#8B9BB4', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        <ConnectPanel {...connectProps} />
      </div>

      {/* Start Session Modal */}
      {sessionModalOpen && (
        <StartSessionModal
          advisorId={advisor.id}
          advisorName={advisor.fullName}
          advisorAvatar={advisor.avatar}
          sessionType={selectedType}
          pricePerMinute={advisor.pricing[selectedType] ?? 1.99}
          onClose={() => setSessionModalOpen(false)}
        />
      )}

      {/* Toast */}
      <Toast message="Link copied to clipboard!" visible={toastVisible} />

      {/* Keyframes */}
      <style>{`
        @keyframes goldGlow {
          0%, 100% { box-shadow: 0 0 16px rgba(201,168,76,0.35), 0 4px 16px rgba(0,0,0,0.3); }
          50%       { box-shadow: 0 0 32px rgba(201,168,76,0.65), 0 4px 16px rgba(0,0,0,0.3); }
        }
      `}</style>
    </div>
  )
}
