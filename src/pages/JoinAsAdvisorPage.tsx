// ============================================================
// WhiteStellar — Join as Advisor Page
// src/pages/JoinAsAdvisorPage.tsx
// ============================================================

import { Link } from 'react-router-dom'
import { Star, DollarSign, Shield, Users, Clock, CheckCircle } from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────

const WHY_WS = [
  {
    icon: DollarSign,
    title: 'Competitive Earnings',
    body: 'Set your own per-minute rate and keep the majority of every session you complete. No hidden cuts or arbitrary caps on your income.',
  },
  {
    icon: Users,
    title: 'Global Client Base',
    body: 'Reach thousands of seekers from over 50 countries — without building a social media following or running ads. We bring clients to you.',
  },
  {
    icon: Clock,
    title: 'Work on Your Schedule',
    body: 'Toggle availability with one tap. Accept sessions when you want, go offline whenever you need to rest. Your practice, your schedule.',
  },
  {
    icon: Shield,
    title: 'Protected & Supported',
    body: 'We handle billing, disputes, and technical support so you can focus on what you do best — giving transformational readings.',
  },
]

const HOW_IT_WORKS = [
  {
    step: 1,
    emoji: '📝',
    title: 'Apply Online',
    body: 'Complete our application form with your specialties, experience, sample reading, and a brief bio. Applications typically take 10–15 minutes.',
  },
  {
    step: 2,
    emoji: '🔍',
    title: 'Get Vetted',
    body: 'Our senior review team assesses your application and may schedule a demonstration reading. We assess skill, ethics, and communication.',
  },
  {
    step: 3,
    emoji: '🚀',
    title: 'Go Live & Earn',
    body: 'Once approved, set up your profile, set your rates, toggle online, and start receiving session requests from real clients immediately.',
  },
]

const EARNINGS = [
  {
    title: 'Beginner',
    rate: '$2.99',
    label: '/min',
    hours: '3 hrs/day',
    monthly: '~$1,600',
    color: '#8B9BB4',
  },
  {
    title: 'Established',
    rate: '$4.99',
    label: '/min',
    hours: '5 hrs/day',
    monthly: '~$4,500',
    color: '#C9A84C',
    highlight: true,
  },
  {
    title: 'Top Advisor',
    rate: '$7.99',
    label: '/min',
    hours: '8 hrs/day',
    monthly: '~$11,500',
    color: '#2DD4BF',
  },
]

const REQUIREMENTS = [
  'Genuine psychic, tarot, astrology, or spiritual healing abilities',
  'Strong written and verbal communication in English',
  'Ability to type a minimum of 30 words per minute for chat sessions',
  'A quiet, private space with reliable high-speed internet',
  'A webcam and headset for audio/video sessions',
  'A positive, empathetic, and ethical approach to every reading',
  'Commitment to maintaining a minimum 4.0 client satisfaction rating',
  'Availability to complete at least 10 sessions per month',
]

const TESTIMONIALS = [
  {
    name: 'Luna Star',
    specialty: 'Tarot & Intuitive Reading',
    avatar: 'https://i.pravatar.cc/150?img=5',
    text: "Joining WhiteStellar completely changed my life. Within my first month I replaced my full-time income. The platform handles everything — I just focus on giving great readings.",
    rating: 5,
    earnings: '$6,200/mo avg',
  },
  {
    name: 'Marcus Light',
    specialty: 'Vedic Astrology & Life Path',
    avatar: 'https://i.pravatar.cc/150?img=12',
    text: "I was skeptical at first, but the clients here are genuinely seeking guidance. The support team is responsive, payments are always on time, and I love the flexibility.",
    rating: 5,
    earnings: '$4,800/mo avg',
  },
  {
    name: 'Celestine Rose',
    specialty: 'Mediumship & Spiritual Healing',
    avatar: 'https://i.pravatar.cc/150?img=45',
    text: "WhiteStellar helped me build a real spiritual practice with a steady client base. The tools they provide are excellent and I feel valued and respected as an advisor.",
    rating: 5,
    earnings: '$9,100/mo avg',
  },
]

// ─── Component ────────────────────────────────────────────────

