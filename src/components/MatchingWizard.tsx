// ============================================================
// WhiteStellar — Matching Wizard
// src/components/MatchingWizard.tsx
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Heart, Briefcase, Compass, Eye, Sparkles, MoreHorizontal, Layers, Hash, Star, Moon } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────

type WizardStep = 1 | 2 | 3 | 4 | 'matching'

interface MatchingWizardProps {
  isOpen: boolean
  onClose: () => void
}

// ─── Static data ──────────────────────────────────────────────

const GENDER_OPTIONS = [
  { id: 'female', symbol: '♀', label: 'Female' },
  { id: 'male',   symbol: '♂', label: 'Male'   },
  { id: 'other',  symbol: '○', label: 'Other'   },
]

const TOPIC_OPTIONS = [
  { id: 'love',    icon: Heart,          label: 'Love & Relationship' },
  { id: 'career',  icon: Briefcase,      label: 'Career & Work'       },
  { id: 'destiny', icon: Compass,        label: 'Destiny & Life Path' },
  { id: 'future',  icon: Eye,            label: 'Future Telling'      },
  { id: 'spirit',  icon: Sparkles,       label: 'Spirit Guidance'     },
  { id: 'other',   icon: MoreHorizontal, label: 'Other'               },
]

const READING_TYPE_OPTIONS = [
  { id: 'love',      icon: Heart,   label: 'Love Reading',           slug: 'love-relationships'   },
  { id: 'tarot',     icon: Layers,  label: 'Tarot Reading',          slug: 'tarot'                },
  { id: 'numerology',icon: Hash,    label: 'Numerology Analysis',    slug: 'astrology'            },
  { id: 'astrology', icon: Star,    label: 'Astrology & Horoscope',  slug: 'astrology'            },
  { id: 'fortune',   icon: Eye,     label: 'Fortune Telling',        slug: 'psychic-readings'     },
  { id: 'dream',     icon: Moon,    label: 'Dream Analysis',         slug: 'dream-interpretation' },
]

const WIZARD_TESTIMONIALS = [
  { name: 'Nicole',  text: 'The reading was exactly what I needed. I felt more confident and clear after my session.' },
  { name: 'James',   text: 'Luna picked up on things no one could have known. Truly life-changing accuracy.' },
  { name: 'Valerie', text: 'I was skeptical at first, but my advisor was spot-on. I rarely leave reviews but had to here.' },
  { name: 'Miriam',  text: 'The session helped me through a difficult time. I felt heard, supported and guided.' },
  { name: 'Rachel',  text: 'Connected with my departed mother. The details she shared were undeniable. Forever grateful.' },
  { name: 'Paige',   text: 'Working with my advisor helped me rebuild my confidence and find clarity on my path forward.' },
]

// ─── Option box ───────────────────────────────────────────────

function OptionBox({
  selected, onClick, children,
}: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '10px', padding: '24px 16px', borderRadius: '16px', cursor: 'pointer',
        background: selected ? 'rgba(201,168,76,0.08)' : '#131929',
        border: `${selected ? 2 : 1}px solid ${selected ? '#C9A84C' : '#1E2D45'}`,
        transition: 'all 0.15s', flex: 1, minWidth: 0,
      }}
      onMouseEnter={e => {
        if (!selected) (e.currentTarget as HTMLButtonElement).style.borderColor = '#2A3D55'
      }}
      onMouseLeave={e => {
        if (!selected) (e.currentTarget as HTMLButtonElement).style.borderColor = '#1E2D45'
      }}
    >
      {children}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────

