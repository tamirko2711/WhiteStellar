// ============================================================
// WhiteStellar — FAQ Page
// src/pages/FAQPage.tsx
// ============================================================

import { useState, useMemo } from 'react'
import { ChevronDown, Search, Star } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

// ─── FAQ Data ─────────────────────────────────────────────────

const FAQS: FAQItem[] = [
  // General
  {
    id: 'g1',
    category: 'General',
    question: 'What is WhiteStellar?',
    answer: 'WhiteStellar is a premium online spiritual guidance platform that connects you with verified psychic advisors, astrologers, tarot readers, mediums, and spiritual coaches. Our advisors are available 24/7 via live chat, audio, and video.',
  },
  {
    id: 'g2',
    category: 'General',
    question: 'Are the advisors on WhiteStellar real and verified?',
    answer: 'Yes. Every advisor goes through a rigorous multi-stage application process that includes background checks, skill demonstrations reviewed by senior practitioners, and an ongoing client satisfaction monitoring system. Only the top 5% of applicants are accepted onto the platform.',
  },
  {
    id: 'g3',
    category: 'General',
    question: 'What types of readings are available?',
    answer: 'We offer a wide range of spiritual services including psychic readings, astrology and birth chart interpretations, tarot and oracle card readings, mediumship, love and relationship guidance, career and life path coaching, dream interpretation, and spiritual healing.',
  },
  {
    id: 'g4',
    category: 'General',
    question: 'Can I try WhiteStellar for free?',
    answer: 'Absolutely. New members receive 3 free minutes with any advisor, plus 80% off their first paid session. No credit card is required to create an account — you only need payment details when you are ready to add funds to your wallet.',
  },
  {
    id: 'g5',
    category: 'General',
    question: 'Is WhiteStellar available in my country?',
    answer: 'WhiteStellar is available worldwide. Our advisors and clients come from over 50 countries. Sessions are primarily conducted in English, though many advisors offer readings in other languages. Check individual advisor profiles for language options.',
  },

  // Payments
  {
    id: 'p1',
    category: 'Payments',
    question: 'How does billing work?',
    answer: 'Sessions are billed per minute based on the rate shown on each advisor\'s profile. You add funds to your WhiteStellar wallet in advance, and the per-minute charge is deducted in real time as your session progresses. You can end the session at any time.',
  },
  {
    id: 'p2',
    category: 'Payments',
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover), PayPal, and Apple Pay. All transactions are processed securely through encrypted payment gateways.',
  },
  {
    id: 'p3',
    category: 'Payments',
    question: 'Can I get a refund?',
    answer: 'Yes. If you are unsatisfied with a reading for any reason, please contact our support team within 24 hours of the session. We review all refund requests on a case-by-case basis and issue credits or refunds to eligible requests promptly. We have a strong satisfaction guarantee.',
  },
  {
    id: 'p4',
    category: 'Payments',
    question: 'Are there any hidden fees?',
    answer: 'No. The per-minute rate displayed on an advisor\'s profile is exactly what you pay. There are no connection fees, platform fees, or hidden charges. What you see is what you pay.',
  },
  {
    id: 'p5',
    category: 'Payments',
    question: 'Does my wallet balance expire?',
    answer: 'No. Your WhiteStellar wallet balance never expires. Any unspent funds remain in your account indefinitely and can be used for any future session.',
  },

  // Sessions
  {
    id: 's1',
    category: 'Sessions',
    question: 'How do I start a session?',
    answer: 'Simply browse our advisor listings, choose the advisor you feel drawn to, select your preferred session type (chat, audio, or video), and click "Start Session." You will be connected instantly if the advisor is available, or you can schedule a future appointment.',
  },
  {
    id: 's2',
    category: 'Sessions',
    question: 'What if my advisor is offline?',
    answer: 'You can leave a message or schedule a future appointment on any advisor\'s profile page. You can also browse our full roster of online advisors — with hundreds of verified specialists, someone is always available.',
  },
  {
    id: 's3',
    category: 'Sessions',
    question: 'Can I choose between chat, audio, and video?',
    answer: 'Yes. Each advisor offers one or more session formats. Chat sessions are text-based and great for those who prefer to type. Audio sessions are voice-only. Video sessions are face-to-face. Each may have a different per-minute rate, which is clearly listed on the profile.',
  },
  {
    id: 's4',
    category: 'Sessions',
    question: 'How long should a session be?',
    answer: 'Session length is entirely up to you. Some clients get meaningful clarity in 5-10 minutes; others prefer longer 30-60 minute deep-dive readings. You are in control and can end the session at any time by simply closing the chat or call.',
  },
  {
    id: 's5',
    category: 'Sessions',
    question: 'Are my sessions private and confidential?',
    answer: 'Yes. All sessions on WhiteStellar are completely private and confidential. Your conversations are encrypted and never shared with third parties. Our advisors are also bound by a strict confidentiality policy as part of their agreement with the platform.',
  },

  // Account
  {
    id: 'a1',
    category: 'Account',
    question: 'How do I create an account?',
    answer: 'Click "Sign Up" at the top of any page. You can register with your email address or sign in directly with Google or Apple. Account creation takes less than 60 seconds and is completely free.',
  },
  {
    id: 'a2',
    category: 'Account',
    question: 'How do I change my password?',
    answer: 'Go to your Account Settings (Dashboard > Account Settings) and click the "Change Password" section. You will need to confirm your current password before setting a new one. If you have forgotten your password, use the "Forgot Password" link on the login page.',
  },
  {
    id: 'a3',
    category: 'Account',
    question: 'Can I delete my account?',
    answer: 'Yes. You can delete your account at any time from Dashboard > Account Settings > Danger Zone. Please note that account deletion is permanent and all your session history, reviews, and wallet balance will be forfeited. We recommend withdrawing any remaining balance before deleting.',
  },
  {
    id: 'a4',
    category: 'Account',
    question: 'Is my personal information safe?',
    answer: 'We take data privacy very seriously. Your personal information is stored securely using industry-standard encryption, never sold to third parties, and handled in accordance with our Privacy Policy and applicable data protection laws including GDPR.',
  },

  // Advisors
  {
    id: 'adv1',
    category: 'Advisors',
    question: 'How are WhiteStellar advisors screened?',
    answer: 'Every advisor goes through a multi-stage screening process: a detailed application, demonstration reading assessed by our senior review team, identity and background verification, and a probationary period during which their early sessions are monitored for quality and client satisfaction. Less than 5% of applicants are accepted.',
  },
  {
    id: 'adv2',
    category: 'Advisors',
    question: 'Can I choose my favorite advisor?',
    answer: 'Yes! You can save any advisor to your "Favorites" list from their profile page. Saved advisors appear in a dedicated section of your dashboard so you can quickly see who is online and book sessions with the people you trust most.',
  },
  {
    id: 'adv3',
    category: 'Advisors',
    question: 'What if my advisor is not a good fit?',
    answer: 'No reading is one-size-fits-all. If a session does not resonate with you, simply try a different advisor. Our roster is large and diverse. You can also contact support if you felt the session was misleading — we take quality seriously.',
  },
  {
    id: 'adv4',
    category: 'Advisors',
    question: 'Can I leave a review for my advisor?',
    answer: 'Yes, and we encourage it! After every completed session, you will receive a prompt to rate your experience and leave a written review. Your reviews help other members find the right advisor and help us maintain quality on the platform.',
  },
  {
    id: 'adv5',
    category: 'Advisors',
    question: 'Can I become an advisor on WhiteStellar?',
    answer: 'We are always looking for talented, ethical spiritual practitioners to join our platform. Visit our "Join as an Advisor" page to learn about requirements, earnings, and how to apply. We welcome astrologers, tarot readers, psychics, mediums, life coaches, and more.',
  },
  {
    id: 'adv6',
    category: 'Advisors',
    question: 'Do advisors have specialties?',
    answer: 'Yes. Each advisor lists their specific specializations on their profile — for example, love readings, past life regression, career guidance, energy healing, Vedic astrology, and so on. You can filter advisors by specialty on our main listings page.',
  },
  {
    id: 'adv7',
    category: 'Advisors',
    question: 'What tools do psychic advisors use?',
    answer: 'Different advisors use different tools and methods — some rely purely on natural psychic ability, others use tarot cards, astrology charts, numerology, runes, pendulums, crystal balls, or a combination. Each advisor\'s profile describes their methods so you can choose accordingly.',
  },
]