export default function JoinAsAdvisorPage() {
  return (
    <div style={{ background: '#0B0F1A', minHeight: '100vh', color: '#F0F4FF' }}>

      {/* ══ 1. HERO ══════════════════════════════════════════════ */}
      <section style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,60,180,0.2) 0%, transparent 65%)',
        padding: '80px 24px 64px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
          <Star size={14} fill="#C9A84C" color="#C9A84C" />
          <span style={{ color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Become an Advisor
          </span>
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '42px', fontWeight: 700,
          lineHeight: 1.2, margin: '0 0 16px',
          maxWidth: '680px', marginInline: 'auto',
        }}>
          Share Your Gift. Build Your Practice. Earn on Your Terms.
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '17px', maxWidth: '540px', marginInline: 'auto', lineHeight: 1.7, marginBottom: '36px' }}>
          Join thousands of psychic advisors, astrologers, tarot readers, and spiritual coaches who earn a living doing what they love — on WhiteStellar.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="mailto:service@whitestellar.com?subject=Advisor Application"
            style={{
              background: '#C9A84C', color: '#0B0F1A',
              borderRadius: '12px', padding: '14px 32px',
              fontWeight: 700, fontSize: '16px', textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#E8C76A' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#C9A84C' }}
          >
            Apply Now — It is Free
          </a>
          <a
            href="#how-it-works"
            style={{
              background: 'transparent', color: '#F0F4FF',
              border: '1px solid rgba(240,244,255,0.3)',
              borderRadius: '12px', padding: '14px 32px',
              fontWeight: 600, fontSize: '16px', textDecoration: 'none',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = 'rgba(240,244,255,0.6)'
              el.style.background = 'rgba(240,244,255,0.05)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = 'rgba(240,244,255,0.3)'
              el.style.background = 'transparent'
            }}
          >
            See How It Works
          </a>
        </div>

        {/* Hero stats */}
        <div style={{
          display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap',
          marginTop: '48px',
        }}>
          {[
            { value: '500+', label: 'Active Advisors' },
            { value: '$4.5M+', label: 'Paid to Advisors' },
            { value: '4.8 / 5', label: 'Advisor Satisfaction' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700, color: '#C9A84C' }}>{stat.value}</p>
              <p style={{ color: '#8B9BB4', fontSize: '13px' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 2. WHY WHITESTELLAR ══════════════════════════════════ */}
      <section style={{ padding: '72px 24px', borderTop: '1px solid #1E2D45' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 700 }}>
              Why Advisors Choose WhiteStellar
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {WHY_WS.map(item => (
              <div
                key={item.title}
                style={{
                  background: '#0D1221', border: '1px solid #1E2D45',
                  borderRadius: '16px', padding: '28px',
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px',
                }}>
                  <item.icon size={20} color="#C9A84C" />
                </div>
                <h3 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '16px', marginBottom: '10px' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#8B9BB4', fontSize: '13px', lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 3. HOW IT WORKS ══════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '72px 24px', background: '#0D1221', borderTop: '1px solid #1E2D45' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 700 }}>
              How to Get Started
            </h2>
            <p style={{ color: '#8B9BB4', fontSize: '15px', marginTop: '10px' }}>
              From application to first earnings in as little as 3–5 business days.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {HOW_IT_WORKS.map(step => (
              <div
                key={step.step}
                style={{
                  background: '#131929', border: '1px solid #1E2D45',
                  borderRadius: '16px', padding: '32px 24px', textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '14px' }}>{step.emoji}</span>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'rgba(201,168,76,0.15)', color: '#C9A84C',
                  fontSize: '13px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
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

      {/* ══ 4. EARNINGS ══════════════════════════════════════════ */}
      <section style={{ padding: '72px 24px', borderTop: '1px solid #1E2D45' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 700 }}>
              Earning Potential
            </h2>
            <p style={{ color: '#8B9BB4', fontSize: '15px', marginTop: '10px', maxWidth: '520px', marginInline: 'auto' }}>
              Your earnings depend on your rate, hours, and client demand. Here are realistic scenarios based on current advisor data.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {EARNINGS.map(e => (
              <div
                key={e.title}
                style={{
                  background: e.highlight ? 'rgba(201,168,76,0.06)' : '#0D1221',
                  border: `1px solid ${e.highlight ? 'rgba(201,168,76,0.4)' : '#1E2D45'}`,
                  borderRadius: '20px', padding: '32px 24px', textAlign: 'center',
                  position: 'relative',
                }}
              >
                {e.highlight && (
                  <span style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: '#C9A84C', color: '#0B0F1A',
                    borderRadius: '20px', padding: '3px 14px',
                    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  }}>Most Common</span>
                )}
                <p style={{ color: '#4B5563', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  {e.title}
                </p>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 700, color: e.color }}>{e.rate}</span>
                  <span style={{ color: '#8B9BB4', fontSize: '14px' }}>{e.label}</span>
                </div>
                <p style={{ color: '#8B9BB4', fontSize: '13px', marginBottom: '16px' }}>{e.hours} active</p>
                <div style={{
                  background: '#131929', borderRadius: '12px', padding: '12px',
                  border: '1px solid #1E2D45',
                }}>
                  <p style={{ color: '#4B5563', fontSize: '11px', marginBottom: '2px' }}>Estimated monthly</p>
                  <p style={{ color: e.color, fontWeight: 700, fontSize: '22px', fontFamily: "'Playfair Display', serif" }}>{e.monthly}</p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ color: '#4B5563', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
            * Estimates based on platform averages. Actual earnings vary based on experience, specialty, and session volume.
          </p>
        </div>
      </section>

      {/* ══ 5. REQUIREMENTS ══════════════════════════════════════ */}
      <section style={{ padding: '72px 24px', background: '#0D1221', borderTop: '1px solid #1E2D45' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 700 }}>
              Requirements to Join
            </h2>
            <p style={{ color: '#8B9BB4', fontSize: '15px', marginTop: '10px' }}>
              We maintain high standards to protect both clients and advisors.
            </p>
          </div>
          <div style={{
            background: '#131929', border: '1px solid #1E2D45',
            borderRadius: '20px', padding: '36px 32px',
          }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {REQUIREMENTS.map((req, i) => (
                <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <CheckCircle size={16} color="#2DD4BF" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: '#8B9BB4', fontSize: '14px', lineHeight: 1.6 }}>{req}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{
            background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '14px', padding: '20px 24px', marginTop: '20px',
          }}>
            <p style={{ color: '#C9A84C', fontSize: '13px', lineHeight: 1.7 }}>
              <strong>Not sure if you qualify?</strong> Apply anyway — our team reviews every application individually. We welcome advisors at all career stages, from seasoned professionals to talented newcomers.
            </p>
          </div>
        </div>
      </section>

      {/* ══ 6. ADVISOR TESTIMONIALS ══════════════════════════════ */}
      <section style={{ padding: '72px 24px', borderTop: '1px solid #1E2D45' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 700 }}>
              Hear from Our Advisors
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {TESTIMONIALS.map(t => (
              <div
                key={t.name}
                style={{
                  background: '#0D1221', border: '1px solid #1E2D45',
                  borderRadius: '20px', padding: '28px',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <img
                    src={t.avatar}
                    alt={t.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #C9A84C', objectFit: 'cover' }}
                  />
                  <div>
                    <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '15px' }}>{t.name}</p>
                    <p style={{ color: '#8B9BB4', fontSize: '12px' }}>{t.specialty}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '12px' }}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={12} fill="#C9A84C" color="#C9A84C" />
                  ))}
                </div>
                <p style={{ color: '#8B9BB4', fontSize: '13px', lineHeight: 1.8, marginBottom: '16px' }}>
                  "{t.text}"
                </p>
                <div style={{
                  background: '#131929', borderRadius: '8px', padding: '8px 14px',
                  display: 'inline-block',
                }}>
                  <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '13px' }}>{t.earnings}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. BOTTOM CTA ════════════════════════════════════════ */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)',
        borderTop: '1px solid #1E2D45',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 700, marginBottom: '14px' }}>
            Ready to Start Your Journey?
          </h2>
          <p style={{ color: '#8B9BB4', fontSize: '15px', marginBottom: '32px', lineHeight: 1.7 }}>
            Applications are free, reviewed within 3 business days, and completely confidential. Take the first step toward building the spiritual practice you deserve.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:service@whitestellar.com?subject=Advisor Application"
              style={{
                background: '#C9A84C', color: '#0B0F1A',
                borderRadius: '12px', padding: '14px 32px',
                fontWeight: 700, fontSize: '16px', textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#E8C76A' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#C9A84C' }}
            >
              Apply Now
            </a>
            <Link
              to="/contact"
              style={{
                background: 'transparent', color: '#F0F4FF',
                border: '1px solid rgba(240,244,255,0.3)',
                borderRadius: '12px', padding: '14px 32px',
                fontWeight: 600, fontSize: '16px', textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'rgba(240,244,255,0.6)'
                el.style.background = 'rgba(240,244,255,0.05)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'rgba(240,244,255,0.3)'
                el.style.background = 'transparent'
              }}
            >
              Ask a Question
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
