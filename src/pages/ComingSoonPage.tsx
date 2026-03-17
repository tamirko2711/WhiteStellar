// ============================================================
// WhiteStellar — Coming Soon Gate Page
// src/pages/ComingSoonPage.tsx
// Self-contained. No platform imports.
// ============================================================

import { useState, useEffect } from 'react'
import { Star, Sparkles, Users } from 'lucide-react'

// ─── Star positions (same density as HomePage hero) ──────────

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
  { size: '1px', top: '18%', left: '62%', opacity: 0.14, duration: 4.0, delay: '1.3s' },
  { size: '2px', top: '38%', left: '48%', opacity: 0.12, duration: 3.6, delay: '0.1s' },
  { size: '1px', top: '58%', left: '82%', opacity: 0.19, duration: 4.7, delay: '2.0s' },
  { size: '2px', top: '78%', left: '25%', opacity: 0.11, duration: 3.2, delay: '1.6s' },
  { size: '1px', top: '92%', left: '72%', opacity: 0.15, duration: 5.0, delay: '0.8s' },
  { size: '2px', top: '3%',  left: '40%', opacity: 0.13, duration: 3.8, delay: '2.3s' },
  { size: '1px', top: '44%', left: '18%', opacity: 0.17, duration: 4.4, delay: '1.0s' },
  { size: '2px', top: '85%', left: '55%', opacity: 0.12, duration: 3.5, delay: '0.6s' },
  { size: '1px', top: '60%', left: '10%', opacity: 0.2,  duration: 4.1, delay: '1.8s' },
  { size: '2px', top: '28%', left: '85%', opacity: 0.14, duration: 3.9, delay: '2.5s' },
]

const CYCLING_WORDS = ['Clarity', 'Love', 'Purpose', 'Guidance', 'Path', 'Truth']

// ─── Component ────────────────────────────────────────────────

interface Props {
  onUnlock: () => void
}