const CATEGORIES = ['All', 'General', 'Payments', 'Sessions', 'Account', 'Advisors']

// ─── Accordion Item ───────────────────────────────────────────

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      style={{
        background: '#0D1221',
        border: `1px solid ${isOpen ? 'rgba(201,168,76,0.4)' : '#1E2D45'}`,
        borderLeft: `3px solid ${isOpen ? '#C9A84C' : 'transparent'}`,
        borderRadius: '12px',
        marginBottom: '8px',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%', textAlign: 'left',
          padding: '18px 20px',
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        }}
      >
        <span style={{
          color: isOpen ? '#F0F4FF' : '#C8D3E8',
          fontSize: '14px', fontWeight: isOpen ? 600 : 500,
          lineHeight: 1.4, transition: 'color 0.15s',
        }}>
          {item.question}
        </span>
        <ChevronDown
          size={16}
          color={isOpen ? '#C9A84C' : '#4B5563'}
          style={{ flexShrink: 0, transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {isOpen && (
        <div style={{ padding: '0 20px 18px', borderTop: '1px solid #1E2D45' }}>
          <p style={{ color: '#8B9BB4', fontSize: '14px', lineHeight: 1.8, marginTop: '14px' }}>
            {item.answer}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [openId, setOpenId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = FAQS
    if (activeCategory !== 'All') list = list.filter(f => f.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(f =>
        f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      )
    }
    return list
  }, [activeCategory, search])

  function toggle(id: string) {
    setOpenId(prev => (prev === id ? null : id))
  }

  return (
    <div style={{ background: '#0B0F1A', minHeight: '100vh', color: '#F0F4FF' }}>

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section style={{
        background: 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(99,60,180,0.18) 0%, transparent 65%)',
        padding: '72px 24px 48px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <Star size={14} fill="#C9A84C" color="#C9A84C" />
          <span style={{ color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Help Center
          </span>
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: '38px',
          fontWeight: 700, margin: '0 0 12px', lineHeight: 1.2,
        }}>
          Frequently Asked Questions
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '16px', maxWidth: '480px', marginInline: 'auto', marginBottom: '32px' }}>
          Find answers to common questions about our platform, advisors, and sessions.
        </p>

        {/* Search bar */}
        <div style={{
          maxWidth: '480px', marginInline: 'auto', position: 'relative',
        }}>
          <Search
            size={16}
            color="#4B5563"
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions..."
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#0D1221', border: '1px solid #1E2D45',
              borderRadius: '12px', padding: '12px 16px 12px 44px',
              color: '#F0F4FF', fontSize: '14px', outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#1E2D45' }}
          />
        </div>
      </section>

      {/* ══ CONTENT ══════════════════════════════════════════════ */}
      <section style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 24px 72px' }}>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenId(null) }}
                style={{
                  padding: '7px 16px', borderRadius: '20px', cursor: 'pointer',
                  background: active ? '#C9A84C' : '#131929',
                  border: `1px solid ${active ? '#C9A84C' : '#1E2D45'}`,
                  color: active ? '#0B0F1A' : '#8B9BB4',
                  fontSize: '13px', fontWeight: active ? 700 : 500,
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Results info */}
        {search && (
          <p style={{ color: '#4B5563', fontSize: '13px', marginBottom: '20px' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
          </p>
        )}

        {/* Accordion */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ color: '#8B9BB4', fontSize: '15px' }}>No questions found. Try a different search term.</p>
          </div>
        ) : (
          <div>
            {filtered.map(item => (
              <AccordionItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </div>
        )}

        {/* Still need help */}
        <div style={{
          marginTop: '48px',
          background: '#0D1221', border: '1px solid #1E2D45',
          borderRadius: '16px', padding: '32px', textAlign: 'center',
        }}>
          <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '17px', marginBottom: '8px' }}>
            Still have questions?
          </p>
          <p style={{ color: '#8B9BB4', fontSize: '14px', marginBottom: '20px' }}>
            Our support team is here to help — usually within a few hours.
          </p>
          <a
            href="/contact"
            style={{
              display: 'inline-block',
              background: '#C9A84C', color: '#0B0F1A',
              borderRadius: '10px', padding: '10px 24px',
              fontWeight: 700, fontSize: '14px', textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#E8C76A' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#C9A84C' }}
          >
            Contact Support
          </a>
        </div>
      </section>
    </div>
  )
}
