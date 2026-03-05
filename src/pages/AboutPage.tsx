// ============================================================
// WhiteStellar — About Page
// src/pages/AboutPage.tsx
// ============================================================

import { Link } from 'react-router-dom'
import { Star, Shield, Heart, Zap, Eye, Users } from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────

const SERVICES = [
  {
    icon: '🔮',
    title: 'Psychic Readings',
    body: 'Connect with gifted psychics who use their natural intuition to offer insight into your past, present, and future.',
  },
  {
    icon: '♈',
    title: 'Astrology',
    body: 'Explore your birth chart, planetary transits, and cosmic cycles with certified astrologers who make the cosmos accessible.',
  },
  {
    icon: '🃏',
    title: 'Tarot & Oracle',
    body: 'Let the cards reveal hidden truths and offer a mirror to your subconscious — read by experienced tarot practitioners.',
  },
  {
    icon: '❤️',
    title: 'Love & Relationships',
    body: 'Whether you are seeking your soulmate, healing from heartbreak, or deepening a current bond — our advisors offer compassionate clarity.',
  },
  {
    icon: '💼',
    title: 'Career & Life Path',
    body: 'Navigate career crossroads, business decisions, and life purpose questions with advisors trained in spiritual and practical guidance.',
  },
  {
    icon: '🌙',
    title: 'Dream Interpretation',
    body: 'Your subconscious speaks through dreams. Our specialists help you decode symbolic messages and apply them to your waking life.',
  },
]

const UNIQUE_POINTS = [
  {
    icon: Shield,
    title: 'Rigorous Vetting',
    body: "Every advisor on WhiteStellar passes a multi-stage screening process including background checks, skill demonstrations, and ongoing client satisfaction monitoring. Only the top 5% of applicants make the cut.",
  },
  {
    icon: Heart,
    title: 'Client-First Policy',
    body: "If you are ever unsatisfied with a reading, our satisfaction guarantee means you can request a credit — no questions asked. We stand behind every session booked on our platform.",
  },
  {
    icon: Zap,
    title: 'Always Available',
    body: 'Life does not follow a schedule, and neither do we. WhiteStellar advisors are online 24 hours a day, 7 days a week, so guidance is never more than a few clicks away.',
  },
  {
    icon: Eye,
    title: 'Real Transparency',
    body: 'Every advisor profile shows verified reviews, response rate, session count, and honest pricing — so you can make an informed choice without surprises.',
  },
]

const HOW_IT_WORKS = [
  {
    step: 1,
    emoji: '🔍',
    title: 'Find Your Advisor',
    body: 'Browse by category, read genuine verified reviews, and find the advisor who resonates with you. Filter by specialty, price, and availability.',
  },
  {
    step: 2,
    emoji: '💬',
    title: 'Start a Session',
    body: 'Connect instantly via live chat, audio call, or video call — whichever feels most comfortable for you. No setup required.',
  },
  {
    step: 3,
    emoji: '✨',
    title: 'Gain Clarity',
    body: 'Walk away with actionable guidance, renewed perspective, and the clarity you came looking for. Sessions are yours to revisit anytime.',
  },
]

const TEAM_STATS = [
  { value: '500+', label: 'Verified Advisors' },
  { value: '12,000+', label: 'Satisfied Clients' },
  { value: '4.8 / 5', label: 'Average Rating' },
  { value: '93%', label: 'Satisfaction Rate' },
]

