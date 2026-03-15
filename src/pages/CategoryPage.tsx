// ============================================================
// WhiteStellar — Category Page
// src/pages/CategoryPage.tsx
// ============================================================

import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, Users, Clock, SlidersHorizontal } from 'lucide-react'
import { CATEGORIES, ADVISORS } from '../data/advisors'
import { getArticlesByCategory } from '../data/articles'
import AdvisorCard from '../components/AdvisorCard'
import { getAdvisors } from '../lib/api/advisors'
import type { Advisor } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Advisor {
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
    avatar: row.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(row.full_name ?? 'A')}&background=1E2D45&color=C9A84C`,
    backgroundImage: row.background_image ?? 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800',
    status: row.status ?? 'offline',
    accountStatus: row.account_status ?? 'active',
    isTopAdvisor: row.is_top_advisor ?? false,
    isNew: !row.is_top_advisor,
    languages: [],
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

// ─── Category-specific content ────────────────────────────────

const CATEGORY_CONTENT: Record<string, {
  hero: string
  highlights: { emoji: string; title: string; body: string }[]
  seoBody: string
  trustStats: { value: string; label: string }[]
}> = {
  'psychic-readings': {
    hero: 'Get clear, honest psychic readings from verified clairvoyants — helping you see what lies ahead',
    highlights: [
      { emoji: '👁️', title: 'Clairvoyant Vision', body: 'Advisors who perceive information beyond the five senses, offering a window into situations you can\'t see clearly yourself.' },
      { emoji: '🔮', title: 'Remote Viewing', body: 'Skilled practitioners who can tune into distant people, places, and events to provide specific, verifiable information.' },
      { emoji: '💫', title: 'Energy Reading', body: 'Sensitives who read the aura and energetic field to identify blocks, patterns, and opportunities for transformation.' },
    ],
    seoBody: 'WhiteStellar hosts over 140 verified psychic advisors from around the world. Our readers specialize in clairvoyance, clairsentience, clairaudience, and claircognizance — the four primary psychic senses. Whether you\'re seeking insight into a relationship, a career crossroads, or simply a clearer view of your path, our psychic advisors offer genuine guidance drawn from years of practice and natural ability. All advisors on our platform are independently reviewed and rated by real clients.',
    trustStats: [
      { value: '142', label: 'Verified Psychics' },
      { value: '4.8★', label: 'Average Rating' },
      { value: '50k+', label: 'Sessions Completed' },
      { value: '94%', label: 'Recommend to Friends' },
    ],
  },
  'love-relationships': {
    hero: 'Find clarity on love, soulmates, and relationships with empathic advisors who understand the heart',
    highlights: [
      { emoji: '💕', title: 'Soulmate Connections', body: 'Discover whether a special person in your life is a true soulmate — and what your soul contract together involves.' },
      { emoji: '💔', title: 'Heartbreak & Healing', body: 'Navigate breakups, separations, and loss with compassionate guidance that helps you understand and move through the pain.' },
      { emoji: '💍', title: 'Relationship Timing', body: 'Get insight into when love may arrive, deepen, or transform — and what you can do to align yourself with that energy.' },
    ],
    seoBody: 'Love and relationships are the most deeply personal area of life — and often the one where we most need outside perspective. WhiteStellar\'s love and relationship advisors are empaths, intuitives, and experienced counselors who have guided thousands of clients through the full spectrum of romantic experience: from first love to lasting partnership, from heartbreak to healing. Our advisors use a combination of psychic intuition, tarot, and astrological insight to offer guidance that is honest, compassionate, and empowering.',
    trustStats: [
      { value: '98', label: 'Love Specialists' },
      { value: '4.9★', label: 'Average Rating' },
      { value: '35k+', label: 'Sessions Completed' },
      { value: '96%', label: 'Client Satisfaction' },
    ],
  },
  'tarot': {
    hero: 'Experienced tarot readers reveal the hidden patterns and possibilities in your life through the cards',
    highlights: [
      { emoji: '🃏', title: 'Major Arcana Readings', body: 'Explore the archetypal forces shaping your life\'s biggest themes with readings focused on the 22 major cards.' },
      { emoji: '✨', title: 'Celtic Cross Spreads', body: 'The classic 10-card spread that provides comprehensive insight into a situation from multiple angles.' },
      { emoji: '🌙', title: 'Oracle Combinations', body: 'Advisors who blend tarot with oracle cards for layered, nuanced readings that speak directly to your situation.' },
    ],
    seoBody: 'Tarot reading is both an art and a skill developed over years of study and practice. Our tarot advisors combine deep knowledge of the 78-card deck with highly developed intuition to deliver readings that are accurate, insightful, and genuinely helpful. Whether you\'re new to tarot or a seasoned enthusiast seeking an objective reader for your situation, our platform connects you with advisors across all traditions — from Rider-Waite to Thoth to Lenormand — for sessions that illuminate your path forward.',
    trustStats: [
      { value: '76', label: 'Tarot Specialists' },
      { value: '4.8★', label: 'Average Rating' },
      { value: '28k+', label: 'Sessions Completed' },
      { value: '93%', label: 'Recommend to Others' },
    ],
  },
  'astrology': {
    hero: 'Certified astrologers decode your birth chart and planetary transits to reveal your cosmic blueprint',
    highlights: [
      { emoji: '♈', title: 'Natal Chart Readings', body: 'Your complete birth chart — sun, moon, rising, and all the planetary placements that make you uniquely you.' },
      { emoji: '🪐', title: 'Transit Forecasts', body: 'Understand how current planetary movements are affecting your chart and what to expect in the months ahead.' },
      { emoji: '💑', title: 'Synastry & Compatibility', body: 'Compare two birth charts to understand the cosmic chemistry, challenges, and potential of a relationship.' },
    ],
    seoBody: 'Astrology is one of humanity\'s oldest tools for self-understanding and cosmic orientation. Our certified astrologers offer readings in Western astrology, Vedic astrology, and evolutionary astrology — covering natal chart interpretation, annual profections, solar return charts, compatibility synastry, and predictive transits. Whether you\'re curious about your personality, your year ahead, or the cosmic dynamics of a key relationship, our astrologers deliver insights grounded in genuine expertise.',
    trustStats: [
      { value: '63', label: 'Astrologers' },
      { value: '4.9★', label: 'Average Rating' },
      { value: '22k+', label: 'Sessions Completed' },
      { value: '95%', label: 'Client Satisfaction' },
    ],
  },
  'spiritual': {
    hero: 'Spirit guides, energy healers, and intuitive coaches to support your soul\'s growth and awakening',
    highlights: [
      { emoji: '🌟', title: 'Spirit Guide Communication', body: 'Connect with the higher wisdom of your personal spirit guides through advisors trained in channeling and mediation.' },
      { emoji: '⚡', title: 'Energy Healing', body: 'Remove energetic blocks, balance your chakras, and restore flow to your subtle body through healing sessions.' },
      { emoji: '🌸', title: 'Soul Path Guidance', body: 'Understand your soul\'s purpose, the lessons you came to learn, and the gifts you\'re here to share with the world.' },
    ],
    seoBody: 'Spiritual guidance encompasses a wide range of practices designed to support your connection to your higher self, your spirit guides, and the divine intelligence underlying all of life. Our spiritual advisors include energy healers, channelers, shamanic practitioners, and intuitive coaches who combine ancient wisdom with practical guidance. Whether you\'re experiencing a spiritual awakening, seeking clarity on your soul\'s purpose, or simply feeling disconnected and in need of grounding, our advisors offer the support you need.',
    trustStats: [
      { value: '54', label: 'Spiritual Advisors' },
      { value: '4.8★', label: 'Average Rating' },
      { value: '19k+', label: 'Sessions Completed' },
      { value: '92%', label: 'Client Satisfaction' },
    ],
  },
  'dream-interpretation': {
    hero: 'Expert dream interpreters decode the symbolic messages your subconscious sends every night',
    highlights: [
      { emoji: '💤', title: 'Recurring Dreams', body: 'Understand the pattern and message behind dreams that keep returning — what your subconscious is trying to resolve.' },
      { emoji: '🌊', title: 'Symbolic Decoding', body: 'Translate the personal symbolic language of your dream imagery into meaningful, actionable insight.' },
      { emoji: '🌙', title: 'Past Life Dreams', body: 'Some vivid dreams may carry memories from past incarnations — advisors who specialize in identifying and interpreting these.' },
    ],
    seoBody: 'Dreams are the nightly dialogue between your conscious and unconscious mind — and learning their language is one of the most powerful tools for self-knowledge. Our dream interpretation specialists combine Jungian psychology, symbolic analysis, and psychic intuition to help you decode the messages in your sleeping mind. From anxiety dreams and flying dreams to vivid visitations from departed loved ones, our advisors provide interpretation that goes beyond symbol dictionaries to offer deeply personal insight.',
    trustStats: [
      { value: '38', label: 'Dream Interpreters' },
      { value: '4.7★', label: 'Average Rating' },
      { value: '11k+', label: 'Sessions Completed' },
      { value: '91%', label: 'Client Satisfaction' },
    ],
  },
  'career-finance': {
    hero: 'Clarity on career direction, financial decisions, and professional timing from experienced intuitive advisors',
    highlights: [
      { emoji: '💼', title: 'Career Direction', body: 'Stuck in a career that doesn\'t fit? Our advisors help you identify your true vocation and the path to get there.' },
      { emoji: '💰', title: 'Financial Insight', body: 'Intuitive guidance on financial decisions, investment timing, and the energetic patterns around your money story.' },
      { emoji: '🚀', title: 'Business & Entrepreneurship', body: 'For entrepreneurs and business owners seeking guidance on timing, strategy, and overcoming obstacles.' },
    ],
    seoBody: 'Career and financial questions are some of the most urgent and high-stakes decisions we face. Our career and finance advisors combine practical intuition with psychic insight to help you navigate professional crossroads, evaluate opportunities, and understand the energetic patterns around your work and money. Whether you\'re considering a major career change, launching a business, or seeking clarity on a financial decision, our advisors provide grounded, specific guidance that respects both the material and spiritual dimensions of prosperity.',
    trustStats: [
      { value: '45', label: 'Career Advisors' },
      { value: '4.7★', label: 'Average Rating' },
      { value: '15k+', label: 'Sessions Completed' },
      { value: '90%', label: 'Client Satisfaction' },
    ],
  },
  'mediumship': {
    hero: 'Connect with loved ones who have passed through certified mediums in a compassionate, healing session',
    highlights: [
      { emoji: '🌹', title: 'Evidential Mediumship', body: 'Mediums who provide verifiable details about departed loved ones — names, memories, and specific messages.' },
      { emoji: '🕊️', title: 'Grief Support', body: 'Compassionate guidance that helps those in grief find comfort, closure, and a continuing bond with those who have passed.' },
      { emoji: '💌', title: 'Spirit Messages', body: 'Receive the words, wisdom, and love that those who have crossed over want you to know.' },
    ],
    seoBody: 'Mediumship — the ability to communicate with those who have passed — offers profound comfort and healing for those navigating grief. Our certified mediums are rigorously vetted for genuine ability, compassion, and ethical practice. Sessions focus on providing evidential details that confirm the connection, meaningful messages, and the reassurance that love transcends physical death. We understand the profound sensitivity required for this work and match clients only with mediums who approach it with the reverence it deserves.',
    trustStats: [
      { value: '29', label: 'Certified Mediums' },
      { value: '4.9★', label: 'Average Rating' },
      { value: '9k+', label: 'Sessions Completed' },
      { value: '97%', label: 'Client Satisfaction' },
    ],
  },
}

const DEFAULT_CONTENT = {
  hero: 'Connect with expert advisors in this specialty for personalized guidance and insight',
  highlights: [],
  seoBody: 'Our verified advisors offer expert guidance in this specialty area. Browse profiles, read genuine reviews, and connect instantly via chat, audio, or video.',
  trustStats: [
    { value: '50+', label: 'Advisors' },
    { value: '4.8★', label: 'Average Rating' },
    { value: '10k+', label: 'Sessions' },
    { value: '92%', label: 'Satisfaction' },
  ],
}

// ─── Sort options ─────────────────────────────────────────────

type SortKey = 'recommended' | 'rating' | 'reviews' | 'price-low' | 'price-high'

function sortAdvisors(advisors: Advisor[], sort: SortKey) {
  const copy = [...advisors]
  switch (sort) {
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating)
    case 'reviews':
      return copy.sort((a, b) => b.reviewCount - a.reviewCount)
    case 'price-low': {
      const lowestPrice = (a: typeof advisors[0]) => {
        const prices = [a.pricing.chat, a.pricing.audio, a.pricing.video].filter((p): p is number => p !== null)
        return prices.length ? Math.min(...prices) : Infinity
      }
      return copy.sort((a, b) => lowestPrice(a) - lowestPrice(b))
    }
    case 'price-high': {
      const highestPrice = (a: typeof advisors[0]) => {
        const prices = [a.pricing.chat, a.pricing.audio, a.pricing.video].filter((p): p is number => p !== null)
        return prices.length ? Math.max(...prices) : 0
      }
      return copy.sort((a, b) => highestPrice(b) - highestPrice(a))
    }
    default: // recommended: online first, then rating
      return copy.sort((a, b) => {
        const statusOrder = { online: 0, busy: 1, offline: 2 }
        if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status]
        return b.rating - a.rating
      })
  }
}

// ─── Main ─────────────────────────────────────────────────────

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [sort, setSort] = useState<SortKey>('recommended')
  const [liveAdvisors, setLiveAdvisors] = useState<Advisor[]>([])

  useEffect(() => {
    getAdvisors({ sortBy: 'rating' })
      .then(rows => { if (rows.length > 0) setLiveAdvisors(rows.map(mapRow)) })
      .catch(console.error)
  }, [])

  const advisorSource = liveAdvisors.length > 0 ? liveAdvisors : ADVISORS

  const category = CATEGORIES.find(c => c.slug === slug)
  const content = (slug && CATEGORY_CONTENT[slug]) ? CATEGORY_CONTENT[slug] : DEFAULT_CONTENT
  const relatedArticles = getArticlesByCategory(slug ?? '').slice(0, 3)

  const advisors = useMemo(() => {
    const filtered = slug
      ? advisorSource.filter(a => a.categories.some(c => c.slug === slug))
      : advisorSource
    return sortAdvisors(filtered, sort)
  }, [slug, sort, advisorSource])

  if (!category) {
    return (
      <div style={{
        background: '#0B0F1A', minHeight: '100vh', color: '#F0F4FF',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
      }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px' }}>Category Not Found</h1>
        <button
          onClick={() => navigate('/')}
          style={{
            background: '#C9A84C', border: 'none', borderRadius: '10px',
            padding: '10px 24px', color: '#0B0F1A', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Go Home
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: '#0B0F1A', minHeight: '100vh', color: '#F0F4FF' }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,60,180,0.18) 0%, transparent 60%)',
        padding: '56px 20px 48px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
          <Star size={14} fill="#C9A84C" color="#C9A84C" />
          <span style={{ color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {advisors.filter(a => a.status === 'online').length} advisors online now
          </span>
        </div>
        <h1 style={{
          color: '#F0F4FF', fontWeight: 700, fontSize: '40px',
          fontFamily: "'Playfair Display', serif", margin: '0 0 12px',
        }}>
          {category.title}
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '17px', margin: '0 auto', maxWidth: '560px', lineHeight: 1.6 }}>
          {content.hero}
        </p>

        {/* Trust stats */}
        <div style={{
          display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap',
          marginTop: '32px',
        }}>
          {content.trustStats.map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '22px', margin: 0 }}>{stat.value}</p>
              <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* ── Sort / filter bar ── */}
        <div style={{
          padding: '16px 0', borderBottom: '1px solid #1A2235', marginBottom: '28px',
        }}>
          {/* Row 1 (mobile): count left + native select right */}
          <div className="flex md:hidden items-center justify-between gap-2 mb-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={15} color="#8B9BB4" />
              <span style={{ color: '#8B9BB4', fontSize: '14px' }}>
                {advisors.length} advisor{advisors.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              style={{
                background: '#131929', border: '1px solid #1E2D45', borderRadius: '8px',
                color: '#F0F4FF', fontSize: '13px', padding: '5px 10px',
                cursor: 'pointer', outline: 'none', minWidth: '140px', flexShrink: 0,
              }}
            >
              {([
                { key: 'recommended', label: 'Recommended' },
                { key: 'rating',      label: 'Rating'       },
                { key: 'reviews',     label: 'Reviews'      },
                { key: 'price-low',   label: 'Price ↑'      },
                { key: 'price-high',  label: 'Price ↓'      },
              ] as { key: SortKey; label: string }[]).map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Row 1 (desktop): count + sort pills in one row */}
          <div className="hidden md:flex items-center justify-between gap-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={15} color="#8B9BB4" />
              <span style={{ color: '#8B9BB4', fontSize: '14px' }}>
                {advisors.length} advisor{advisors.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SlidersHorizontal size={14} color="#8B9BB4" />
              <span style={{ color: '#8B9BB4', fontSize: '13px' }}>Sort by:</span>
              {([
                { key: 'recommended', label: 'Recommended' },
                { key: 'rating',      label: 'Rating'       },
                { key: 'reviews',     label: 'Reviews'      },
                { key: 'price-low',   label: 'Price ↑'      },
                { key: 'price-high',  label: 'Price ↓'      },
              ] as { key: SortKey; label: string }[]).map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSort(opt.key)}
                  style={{
                    padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px',
                    background: sort === opt.key ? '#C9A84C' : '#131929',
                    border: `1px solid ${sort === opt.key ? '#C9A84C' : '#1E2D45'}`,
                    color: sort === opt.key ? '#0B0F1A' : '#8B9BB4',
                    fontWeight: sort === opt.key ? 700 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Advisor grid ── */}
        {advisors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#8B9BB4', fontSize: '16px' }}>No advisors in this category yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px', marginBottom: '48px' }}>
            {advisors.map(advisor => (
              <AdvisorCard key={advisor.id} advisor={advisor} />
            ))}
          </div>
        )}

        {/* ── Category Highlights ── */}
        {content.highlights.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', fontFamily: "'Playfair Display', serif", margin: '0 0 20px', textAlign: 'center' }}>
              Types of {category.title}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {content.highlights.map(h => (
                <div
                  key={h.title}
                  style={{
                    background: '#0D1221', border: '1px solid #1A2235',
                    borderRadius: '16px', padding: '20px',
                  }}
                >
                  <p style={{ fontSize: '28px', margin: '0 0 10px' }}>{h.emoji}</p>
                  <h3 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '15px', margin: '0 0 6px' }}>{h.title}</h3>
                  <p style={{ color: '#8B9BB4', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{h.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Related articles ── */}
        {relatedArticles.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '20px', fontFamily: "'Playfair Display', serif", margin: 0 }}>
                Articles on {category.title}
              </h2>
              <button
                onClick={() => navigate('/articles')}
                style={{ color: '#C9A84C', fontSize: '13px', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                View all →
              </button>
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              {relatedArticles.map(art => (
                <div
                  key={art.slug}
                  onClick={() => navigate(`/articles/${art.slug}`)}
                  style={{
                    flex: '1 1 220px', background: '#0D1221', border: '1px solid #1A2235',
                    borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A84C' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1A2235' }}
                >
                  <img src={art.coverImage} alt={art.title} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px', margin: '0 0 6px', lineHeight: 1.4 }}>{art.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} color="#4B5563" />
                      <span style={{ color: '#4B5563', fontSize: '12px' }}>{art.readTime} min read</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SEO body ── */}
        <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ color: '#C9A84C', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
            About {category.title} on WhiteStellar
          </h3>
          <p style={{ color: '#4B5563', fontSize: '14px', lineHeight: 1.8, margin: 0 }}>
            {content.seoBody}
          </p>
        </div>
      </div>
    </div>
  )
}
