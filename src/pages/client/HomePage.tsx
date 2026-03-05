import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Star, Twitter, Instagram, Facebook, Youtube } from 'lucide-react'
import { ADVISORS, CATEGORIES } from '../../data/advisors'
import AdvisorCard from '../../components/AdvisorCard'
import CategoryPill from '../../components/CategoryPill'
import MatchingWizard from '../../components/MatchingWizard'
import { useModalStore } from '../../store/modalStore'
import type { Advisor } from '../../types'

// ─── Constants ────────────────────────────────────────────────

const CYCLING_WORDS = ['Clarity', 'Love', 'Career', 'Happiness', 'Relationship', 'Self']

const STATUS_ORDER: Record<Advisor['status'], number> = { online: 0, busy: 1, offline: 2 }

// ─── Component ────────────────────────────────────────────────

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [wordIndex, setWordIndex] = useState(0)
  const [wizardOpen, setWizardOpen] = useState(false)
  const { openAuthModal } = useModalStore()

  function handleHowItWorksClick() {
    const section = document.getElementById('how-it-works')
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Cycle the hero word every 5 s
  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex(i => (i + 1) % CYCLING_WORDS.length)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const filteredAdvisors = useMemo(() => {
    const list =
      activeCategory === 'all'
        ? ADVISORS
        : ADVISORS.filter(a => a.categories.some(c => c.slug === activeCategory))
    return [...list].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
  }, [activeCategory])

  const topAdvisors = useMemo(
    () =>
      ADVISORS.filter(a => a.isTopAdvisor).sort(
        (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      ),
    []
  )

  return (
    <div style={{ background: '#0B0F1A', minHeight: '100vh', color: '#F0F4FF' }}>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 1. HERO                                                   */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[88vh] items-center justify-center overflow-hidden px-6 text-center">

        {/* Radial purple glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(99,60,180,0.22) 0%, rgba(45,30,90,0.12) 50%, transparent 100%)',
          }}
        />

        {/* Star particles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {STAR_POSITIONS.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: s.size,
                height: s.size,
                top: s.top,
                left: s.left,
                opacity: s.opacity,
                animation: `twinkle ${s.duration}s ease-in-out infinite`,
                animationDelay: s.delay,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl">
          {/* Promo badge */}
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
            style={{
              background: 'rgba(201,168,76,0.12)',
              color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.35)',
            }}
          >
            <Clock size={15} />
            3 Minutes FREE + 80% OFF For New Customers
          </div>

          {/* Animated heading */}
          <h1
            className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl"
            style={{ fontFamily: "'Playfair Display', serif", color: '#F0F4FF' }}
          >
            Find Your{' '}
            <span
              className="inline-block overflow-hidden align-bottom"
              style={{ minWidth: '220px' }}
            >
              <span
                key={wordIndex}
                className="inline-block"
                style={{ color: '#C9A84C', animation: 'wordSlideIn 0.55s cubic-bezier(0.22,1,0.36,1) both' }}
              >
                {CYCLING_WORDS[wordIndex]}
              </span>
            </span>
          </h1>

          <p className="mb-10 text-lg leading-relaxed md:text-xl" style={{ color: '#8B9BB4' }}>
            Connect with world-class advisors for guidance on love, life &amp; beyond
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setWizardOpen(true)}
              className="rounded-xl px-8 py-3.5 text-base font-semibold transition-all duration-[250ms] ease-in-out"
              style={{ background: '#C9A84C', color: '#0B0F1A' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E8C76A' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#C9A84C' }}
            >
              Explore Advisors
            </button>
            <button
              onClick={handleHowItWorksClick}
              className="rounded-xl px-8 py-3.5 text-base font-semibold transition-all duration-[250ms] ease-in-out"
              style={{ background: 'transparent', color: '#F0F4FF', border: '1px solid rgba(240,244,255,0.3)' }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement
                b.style.borderColor = 'rgba(240,244,255,0.7)'
                b.style.background = 'rgba(240,244,255,0.05)'
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement
                b.style.borderColor = 'rgba(240,244,255,0.3)'
                b.style.background = 'transparent'
              }}
            >
              How It Works
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 2. TRUST STATS                                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section style={{ background: '#0D1221', padding: '64px 0' }}>
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-4 px-6 md:grid-cols-4">
          {TRUST_STATS.map(stat => (
            <div
              key={stat.label}
              className="rounded-xl p-5"
              style={{
                background: '#131929',
                borderLeft: '3px solid #C9A84C',
              }}
            >
              <p
                className="text-3xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif", color: '#C9A84C' }}
              >
                {stat.value}
              </p>
              <p className="mt-1 text-sm" style={{ color: '#8B9BB4' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 3. CATEGORY FILTER                                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="py-8" style={{ borderTop: '1px solid #1E2D45' }}>
        <div className="mx-auto max-w-[1280px] px-6">
          <CategoryPill
            categories={CATEGORIES}
            activeSlug={activeCategory}
            onChange={setActiveCategory}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 4. AVAILABLE NOW                                          */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="py-16">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="mb-8 flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: '#2DD4BF', boxShadow: '0 0 8px #2DD4BF' }}
            />
            <h2
              className="text-2xl font-bold md:text-3xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Available Now
            </h2>
            <span
              className="ml-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ background: 'rgba(45,212,191,0.12)', color: '#2DD4BF' }}
            >
              {filteredAdvisors.filter(a => a.status === 'online').length} online
            </span>
          </div>

          {filteredAdvisors.length === 0 ? (
            <p style={{ color: '#8B9BB4' }}>No advisors in this category.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredAdvisors.map(advisor => (
                <AdvisorCard key={advisor.id} advisor={advisor} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 5. TOP RATED                                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="py-16" style={{ borderTop: '1px solid #1E2D45' }}>
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="mb-8 flex items-center gap-3">
            <Star size={22} fill="#C9A84C" color="#C9A84C" />
            <h2
              className="text-2xl font-bold md:text-3xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Top Rated Advisors
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {topAdvisors.map(advisor => (
              <AdvisorCard key={advisor.id} advisor={advisor} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 6. FEATURED IN                                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="py-14" style={{ borderTop: '1px solid #1E2D45' }}>
        <div className="mx-auto max-w-[1280px] px-6 text-center">
          <p
            className="mb-6 text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#8B9BB4' }}
          >
            As Featured In
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PUBLICATIONS.map(pub => (
              <span
                key={pub}
                className="rounded-full px-4 py-2 text-sm"
                style={{
                  background: '#131929',
                  border: '1px solid #1E2D45',
                  color: '#F0F4FF',
                }}
              >
                {pub}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 7. TESTIMONIALS TICKER                                    */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="overflow-hidden py-16" style={{ borderTop: '1px solid #1E2D45' }}>
        <div className="mb-8 text-center">
          <h2
            className="text-2xl font-bold md:text-3xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Clients Love WhiteStellar
          </h2>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-sm font-semibold" style={{ color: '#C9A84C' }}>4.8</span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#C9A84C" color="#C9A84C" />
              ))}
            </div>
            <span className="text-sm" style={{ color: '#8B9BB4' }}>average rating</span>
          </div>
        </div>

        {/* Ticker track — duplicated for seamless loop */}
        <div
          style={{
            display: 'flex',
            width: 'max-content',
            animation: 'ticker 40s linear infinite',
          }}
        >
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <div
              key={i}
              className="mx-3 flex flex-col gap-3 rounded-2xl p-6"
              style={{
                width: '320px',
                background: '#131929',
                border: '1px solid #1E2D45',
                flexShrink: 0,
              }}
            >
              <span
                className="text-4xl leading-none"
                style={{ color: '#C9A84C', fontFamily: 'Georgia, serif' }}
              >
                "
              </span>
              <p className="text-sm leading-relaxed" style={{ color: '#F0F4FF' }}>
                {t.text}
              </p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} size={12} fill="#C9A84C" color="#C9A84C" />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#F0F4FF' }}>{t.name}</p>
                <p className="text-xs" style={{ color: '#8B9BB4' }}>{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 8. HOW IT WORKS                                           */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-16" style={{ borderTop: '1px solid #1E2D45' }}>
        <div className="mx-auto max-w-[1280px] px-6">
          <h2
            className="mb-12 text-center text-2xl font-bold md:text-3xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-2xl p-8 text-center"
                style={{ background: '#131929', border: '1px solid #1E2D45' }}
              >
                <span className="mb-5 text-4xl">{step.emoji}</span>
                <div
                  className="mb-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}
                >
                  {i + 1}
                </div>
                <h3
                  className="mb-3 text-lg font-semibold"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#F0F4FF' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8B9BB4' }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 9. PLATFORM BENEFITS                                      */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="py-16" style={{ borderTop: '1px solid #1E2D45' }}>
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-2">

            {/* Left — bullet list */}
            <div>
              <h2
                className="mb-8 text-2xl font-bold leading-snug md:text-3xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                The Best Online Psychic Readings on WhiteStellar
              </h2>
              <ul className="flex flex-col gap-5">
                {PLATFORM_BENEFITS.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-base" style={{ color: '#C9A84C' }}>✦</span>
                    <p className="text-sm leading-relaxed" style={{ color: '#8B9BB4' }}>
                      <span className="font-semibold" style={{ color: '#F0F4FF' }}>
                        {b.bold}{' '}
                      </span>
                      {b.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — decorative stacked advisor cards */}
            <div className="relative flex flex-col items-center justify-center" style={{ minHeight: '360px' }}>
              {/* Sparkles */}
              {SPARKLE_POSITIONS.map((sp, i) => (
                <span
                  key={i}
                  className="pointer-events-none absolute text-sm"
                  style={{ top: sp.top, left: sp.left, color: '#C9A84C', opacity: sp.opacity }}
                >
                  ✦
                </span>
              ))}

              {/* Card 2 — behind */}
              <div
                className="absolute w-full max-w-sm rounded-xl p-4"
                style={{
                  background: '#131929',
                  border: '1px solid #1E2D45',
                  top: '10%',
                  transform: 'rotate(3deg) scale(0.96)',
                  zIndex: 1,
                }}
              >
                <MiniAdvisorCard advisor={ADVISORS[1]} />
              </div>

              {/* Card 1 — front */}
              <div
                className="relative w-full max-w-sm rounded-xl p-4"
                style={{
                  background: '#131929',
                  border: '1px solid #1E2D45',
                  boxShadow: '0 12px 40px rgba(201,168,76,0.12)',
                  top: '8%',
                  zIndex: 2,
                }}
              >
                <MiniAdvisorCard advisor={ADVISORS[0]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 10. WELCOME BONUS                                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 text-center">
        {/* Gold radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(201,168,76,0.1) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-2xl px-6">
          <span
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold"
            style={{
              background: 'rgba(201,168,76,0.12)',
              color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.3)',
            }}
          >
            New Member Offer
          </span>

          <h2
            className="mb-4 text-3xl font-bold md:text-4xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Start Your Journey Today
          </h2>
          <p className="mb-10 text-base" style={{ color: '#8B9BB4' }}>
            Get 3 minutes free + 80% off your first session with any advisor
          </p>

          {/* Reward boxes */}
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {REWARDS.map(r => (
              <div
                key={r.title}
                className="rounded-xl p-5 text-left"
                style={{ background: '#131929', border: '1px solid #1E2D45' }}
              >
                <p className="mb-2 text-2xl">{r.emoji}</p>
                <p className="font-bold" style={{ color: '#F0F4FF' }}>{r.title}</p>
                <p className="mt-1 text-sm" style={{ color: '#8B9BB4' }}>{r.description}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => openAuthModal('register')}
            className="w-full rounded-xl py-4 text-base font-bold transition-all duration-[250ms] ease-in-out sm:w-auto sm:px-12"
            style={{ background: '#C9A84C', color: '#0B0F1A' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E8C76A' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#C9A84C' }}
          >
            Claim Your Free Minutes
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 11. SEO COPY                                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="py-16" style={{ borderTop: '1px solid #1E2D45' }}>
        <div className="mx-auto max-w-[1280px] px-6">
          <h2
            className="mb-10 text-center text-xl font-bold md:text-2xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Getting Started with WhiteStellar is Simple
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {SEO_COLUMNS.map(col => (
              <div key={col.heading}>
                <h3
                  className="mb-3 text-sm font-bold uppercase tracking-wider"
                  style={{ color: '#C9A84C' }}
                >
                  {col.heading}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8B9BB4' }}>
                  {col.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 12. FOOTER                                               */}
      {/* ══════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#080C16', borderTop: '1px solid #1A2235', padding: '64px 0 32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

          {/* ── 4-column grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '56px',
          }}>

            {/* Col 1: Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '20px', color: '#C9A84C' }}>✦</span>
                <span style={{ fontWeight: 700, fontSize: '18px', color: '#F0F4FF', fontFamily: "'Playfair Display', serif" }}>
                  WhiteStellar
                </span>
              </div>
              <p style={{ color: '#8B9BB4', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px', maxWidth: '220px' }}>
                Your trusted platform for psychic readings, astrology, tarot, and spiritual guidance — available 24/7.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {([
                  { Icon: Twitter,   label: 'Twitter' },
                  { Icon: Instagram, label: 'Instagram' },
                  { Icon: Facebook,  label: 'Facebook' },
                  { Icon: Youtube,   label: 'Youtube' },
                ] as const).map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: '#131929', border: '1px solid #1E2D45',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#8B9BB4', transition: 'all 0.15s', textDecoration: 'none',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.borderColor = '#C9A84C'
                      el.style.color = '#C9A84C'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.borderColor = '#1E2D45'
                      el.style.color = '#8B9BB4'
                    }}
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Platform */}
            <div>
              <h4 style={{
                color: '#F0F4FF', fontWeight: 700, fontSize: '13px',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px',
              }}>Platform</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Advisors',      to: '/advisors' },
                  { label: 'Categories',   to: '/category/astrology' },
                  { label: 'Zodiac AI',    to: '/zodiac-ai' },
                  { label: 'Articles',     to: '/articles' },
                  { label: 'How It Works', to: '/' },
                ].map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      style={{ color: '#8B9BB4', fontSize: '13px', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#8B9BB4' }}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Support */}
            <div>
              <h4 style={{
                color: '#F0F4FF', fontWeight: 700, fontSize: '13px',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px',
              }}>Support</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'FAQ',            to: '/faq' },
                  { label: 'Contact Us',     to: '/contact' },
                  { label: 'Privacy Policy', to: '/privacy' },
                  { label: 'About Us',       to: '/about' },
                ].map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      style={{ color: '#8B9BB4', fontSize: '13px', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#8B9BB4' }}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Join Us */}
            <div>
              <h4 style={{
                color: '#F0F4FF', fontWeight: 700, fontSize: '13px',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px',
              }}>Join Us</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <li>
                  <button
                    onClick={() => openAuthModal('register', 'advisor')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4', fontSize: '13px', padding: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C9A84C' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#8B9BB4' }}
                  >Join as an Advisor</button>
                </li>
                <li>
                  <Link
                    to="#"
                    style={{ color: '#8B9BB4', fontSize: '13px', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#8B9BB4' }}
                  >Affiliate Program</Link>
                </li>
              </ul>

              {/* Gold CTA box */}
              <div style={{
                border: '1px solid rgba(201,168,76,0.35)', borderRadius: '12px',
                padding: '16px', background: 'rgba(201,168,76,0.05)',
              }}>
                <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>New Members</p>
                <p style={{ color: '#8B9BB4', fontSize: '12px', marginBottom: '12px', lineHeight: 1.5 }}>
                  Get 3 free minutes + 80% off your first session
                </p>
                <button
                  onClick={() => openAuthModal('register')}
                  style={{
                    display: 'block', textAlign: 'center', background: '#C9A84C', color: '#0B0F1A',
                    borderRadius: '8px', padding: '8px 0', fontSize: '12px', fontWeight: 700,
                    border: 'none', cursor: 'pointer', transition: 'background 0.15s', width: '100%',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E8C76A' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#C9A84C' }}
                >
                  Claim Free Minutes
                </button>
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={{ height: '1px', background: '#1A2235', marginBottom: '24px' }} />

          {/* ── Bottom bar ── */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center',
            justifyContent: 'space-between', gap: '12px',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: '#4B5563', fontSize: '12px' }}>© 2025 WhiteStellar. All rights reserved.</span>
              <a
                href="mailto:service@whitestellar.com"
                style={{ color: '#4B5563', fontSize: '12px', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#8B9BB4' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#4B5563' }}
              >
                service@whitestellar.com
              </a>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link
                to="/privacy"
                style={{ color: '#4B5563', fontSize: '12px', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#8B9BB4' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#4B5563' }}
              >Privacy Policy</Link>
              <Link
                to="/terms"
                style={{ color: '#4B5563', fontSize: '12px', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#8B9BB4' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#4B5563' }}
              >Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      <MatchingWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} />

      {/* ── Global keyframes ── */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 0.45; transform: scale(1.4); }
        }
        @keyframes wordSlideIn {
          from { transform: translateY(32px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

// ─── Mini advisor card (non-interactive visual) ───────────────

function MiniAdvisorCard({ advisor }: { advisor: (typeof ADVISORS)[0] }) {
  const statusColors: Record<string, string> = {
    online: '#2DD4BF', busy: '#F59E0B', offline: '#4B5563',
  }
  const color = statusColors[advisor.status]
  return (
    <div className="flex items-center gap-3">
      <img
        src={advisor.avatar}
        alt={advisor.fullName}
        className="rounded-full object-cover"
        style={{ width: '56px', height: '56px' }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold" style={{ color: '#F0F4FF' }}>
          {advisor.fullName}
        </p>
        <p className="truncate text-xs" style={{ color: '#8B9BB4' }}>
          {advisor.specializations.slice(0, 2).map(s => s.title).join(' · ')}
        </p>
        <div className="mt-1 flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
          <span className="text-xs font-medium capitalize" style={{ color }}>
            {advisor.status}
          </span>
          <span className="ml-2 text-xs font-semibold" style={{ color: '#C9A84C' }}>
            From ${Math.min(
              ...[advisor.pricing.chat, advisor.pricing.audio, advisor.pricing.video]
                .filter((p): p is number => p !== null)
            ).toFixed(2)}/min
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Static data ──────────────────────────────────────────────

const TRUST_STATS = [
  { value: '12,000+', label: 'Satisfied Clients' },
  { value: '4.8/5',   label: 'Average Rating' },
  { value: '500+',    label: 'Verified Advisors' },
  { value: '93%',     label: 'Satisfaction Rate' },
]

const PUBLICATIONS = [
  'The New York Times',
  'Forbes',
  'Refinery29',
  'Bustle',
  'Well+Good',
  'Cosmopolitan',
]

const TESTIMONIALS = [
  {
    name: 'Nicole',
    location: 'California',
    text: 'The reading was exactly what I needed. I felt more confident and clear after my session.',
  },
  {
    name: 'James',
    location: 'New York',
    text: 'Luna picked up on things no one could have known. Truly life-changing accuracy.',
  },
  {
    name: 'Valerie',
    location: 'Texas',
    text: 'I was skeptical at first, but my advisor was spot-on. I rarely leave reviews but had to here.',
  },
  {
    name: 'Miriam',
    location: 'Florida',
    text: 'The session helped me through a difficult time. I felt heard, supported and guided.',
  },
  {
    name: 'Rachel',
    location: 'Arizona',
    text: 'Connected with my departed mother. The details she shared were undeniable. Forever grateful.',
  },
  {
    name: 'Paige',
    location: 'London',
    text: 'Working with my advisor helped me rebuild my confidence and find clarity on my path forward.',
  },
]

const HOW_IT_WORKS = [
  {
    emoji: '🔍',
    title: 'Find Your Advisor',
    description: 'Browse by category, read genuine reviews, and find the advisor who resonates with you.',
  },
  {
    emoji: '💬',
    title: 'Start a Session',
    description: 'Connect instantly via chat, audio or video — whichever feels most comfortable for you.',
  },
  {
    emoji: '✨',
    title: 'Gain Clarity',
    description: 'Walk away with actionable guidance and the clarity you came looking for.',
  },
]

const PLATFORM_BENEFITS = [
  {
    bold: 'Receive spiritual guidance.',
    body: 'Our advisors share insights to help you reflect on your life path and personal values.',
  },
  {
    bold: 'Become more self-aware.',
    body: 'Connect with your inner world to understand the patterns shaping your thoughts and emotions.',
  },
  {
    bold: 'Reflect on future decisions.',
    body: 'Our advisors offer fresh perspectives as you navigate life\'s crossroads.',
  },
  {
    bold: 'Redefine your relationships.',
    body: 'Find clarity on love, connection, and emotional healing with compassionate guidance.',
  },
  {
    bold: 'Explore your inner world.',
    body: 'From tarot to astrology to mediumship — find the approach that resonates with you.',
  },
]

const SPARKLE_POSITIONS = [
  { top: '5%',  left: '8%',  opacity: 0.7 },
  { top: '12%', left: '88%', opacity: 0.5 },
  { top: '78%', left: '5%',  opacity: 0.6 },
  { top: '85%', left: '82%', opacity: 0.8 },
  { top: '45%', left: '95%', opacity: 0.4 },
  { top: '50%', left: '2%',  opacity: 0.5 },
]

const REWARDS = [
  {
    emoji: '🎁',
    title: '3 Free Minutes',
    description: 'Try any advisor with no commitment whatsoever.',
  },
  {
    emoji: '⚡',
    title: '80% Off',
    description: 'Your first paid session at a fraction of the price.',
  },
]

const SEO_COLUMNS = [
  {
    heading: 'Find Your Advisor',
    body: 'Browse hundreds of verified psychic advisors across categories including love & relationships, tarot, astrology, mediumship, and spiritual guidance. Read genuine reviews, check availability, and find the advisor who resonates with you.',
  },
  {
    heading: 'Connect Instantly',
    body: 'Start a session in seconds via live chat, phone, or video call — whichever feels most comfortable. Our advisors are available around the clock so you can seek guidance whenever you need it most.',
  },
  {
    heading: 'Gain Real Clarity',
    body: 'Walk away from every session with actionable insights and a clearer path forward. WhiteStellar advisors are here to help you navigate love, career, family, and life decisions with confidence and peace of mind.',
  },
]

const STAR_POSITIONS = [
  { size: '2px', top: '8%',  left: '12%', opacity: 0.15, duration: 3.2, delay: '0s' },
  { size: '1px', top: '15%', left: '28%', opacity: 0.2,  duration: 4.1, delay: '0.6s' },
  { size: '2px', top: '22%', left: '72%', opacity: 0.12, duration: 3.8, delay: '1.2s' },
  { size: '1px', top: '35%', left: '88%', opacity: 0.18, duration: 5.0, delay: '0.3s' },
  { size: '2px', top: '48%', left: '5%',  opacity: 0.1,  duration: 3.5, delay: '1.8s' },
  { size: '1px', top: '55%', left: '42%', opacity: 0.22, duration: 4.6, delay: '0.9s' },
  { size: '2px', top: '62%', left: '60%', opacity: 0.14, duration: 3.1, delay: '2.1s' },
  { size: '1px', top: '75%', left: '20%', opacity: 0.2,  duration: 4.3, delay: '0.4s' },
  { size: '2px', top: '80%', left: '80%', opacity: 0.13, duration: 3.9, delay: '1.5s' },
  { size: '1px', top: '90%', left: '50%', opacity: 0.17, duration: 5.2, delay: '0.7s' },
  { size: '2px', top: '5%',  left: '55%', opacity: 0.11, duration: 3.4, delay: '2.4s' },
  { size: '1px', top: '30%', left: '95%', opacity: 0.19, duration: 4.8, delay: '1.1s' },
  { size: '2px', top: '68%', left: '35%', opacity: 0.16, duration: 3.7, delay: '0.2s' },
  { size: '1px', top: '12%', left: '45%', opacity: 0.21, duration: 4.2, delay: '1.9s' },
  { size: '2px', top: '42%', left: '78%', opacity: 0.13, duration: 3.3, delay: '0.8s' },
  { size: '1px', top: '88%', left: '8%',  opacity: 0.18, duration: 5.1, delay: '1.4s' },
  { size: '2px', top: '25%', left: '15%', opacity: 0.14, duration: 3.6, delay: '2.2s' },
  { size: '1px', top: '70%', left: '65%', opacity: 0.2,  duration: 4.5, delay: '0.5s' },
  { size: '2px', top: '50%', left: '92%', opacity: 0.12, duration: 3.0, delay: '1.7s' },
  { size: '1px', top: '95%', left: '30%', opacity: 0.16, duration: 4.9, delay: '2.6s' },
]