export default function MatchingWizard({ isOpen, onClose }: MatchingWizardProps) {
  const navigate = useNavigate()

  const [step, setStep] = useState<WizardStep>(1)
  const [selectedGender, setSelectedGender] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedReadingType, setSelectedReadingType] = useState<string | null>(null)
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null)
  const [selectedDOB, setSelectedDOB] = useState('')
  const [matchingProgress, setMatchingProgress] = useState(0)
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [testimonialVisible, setTestimonialVisible] = useState(true)

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setSelectedGender(null)
      setSelectedTopic(null)
      setSelectedReadingType(null)
      setSelectedCategorySlug(null)
      setSelectedDOB('')
      setMatchingProgress(0)
    }
  }, [isOpen])

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Matching progress + testimonial rotation
  useEffect(() => {
    if (step !== 'matching') return

    setMatchingProgress(0)

    // Progress: 0→100 over 10s (100ms ticks = 100 ticks, each adds 1%)
    const progressId = setInterval(() => {
      setMatchingProgress(prev => {
        if (prev >= 100) { clearInterval(progressId); return 100 }
        return prev + 1
      })
    }, 100)

    // Testimonial rotation every 3s with fade
    const testimonialId = setInterval(() => {
      setTestimonialVisible(false)
      setTimeout(() => {
        setTestimonialIndex(i => (i + 1) % WIZARD_TESTIMONIALS.length)
        setTestimonialVisible(true)
      }, 300)
    }, 3000)

    return () => {
      clearInterval(progressId)
      clearInterval(testimonialId)
    }
  }, [step])

  // When progress hits 100 → navigate
  useEffect(() => {
    if (matchingProgress < 100) return
    const id = setTimeout(() => {
      onClose()
      navigate(`/category/${selectedCategorySlug ?? 'psychic-readings'}`)
    }, 500)
    return () => clearTimeout(id)
  }, [matchingProgress, navigate, onClose, selectedCategorySlug])

  const goToMatching = useCallback(() => {
    setTestimonialIndex(Math.floor(Math.random() * WIZARD_TESTIMONIALS.length))
    setTestimonialVisible(true)
    setStep('matching')
  }, [])

  if (!isOpen) return null

  const progressPercent = step === 'matching' ? 100
    : step === 4 ? 100
    : step === 3 ? 75
    : step === 2 ? 50
    : 25

  const stepNumber = typeof step === 'number' ? step : null

  const testimonial = WIZARD_TESTIMONIALS[testimonialIndex]

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 150,
          background: '#0B0F1A', overflowY: 'auto',
          animation: 'wizardFadeIn 0.3s ease both',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '64px 24px' }}>

          {/* Close button (steps 1-4 only) */}
          {step !== 'matching' && (
            <button
              onClick={onClose}
              style={{
                position: 'fixed', top: '20px', right: '20px',
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)', border: '1px solid #1E2D45',
                color: '#8B9BB4', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <X size={20} />
            </button>
          )}

          {/* Steps 1–4 header */}
          {stepNumber !== null && (
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#8B9BB4', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                Let&apos;s find you the right psychic
              </p>
              <div style={{ height: '3px', background: '#1E2D45', borderRadius: '100px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{
                  height: '100%', background: '#C9A84C', borderRadius: '100px',
                  width: `${progressPercent}%`, transition: 'width 0.4s ease',
                }} />
              </div>
              <p style={{ fontSize: '11px', color: '#4B5563' }}>Step {stepNumber} of 4</p>
            </div>
          )}

          {/* ── Step 1: Gender ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: '#F0F4FF', textAlign: 'center', margin: 0 }}>
                Choose your gender
              </h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {GENDER_OPTIONS.map(g => (
                  <OptionBox key={g.id} selected={selectedGender === g.id} onClick={() => setSelectedGender(g.id)}>
                    <span style={{ fontSize: '32px', color: selectedGender === g.id ? '#C9A84C' : '#8B9BB4', lineHeight: 1 }}>
                      {g.symbol}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#F0F4FF' }}>{g.label}</span>
                  </OptionBox>
                ))}
              </div>
              <button
                disabled={!selectedGender}
                onClick={() => selectedGender && setStep(2)}
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                  background: selectedGender ? '#C9A84C' : '#1E2D45',
                  color: selectedGender ? '#0B0F1A' : '#4B5563',
                  fontSize: '16px', fontWeight: 700, cursor: selectedGender ? 'pointer' : 'not-allowed',
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 2: Topic ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <button type="button" onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4', fontSize: '13px', textAlign: 'left', padding: 0 }}>
                ← Back
              </button>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700, color: '#F0F4FF', textAlign: 'center', margin: 0 }}>
                Choose the topic you seek answers for
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {TOPIC_OPTIONS.map(t => {
                  const Icon = t.icon
                  return (
                    <OptionBox key={t.id} selected={selectedTopic === t.id} onClick={() => setSelectedTopic(t.id)}>
                      <Icon size={28} color={selectedTopic === t.id ? '#C9A84C' : '#8B9BB4'} />
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#F0F4FF', textAlign: 'center' }}>{t.label}</span>
                    </OptionBox>
                  )
                })}
              </div>
              <button
                disabled={!selectedTopic}
                onClick={() => selectedTopic && setStep(3)}
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                  background: selectedTopic ? '#C9A84C' : '#1E2D45',
                  color: selectedTopic ? '#0B0F1A' : '#4B5563',
                  fontSize: '16px', fontWeight: 700, cursor: selectedTopic ? 'pointer' : 'not-allowed',
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 3: Reading Type ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <button type="button" onClick={() => setStep(2)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4', fontSize: '13px', textAlign: 'left', padding: 0 }}>
                ← Back
              </button>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700, color: '#F0F4FF', textAlign: 'center', margin: 0 }}>
                What type of reading are you looking for?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {READING_TYPE_OPTIONS.map(r => {
                  const Icon = r.icon
                  const selected = selectedReadingType === r.id
                  return (
                    <OptionBox
                      key={r.id}
                      selected={selected}
                      onClick={() => { setSelectedReadingType(r.id); setSelectedCategorySlug(r.slug) }}
                    >
                      <Icon size={28} color={selected ? '#C9A84C' : '#8B9BB4'} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#F0F4FF', textAlign: 'center' }}>{r.label}</span>
                    </OptionBox>
                  )
                })}
              </div>
              <button
                disabled={!selectedReadingType}
                onClick={() => selectedReadingType && setStep(4)}
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                  background: selectedReadingType ? '#C9A84C' : '#1E2D45',
                  color: selectedReadingType ? '#0B0F1A' : '#4B5563',
                  fontSize: '16px', fontWeight: 700, cursor: selectedReadingType ? 'pointer' : 'not-allowed',
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 4: Date of Birth ── */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
              <button type="button" onClick={() => setStep(3)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4', fontSize: '13px', textAlign: 'left', padding: 0, alignSelf: 'flex-start' }}>
                ← Back
              </button>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700, color: '#F0F4FF', textAlign: 'center', margin: 0 }}>
                Share your date of birth for a better match
              </h2>
              <p style={{ color: '#8B9BB4', fontSize: '14px', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
                This helps us match you with advisors who specialize in your cosmic profile
              </p>
              <input
                type="date"
                value={selectedDOB}
                onChange={e => setSelectedDOB(e.target.value)}
                style={{
                  background: '#131929', border: `1px solid ${selectedDOB ? '#C9A84C' : '#1E2D45'}`,
                  borderRadius: '12px', padding: '16px', color: '#F0F4FF',
                  fontSize: '16px', width: '100%', maxWidth: '300px',
                  colorScheme: 'dark', outline: 'none',
                }}
              />
              <button
                disabled={!selectedDOB}
                onClick={() => selectedDOB && goToMatching()}
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                  background: selectedDOB ? '#C9A84C' : '#1E2D45',
                  color: selectedDOB ? '#0B0F1A' : '#4B5563',
                  fontSize: '16px', fontWeight: 700, cursor: selectedDOB ? 'pointer' : 'not-allowed',
                }}
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Matching screen ── */}
          {step === 'matching' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', paddingTop: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 700, color: '#C9A84C', margin: '0 0 12px' }}>
                  Thank you for sharing ✨
                </h2>
                <p style={{ color: '#8B9BB4', fontSize: '16px', margin: 0 }}>
                  Now we're matching you to the best psychics...
                </p>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%' }}>
                <div style={{ height: '10px', background: '#1E2D45', borderRadius: '100px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{
                    height: '100%', background: 'linear-gradient(90deg, #C9A84C, #E8C96D)',
                    borderRadius: '100px', width: `${matchingProgress}%`,
                    transition: 'width 0.1s linear',
                  }} />
                </div>
                <p style={{ color: '#C9A84C', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>
                  {matchingProgress}%
                </p>
              </div>

              {/* Testimonial card */}
              <div style={{
                background: '#131929', border: '1px solid #1E2D45', borderRadius: '16px',
                padding: '28px', width: '100%',
                opacity: testimonialVisible ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}>
                <span style={{ fontSize: '40px', color: '#C9A84C', lineHeight: 1, display: 'block', marginBottom: '12px', fontFamily: 'Georgia, serif' }}>
                  "
                </span>
                <p style={{ color: '#F0F4FF', fontSize: '15px', lineHeight: 1.7, margin: '0 0 16px' }}>
                  {testimonial.text}
                </p>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#C9A84C" color="#C9A84C" />
                  ))}
                </div>
                <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '14px', margin: 0 }}>
                  {testimonial.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes wizardFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  )
}