// ─── Component ────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div style={{ background: '#0B0F1A', minHeight: '100vh', color: '#F0F4FF' }}>

      {/* ══ 1. HERO ══════════════════════════════════════════════ */}
      <section style={{
        background: 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(99,60,180,0.18) 0%, transparent 65%)',
        padding: '72px 24px 56px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <Star size={14} fill="#C9A84C" color="#C9A84C" />
          <span style={{ color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            About WhiteStellar
          </span>
        </div>
        <h1 style={{
          color: '#F0F4FF', fontWeight: 700, fontSize: '40px',
          fontFamily: "'Playfair Display', serif", margin: '0 0 16px',
          lineHeight: 1.2,
        }}>
          Bringing Cosmic Wisdom to Everyday Life
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '17px', maxWidth: '560px', marginInline: 'auto', lineHeight: 1.7 }}>
          WhiteStellar was founded on a simple belief: everyone deserves access to genuine, compassionate spiritual guidance — whenever they need it.
        </p>
      </section>

      {/* ══ 2. WHO WE ARE ════════════════════════════════════════ */}
      <section style={{ padding: '72px 24px', borderTop: '1px solid #1E2D45' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '48px', alignItems: 'center',
          }}>
            <div>
              <span style={{
                display: 'inline-block',
                background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '20px', padding: '4px 14px', fontSize: '11px',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                marginBottom: '16px',
              }}>
                Our Story
              </span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, marginBottom: '16px', lineHeight: 1.3 }}>
                Who We Are
              </h2>
              <p style={{ color: '#8B9BB4', lineHeight: 1.8, marginBottom: '14px' }}>
                WhiteStellar is a premium spiritual guidance platform that connects seekers with verified psychic advisors, astrologers, tarot readers, and spiritual coaches from around the world.
              </p>
              <p style={{ color: '#8B9BB4', lineHeight: 1.8 }}>
                We built this platform because we believe the ancient arts of divination and spiritual counsel belong in the modern world — accessible, affordable, and held to the highest standards of integrity and care.
              </p>
            </div>

            {/* Stats panel */}
            <div style={{
              background: '#0D1221', border: '1px solid #1E2D45',
              borderRadius: '20px', padding: '32px',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px',
            }}>
              {TEAM_STATS.map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <p style={{
                    fontFamily: "'Playfair Display', serif", fontSize: '28px',
                    fontWeight: 700, color: '#C9A84C', marginBottom: '4px',
                  }}>{s.value}</p>
                  <p style={{ color: '#8B9BB4', fontSize: '12px' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 3. OUR AGENDA & BELIEFS ══════════════════════════════ */}
      <section style={{ padding: '72px 24px', background: '#0D1221', borderTop: '1px solid #1E2D45' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '20px', padding: '4px 14px', fontSize: '11px',
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
            marginBottom: '16px',
          }}>
            Our Mission
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, marginBottom: '32px' }}>
            Our Agenda & Beliefs
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {[
              {
                icon: '✦',
                heading: 'Spiritual wisdom is for everyone',
                body: 'We reject the gatekeeping of ancient knowledge. Guidance should be accessible to all, regardless of background or budget.',
              },
              {
                icon: '✦',
                heading: 'Quality over quantity',
                body: 'We maintain a selective roster of advisors so that every reading you book reflects the highest standard of spiritual craft and personal care.',
              },
              {
                icon: '✦',
                heading: 'Empowerment, not dependency',
                body: 'Our goal is to give you tools and insight to live your life more confidently — not to make you dependent on readings.',
              },
              {
                icon: '✦',
                heading: 'Respect for all traditions',
                body: 'From Western astrology to Vedic charts, from classic tarot to modern oracle — we honour every spiritual tradition represented on our platform.',
              },
            ].map(item => (
              <div
                key={item.heading}
                style={{
                  background: '#131929', border: '1px solid #1E2D45',
                  borderRadius: '14px', padding: '24px',
                }}
              >
                <span style={{ fontSize: '18px', color: '#C9A84C', display: 'block', marginBottom: '10px' }}>{item.icon}</span>
                <h3 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{item.heading}</h3>
                <p style={{ color: '#8B9BB4', fontSize: '13px', lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. OUR SERVICES ══════════════════════════════════════ */}
      <section style={{ padding: '72px 24px', borderTop: '1px solid #1E2D45' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '20px', padding: '4px 14px', fontSize: '11px',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
              marginBottom: '14px',
            }}>
              What We Offer
            </span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700 }}>
              Our Services
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {SERVICES.map(s => (
              <div
                key={s.title}
                style={{
                  background: '#0D1221', border: '1px solid #1E2D45',
                  borderRadius: '16px', padding: '28px',
                }}
              >
                <span style={{ fontSize: '32px', display: 'block', marginBottom: '14px' }}>{s.icon}</span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#F0F4FF', fontWeight: 700, fontSize: '17px', marginBottom: '10px' }}>
                  {s.title}
                </h3>
                <p style={{ color: '#8B9BB4', fontSize: '13px', lineHeight: 1.7 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 5. WHAT MAKES US UNIQUE ══════════════════════════════ */}
      <section style={{ padding: '72px 24px', background: '#0D1221', borderTop: '1px solid #1E2D45' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{
              display: 'inline-block',
              background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '20px', padding: '4px 14px', fontSize: '11px',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
              marginBottom: '14px',
            }}>
              Why WhiteStellar
            </span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700 }}>
              What Makes Us Unique
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {UNIQUE_POINTS.map(point => (
              <div
                key={point.title}
                style={{
                  background: '#131929', border: '1px solid #1E2D45',
                  borderRadius: '16px', padding: '28px',
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px',
                }}>
                  <point.icon size={20} color="#C9A84C" />
                </div>
                <h3 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '16px', marginBottom: '10px' }}>
                  {point.title}
                </h3>
                <p style={{ color: '#8B9BB4', fontSize: '13px', lineHeight: 1.7 }}>{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 6. HOW IT WORKS ══════════════════════════════════════ */}
      <section style={{ padding: '72px 24px', borderTop: '1px solid #1E2D45' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: '28px',
            fontWeight: 700, textAlign: 'center', marginBottom: '48px',
          }}>
            How It Works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {HOW_IT_WORKS.map(step => (
              <div
                key={step.step}
                style={{
                  background: '#0D1221', border: '1px solid #1E2D45',
                  borderRadius: '16px', padding: '32px 24px', textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '16px' }}>{step.emoji}</span>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'rgba(201,168,76,0.15)', color: '#C9A84C',
                  fontSize: '12px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>{step.step}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#F0F4FF', fontWeight: 700, fontSize: '17px', marginBottom: '10px' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#8B9BB4', fontSize: '13px', lineHeight: 1.7 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. CTA ════════════════════════════════════════════════ */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)',
        borderTop: '1px solid #1E2D45',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '20px' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill="#C9A84C" color="#C9A84C" />
            ))}
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 700, marginBottom: '14px' }}>
            Ready to Find Your Clarity?
          </h2>
          <p style={{ color: '#8B9BB4', fontSize: '15px', marginBottom: '32px', lineHeight: 1.7 }}>
            Browse our verified advisors and start your journey today — your first 3 minutes are on us.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/"
              style={{
                background: '#C9A84C', color: '#0B0F1A',
                borderRadius: '10px', padding: '12px 28px',
                fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#E8C76A' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#C9A84C' }}
            >
              Browse Advisors
            </Link>
            <Link
              to="/contact"
              style={{
                background: 'transparent', color: '#F0F4FF',
                border: '1px solid rgba(240,244,255,0.3)',
                borderRadius: '10px', padding: '12px 28px',
                fontWeight: 600, fontSize: '15px', textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'rgba(240,244,255,0.7)'
                el.style.background = 'rgba(240,244,255,0.05)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'rgba(240,244,255,0.3)'
                el.style.background = 'transparent'
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Advisor / Users icon used in some sections */}
      <Users style={{ display: 'none' }} />
    </div>
  )
}
