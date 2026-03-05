// ============================================================
// WhiteStellar — Zodiac AI Page
// src/pages/ZodiacAIPage.tsx
// ============================================================

import { useState, useRef, useEffect } from 'react'
import {
  Star, ChevronRight, Heart, Briefcase, Sparkles,
  Sun, Users, Map, Send, RefreshCw, Lock,
} from 'lucide-react'
import { useZodiacStore } from '../store/zodiacStore'
import type { ReadingType } from '../store/zodiacStore'
import Anthropic from '@anthropic-ai/sdk'

// ─── Anthropic client ─────────────────────────────────────────

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY ?? '',
  dangerouslyAllowBrowser: true,
})

// ─── Reading type config ──────────────────────────────────────

const READING_TYPES: {
  id: ReadingType; label: string; description: string; icon: React.ElementType; emoji: string
}[] = [
  { id: 'love',          label: 'Love & Romance',     description: 'Explore your relationship destiny and soulmate connections',        icon: Heart,     emoji: '❤️' },
  { id: 'career',        label: 'Career & Purpose',   description: 'Uncover your professional path and calling in the stars',           icon: Briefcase, emoji: '🌟' },
  { id: 'spiritual',     label: 'Spiritual Growth',   description: 'Connect with your higher self and soul\'s evolution',               icon: Sparkles,  emoji: '✨' },
  { id: 'horoscope',     label: 'Daily Horoscope',    description: 'What the cosmos has in store for you right now',                    icon: Sun,       emoji: '☀️' },
  { id: 'compatibility', label: 'Compatibility',      description: 'Discover the cosmic chemistry between you and another person',      icon: Users,     emoji: '🌙' },
  { id: 'life-path',     label: 'Life Path',          description: 'Your soul\'s journey, destiny, and the lessons you came to learn',  icon: Map,       emoji: '🗺️' },
]

// ─── Helper: derive zodiac sign ───────────────────────────────

function getZodiacSign(dobStr: string): string {
  const d = new Date(dobStr)
  const m = d.getMonth() + 1
  const day = d.getDate()
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return 'Aries'
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return 'Taurus'
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return 'Gemini'
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return 'Cancer'
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return 'Leo'
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return 'Virgo'
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return 'Libra'
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return 'Scorpio'
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return 'Sagittarius'
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return 'Capricorn'
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return 'Aquarius'
  return 'Pisces'
}

function buildSystemPrompt(
  name: string, dob: string, birthTime: string, birthPlace: string, readingType: ReadingType,
): string {
  const sign = getZodiacSign(dob)
  const readingLabel = READING_TYPES.find(r => r.id === readingType)?.label ?? readingType
  return `You are a gifted, compassionate astrologer named Stellara on the WhiteStellar platform. You specialize in ${readingLabel} readings.

Client details:
- Name: ${name}
- Date of birth: ${dob}${birthTime ? ` at ${birthTime}` : ''}
- Birth place: ${birthPlace || 'not provided'}
- Sun sign: ${sign}

Your reading style:
- Warm, insightful, and empowering — never fearful or negative
- Weave in astrological symbolism naturally (planets, aspects, houses)
- Be specific to their ${sign} nature and current cosmic transits
- Keep each response 3–5 paragraphs, conversational yet profound
- End each message with an open question that invites deeper exploration

Start with a captivating opening reading for ${name} focused on ${readingLabel}.`
}

// ─── Step 1: Birth Details ────────────────────────────────────