export function ComingSoonPage({ onUnlock }: Props) {
  const [wordIndex, setWordIndex]     = useState(0)
  const [inputValue, setInputValue]   = useState('')
  const [error, setError]             = useState(false)
  const [success, setSuccess]         = useState(false)
  const [advisorHover, setAdvisorHover] = useState(false)
  const [enterHover, setEnterHover]   = useState(false)

  // Cycle words every 3 s
  useEffect(() => {
    const id = setInterval(() => setWordIndex(i => (i + 1) % CYCLING_WORDS.length), 3000)
    return () => clearInterval(id)
  }, [])

  function handleSubmit() {
    const code      = inputValue.trim().toUpperCase()
    const validCode = (import.meta.env.VITE_ACCESS_CODE as string)?.toUpperCase() ?? ''
    if (code === validCode) {
      setSuccess(true)
      setTimeout(() => onUnlock(), 800)
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <>
      <style>{`
        @keyframes ws-cs-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 0.45; transform: scale(1.4); }
        }
        @keyframes ws-cs-word {
          from { transform: translateY(32px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes ws-cs-shake {
          0%, 100% { transform: translateX(0); }
          25%       { transform: translateX(-8px); }
          75%       { transform: translateX(8px); }
        }
        @keyframes ws-cs-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ws-cs-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          max-width: 760px;
          width: 100%;
          margin-bottom: 64px;
        }
        .ws-cs-cta-inner {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          max-width: 760px;
          width: 100%;
          margin: 0 auto;
        }
        @media (max-width: 640px) {
          .ws-cs-cards { grid-template-columns: 1fr !important; }
          .ws-cs-cta-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .ws-cs-cta-btn { width: 100% !important; }
        }
      `}</style>

      {/* ── Root: fixed fullscreen, scrollable ── */}
      <div style={{
        position: 'fixed', inset: 0,
        background: '#0B0F1A',
        overflowY: 'auto',
        color: '#F0F4FF',
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* ── Star particles (fixed so they don't scroll) ── */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden>
          {STAR_POSITIONS.map((s, i) => (
            <span key={i} style={{
              position: 'absolute',
              width: s.size, height: s.size,
              top: s.top, left: s.left,
              opacity: s.opacity,
              background: 'white',
              borderRadius: '50%',
              animation: `ws-cs-twinkle ${s.duration}s ease-in-out infinite`,
              animationDelay: s.delay,
            }} />
          ))}
        </div>

        {/* ── Radial purple glow ── */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(99,60,180,0.08) 0%, transparent 100%)',
        }} />

        {/* ── Scrollable content ── */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '80px 24px 80px',
          minHeight: '100%',
        }}>

          {/* ── Logo ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <Star size={32} fill="#C9A84C" color="#C9A84C" />
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '32px', fontWeight: 700, color: '#F0F4FF',
              letterSpacing: '-0.02em',
            }}>
              White<span style={{ color: '#C9A84C' }}>Stellar</span>
            </span>
          </div>

          {/* ── Coming Soon badge ── */}
          <div style={{
            border: '1px solid #C9A84C',
            color: '#C9A84C', fontSize: '12px',
            padding: '6px 16px', borderRadius: '20px',
            textTransform: 'uppercase', letterSpacing: '0.12em',
            marginBottom: '28px', fontWeight: 600,
          }}>
            ✦ Coming Soon ✦
          </div>

          {/* ── Animated headline ── */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 700, color: '#F0F4FF',
            textAlign: 'center', margin: '0 0 16px', lineHeight: 1.15,
          }}>
            Find Your{' '}
            <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', minWidth: '180px' }}>
              <span
                key={wordIndex}
                style={{
                  display: 'inline-block',
                  color: '#C9A84C',
                  animation: 'ws-cs-word 0.55s cubic-bezier(0.22,1,0.36,1) both',
                }}
              >
                {CYCLING_WORDS[wordIndex]}
              </span>
            </span>
          </h1>

          {/* ── Subheading ── */}
          <p style={{
            color: '#8B9BB4', fontSize: '18px', textAlign: 'center',
            maxWidth: '480px', margin: '0 auto 72px', lineHeight: 1.65,
          }}>
            The next-generation psychic advisor platform is almost here.
          </p>

          {/* ── Vision cards ── */}
          <div className="ws-cs-cards">
            {/* Left */}
            <div style={{
              background: '#0D1221', border: '1px solid #1E2D45',
              borderRadius: '16px', padding: '32px',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              <Sparkles size={32} color="#C9A84C" />
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '22px', fontWeight: 700, color: '#F0F4FF', margin: 0,
              }}>
                A New Kind of Guidance
              </h3>
              <p style={{ color: '#8B9BB4', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
                WhiteStellar connects seekers with gifted advisors through a platform built on trust, transparency and technology. Real guidance. Real people. Available whenever you need them, 24/7.
              </p>
            </div>

            {/* Right */}
            <div style={{
              background: '#0D1221', border: '1px solid #1E2D45',
              borderRadius: '16px', padding: '32px',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              <Users size={32} color="#C9A84C" />
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '22px', fontWeight: 700, color: '#F0F4FF', margin: 0,
              }}>
                Built for Advisors Too
              </h3>
              <p style={{ color: '#8B9BB4', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
                We built WhiteStellar with advisors at the center. Set your own rates, own your schedule, and build lasting relationships with clients who truly value your gifts. The control is yours.
              </p>
            </div>
          </div>

          {/* ── Advisor CTA strip ── */}
          <div style={{
            width: '100%', maxWidth: '760px',
            background: '#080C16',
            borderTop: '1px solid #1E2D45', borderBottom: '1px solid #1E2D45',
            padding: '32px 24px', marginBottom: '64px', borderRadius: '16px',
          }}>
            <div className="ws-cs-cta-inner">
              <div>
                <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '18px', margin: '0 0 6px' }}>
                  Are you a psychic advisor?
                </p>
                <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
                  Join us for something new. Be part of a platform that puts you first.
                </p>
              </div>
              <button
                className="ws-cs-cta-btn"
                onClick={onUnlock}
                onMouseEnter={() => setAdvisorHover(true)}
                onMouseLeave={() => setAdvisorHover(false)}
                style={{
                  border: '1px solid #C9A84C',
                  color: advisorHover ? '#0B0F1A' : '#C9A84C',
                  background: advisorHover ? '#C9A84C' : 'transparent',
                  padding: '12px 28px', borderRadius: '10px',
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                Apply as an Advisor →
              </button>
            </div>
          </div>

          {/* ── Access code section ── */}
          <div style={{ textAlign: 'center', width: '100%', marginBottom: '64px' }}>
            <p style={{ color: '#F0F4FF', fontSize: '16px', fontWeight: 600, margin: '0 0 16px' }}>
              Have an access code?
            </p>

            <div style={{
              display: 'flex',
              maxWidth: '360px', margin: '0 auto',
              animation: error ? 'ws-cs-shake 0.4s ease both' : 'none',
            }}>
              <input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !success && handleSubmit()}
                placeholder="Enter code"
                disabled={success}
                style={{
                  flex: 1,
                  background: '#131929',
                  border: `1px solid ${error ? '#EF4444' : success ? '#C9A84C' : '#1E2D45'}`,
                  borderRight: 'none',
                  borderRadius: '10px 0 0 10px',
                  padding: '14px 18px',
                  color: '#F0F4FF',
                  fontSize: '15px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                  width: '100%',
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={success}
                onMouseEnter={() => setEnterHover(true)}
                onMouseLeave={() => setEnterHover(false)}
                style={{
                  background: enterHover && !success ? '#E8C76A' : '#C9A84C',
                  color: '#0B0F1A',
                  fontWeight: 700,
                  padding: '14px 24px',
                  borderRadius: '0 10px 10px 0',
                  border: 'none',
                  cursor: success ? 'default' : 'pointer',
                  fontSize: '14px',
                  flexShrink: 0,
                  opacity: success ? 0.7 : 1,
                  transition: 'background 0.15s',
                }}
              >
                Enter →
              </button>
            </div>

            {/* Error */}
            {error && !success && (
              <p style={{
                color: '#EF4444', fontSize: '13px', margin: '10px 0 0',
                animation: 'ws-cs-fadein 0.2s ease both',
              }}>
                Invalid access code. Please try again.
              </p>
            )}

            {/* Success */}
            {success && (
              <p style={{
                color: '#C9A84C', fontSize: '13px', margin: '10px 0 0',
                animation: 'ws-cs-fadein 0.3s ease both',
              }}>
                ✦ Access granted. Welcome to WhiteStellar.
              </p>
            )}
          </div>

          {/* ── Footer ── */}
          <p style={{ color: '#4B5563', fontSize: '12px', margin: 0, textAlign: 'center' }}>
            © 2024 WhiteStellar. All rights reserved.
          </p>
        </div>
      </div>
    </>
  )
}