function StepBirthDetails() {
  const { birthDetails, setBirthDetails, setStep } = useZodiacStore()
  const [form, setForm] = useState(birthDetails)

  function update(key: keyof typeof form, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleNext() {
    setBirthDetails(form)
    setStep(2)
  }

  const valid = form.name.trim().length > 0 && form.dob.length > 0

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
        }}>
          <Star size={28} color="#C9A84C" fill="#C9A84C" />
        </div>
        <h2 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '24px', fontFamily: "'Playfair Display', serif", margin: '0 0 8px' }}>
          Your Cosmic Blueprint
        </h2>
        <p style={{ color: '#8B9BB4', fontSize: '15px', margin: 0 }}>
          Share your birth details so the stars can speak to you directly
        </p>
      </div>

      {[
        { label: 'Your Name', key: 'name' as const, type: 'text', placeholder: 'e.g. Sarah', required: true },
        { label: 'Date of Birth', key: 'dob' as const, type: 'date', placeholder: '', required: true },
        { label: 'Time of Birth (optional)', key: 'birthTime' as const, type: 'time', placeholder: '', required: false },
        { label: 'Place of Birth (optional)', key: 'birthPlace' as const, type: 'text', placeholder: 'e.g. New York, NY', required: false },
      ].map(field => (
        <div key={field.key} style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {field.label}
          </label>
          <input
            type={field.type}
            value={form[field.key]}
            onChange={e => update(field.key, e.target.value)}
            placeholder={field.placeholder}
            style={{
              width: '100%', background: '#131929', border: '1px solid #1E2D45',
              borderRadius: '12px', padding: '13px 16px',
              color: '#F0F4FF', fontSize: '15px', outline: 'none',
              boxSizing: 'border-box',
              colorScheme: 'dark',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#C9A84C' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#1E2D45' }}
          />
        </div>
      ))}

      <button
        onClick={handleNext}
        disabled={!valid}
        style={{
          width: '100%', padding: '14px',
          background: valid ? 'linear-gradient(135deg,#C9A84C,#E8C96D)' : '#1A2540',
          border: 'none', borderRadius: '12px',
          color: valid ? '#0B0F1A' : '#4B5563',
          fontWeight: 700, fontSize: '15px',
          cursor: valid ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          marginTop: '8px',
        }}
      >
        Continue
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

// ─── Step 2: Reading Type ─────────────────────────────────────

function StepReadingType() {
  const { birthDetails, setReadingType, setStep, addMessage, setLoading } = useZodiacStore()
  const [selected, setSelected] = useState<ReadingType | null>(null)

  async function handleBegin() {
    if (!selected) return
    setReadingType(selected)
    setStep(3)
    setLoading(true)

    const systemPrompt = buildSystemPrompt(
      birthDetails.name, birthDetails.dob, birthDetails.birthTime, birthDetails.birthPlace, selected,
    )

    try {
      const resp = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Please begin my reading.' }],
      })
      const text = resp.content[0].type === 'text' ? resp.content[0].text : ''
      addMessage({ id: `a-${Date.now()}`, role: 'assistant', content: text })
    } catch {
      addMessage({
        id: `a-${Date.now()}`, role: 'assistant',
        content: `✨ Dear ${birthDetails.name}, the stars are aligning your reading. As a ${getZodiacSign(birthDetails.dob)}, you carry the cosmos within you. Your soul's journey is written in the celestial tapestry, and today the universe is ready to reveal its wisdom to you. The planets speak of transformation, growth, and profound connections that await you. Are you ready to explore what the stars have in store?`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <p style={{ color: '#C9A84C', fontSize: '13px', fontWeight: 600, margin: '0 0 6px' }}>
          Welcome, {birthDetails.name} · {getZodiacSign(birthDetails.dob)}
        </p>
        <h2 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', fontFamily: "'Playfair Display', serif", margin: '0 0 6px' }}>
          What do you seek guidance on?
        </h2>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
          Choose a focus for your AI reading
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {READING_TYPES.map(rt => {
          const isSelected = selected === rt.id
          return (
            <button
              key={rt.id}
              onClick={() => setSelected(rt.id)}
              style={{
                padding: '16px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
                background: isSelected ? 'rgba(201,168,76,0.1)' : '#131929',
                border: `1px solid ${isSelected ? '#C9A84C' : '#1E2D45'}`,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>{rt.emoji}</div>
              <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '13px', margin: '0 0 4px' }}>{rt.label}</p>
              <p style={{ color: '#4B5563', fontSize: '11px', margin: 0, lineHeight: 1.4 }}>{rt.description}</p>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setStep(1)}
          style={{
            padding: '13px 20px', background: 'none', border: '1px solid #1A2235',
            borderRadius: '12px', color: '#8B9BB4', fontSize: '14px', cursor: 'pointer',
          }}
        >
          Back
        </button>
        <button
          onClick={handleBegin}
          disabled={!selected}
          style={{
            flex: 1, padding: '13px',
            background: selected ? 'linear-gradient(135deg,#C9A84C,#E8C96D)' : '#1A2540',
            border: 'none', borderRadius: '12px',
            color: selected ? '#0B0F1A' : '#4B5563',
            fontWeight: 700, fontSize: '15px',
            cursor: selected ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <Star size={16} fill={selected ? '#0B0F1A' : 'none'} />
          Begin My Reading
        </button>
      </div>
    </div>
  )
}

// ─── Step 3: Reading + Chat ───────────────────────────────────

function StepReading() {
  const {
    birthDetails, readingType, messages, isLoading, freeQuestionsLeft,
    addMessage, setLoading, decrementFreeQuestions, reset,
  } = useZodiacStore()
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const readingLabel = READING_TYPES.find(r => r.id === readingType)?.label ?? ''

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function handleSend() {
    const text = input.trim()
    if (!text || isLoading || freeQuestionsLeft === 0) return

    addMessage({ id: `u-${Date.now()}`, role: 'user', content: text })
    setInput('')
    setLoading(true)
    decrementFreeQuestions()

    const systemPrompt = buildSystemPrompt(
      birthDetails.name, birthDetails.dob, birthDetails.birthTime, birthDetails.birthPlace, readingType!,
    )

    const history = [...messages, { id: `u-t`, role: 'user' as const, content: text }]
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const resp = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: history,
      })
      const responseText = resp.content[0].type === 'text' ? resp.content[0].text : ''
      addMessage({ id: `a-${Date.now()}`, role: 'assistant', content: responseText })
    } catch {
      addMessage({
        id: `a-${Date.now()}`, role: 'assistant',
        content: '✨ The cosmic energies are strong right now. Please ask your question again and I will channel the stars for you.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', minHeight: '500px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div>
          <p style={{ color: '#C9A84C', fontSize: '12px', fontWeight: 600, margin: '0 0 2px' }}>
            {getZodiacSign(birthDetails.dob)} · {readingLabel}
          </p>
          <h3 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '16px', margin: 0 }}>
            Your Personal Reading, {birthDetails.name}
          </h3>
        </div>
        <button
          onClick={reset}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
            background: 'none', border: '1px solid #1E2D45', borderRadius: '8px',
            color: '#8B9BB4', fontSize: '12px', cursor: 'pointer',
          }}
        >
          <RefreshCw size={13} />
          New Reading
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', background: '#0D1221', borderRadius: '16px',
        border: '1px solid #1A2235', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '16px',
        marginBottom: '14px',
      }}>
        {messages.map(m => (
          <div
            key={m.id}
            style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}
          >
            {m.role === 'assistant' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'rgba(201,168,76,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Star size={11} color="#C9A84C" fill="#C9A84C" />
                </div>
                <span style={{ color: '#C9A84C', fontSize: '12px', fontWeight: 600 }}>Stellara</span>
              </div>
            )}
            <div style={{
              background: m.role === 'user' ? 'rgba(201,168,76,0.1)' : '#131929',
              border: `1px solid ${m.role === 'user' ? 'rgba(201,168,76,0.25)' : '#1E2D45'}`,
              borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
              padding: '12px 16px',
            }}>
              <p style={{ color: '#F0F4FF', fontSize: '14px', margin: 0, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                {m.content}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%',
              background: 'rgba(201,168,76,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Star size={11} color="#C9A84C" fill="#C9A84C" />
            </div>
            <div style={{
              background: '#131929', border: '1px solid #1E2D45',
              borderRadius: '4px 14px 14px 14px', padding: '12px 16px',
              display: 'flex', gap: '4px', alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C',
                  animation: `ws-dot-bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                  display: 'inline-block',
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      {freeQuestionsLeft === 0 ? (
        <div style={{
          background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)',
          borderRadius: '12px', padding: '16px', textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <Lock size={16} color="#C9A84C" />
            <span style={{ color: '#C9A84C', fontWeight: 600, fontSize: '14px' }}>Free questions used</span>
          </div>
          <p style={{ color: '#8B9BB4', fontSize: '13px', margin: '0 0 12px' }}>
            Connect with a live advisor to continue your spiritual journey
          </p>
          <button style={{
            background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
            border: 'none', borderRadius: '10px', padding: '10px 24px',
            color: '#0B0F1A', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
          }}>
            Browse Advisors
          </button>
        </div>
      ) : (
        <div>
          <div style={{
            display: 'flex', gap: '8px',
            background: '#131929', border: '1px solid #1E2D45',
            borderRadius: '12px', padding: '8px',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask the stars anything…"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#F0F4FF', fontSize: '14px', padding: '4px 8px',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                background: input.trim() && !isLoading ? '#C9A84C' : '#1A2540',
                border: 'none', borderRadius: '8px', padding: '8px 14px',
                color: input.trim() && !isLoading ? '#0B0F1A' : '#4B5563',
                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', fontWeight: 600, transition: 'all 0.15s',
              }}
            >
              <Send size={14} />
            </button>
          </div>
          <p style={{ color: '#4B5563', fontSize: '11px', textAlign: 'center', margin: '8px 0 0' }}>
            {freeQuestionsLeft} free question{freeQuestionsLeft !== 1 ? 's' : ''} remaining
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Progress stepper ─────────────────────────────────────────

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ['Birth Details', 'Reading Focus', 'Your Reading']
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '36px' }}>
      {steps.map((label, i) => {
        const s = i + 1
        const done = step > s
        const active = step === s
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: done ? '#C9A84C' : active ? 'rgba(201,168,76,0.15)' : '#131929',
                border: `2px solid ${done || active ? '#C9A84C' : '#1E2D45'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: done ? '#0B0F1A' : active ? '#C9A84C' : '#4B5563',
                fontSize: '13px', fontWeight: 700, transition: 'all 0.3s',
              }}>
                {done ? '✓' : s}
              </div>
              <span style={{ color: active ? '#F0F4FF' : '#4B5563', fontSize: '11px', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: '60px', height: '2px', margin: '0 8px',
                marginBottom: '18px',
                background: step > s ? '#C9A84C' : '#1E2D45',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────

export default function ZodiacAIPage() {
  const { step } = useZodiacStore()

  return (
    <div style={{ background: '#0B0F1A', minHeight: '100vh', color: '#F0F4FF' }}>
      <style>{`
        @keyframes ws-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      {/* Hero band */}
      <div style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,60,180,0.18) 0%, transparent 60%)',
        padding: '48px 20px 32px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
          <span style={{ color: '#C9A84C', fontSize: '18px' }}>✦</span>
          <span style={{ color: '#8B9BB4', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Zodiac AI by WhiteStellar
          </span>
          <span style={{ color: '#C9A84C', fontSize: '18px' }}>✦</span>
        </div>
        <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '36px', fontFamily: "'Playfair Display', serif", margin: '0 0 10px' }}>
          Your Personal Astrology Reading
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '16px', margin: 0, maxWidth: '520px', marginInline: 'auto' }}>
          Powered by AI and guided by the stars — a personalized cosmic reading in seconds
        </p>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 20px 60px' }}>
        <Stepper step={step} />
        {step === 1 && <StepBirthDetails />}
        {step === 2 && <StepReadingType />}
        {step === 3 && <StepReading />}
      </div>
    </div>
  )
}
