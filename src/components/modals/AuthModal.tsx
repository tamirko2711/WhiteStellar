import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, X, Search, Sparkles, CheckCircle, Mail, ArrowLeft } from 'lucide-react'
import { useModalStore, type AuthMode } from '../../store/modalStore'
import { useAuthStore } from '../../store/authStore'
import { resetPassword } from '../../lib/api/auth'
import Toast from '../Toast'

// ─── Types ────────────────────────────────────────────────────

type RegStep = 1 | 2 | 3
type AccountType = 'client' | 'advisor'

// ─── Helpers ──────────────────────────────────────────────────

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function passwordStrength(pw: string) {
  if (!pw) return { level: 0, label: '', color: '' }
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^a-zA-Z0-9]/.test(pw)) s++
  if (s <= 1) return { level: 1, label: 'Weak',   color: '#EF4444' }
  if (s === 2) return { level: 2, label: 'Fair',   color: '#F59E0B' }
  if (s === 3) return { level: 3, label: 'Good',   color: '#3B82F6' }
  return             { level: 4, label: 'Strong', color: '#2DD4BF' }
}

const COUNTRY_CODES = [
  { flag: '🇺🇸', code: '+1',   label: 'US' },
  { flag: '🇬🇧', code: '+44',  label: 'UK' },
  { flag: '🇮🇱', code: '+972', label: 'IL' },
  { flag: '🇦🇺', code: '+61',  label: 'AU' },
  { flag: '🇨🇦', code: '+1',   label: 'CA' },
  { flag: '🇩🇪', code: '+49',  label: 'DE' },
]

// ─── Small shared UI ──────────────────────────────────────────

function ModalLogo() {
  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      <svg width="16" height="16" viewBox="0 0 20 20" fill="#C9A84C" aria-hidden>
        <polygon points="10,1 12.9,7.6 20,8.3 14.5,13.5 16.2,20.6 10,17 3.8,20.6 5.5,13.5 0,8.3 7.1,7.6" />
      </svg>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 700 }}>
        <span style={{ color: '#F0F4FF' }}>White</span>
        <span style={{ color: '#C9A84C' }}>Stellar</span>
      </span>
    </div>
  )
}

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block', width: '18px', height: '18px',
        border: '2px solid rgba(0,0,0,0.25)', borderTopColor: '#0B0F1A',
        borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      }}
    />
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  valid?: boolean
}

function Field({ error, valid, style, ...rest }: InputProps) {
  return (
    <div>
      <input
        {...rest}
        style={{
          width: '100%', background: '#131929', borderRadius: '10px',
          padding: '12px 16px', color: '#F0F4FF', fontSize: '14px', outline: 'none',
          border: `1px solid ${error ? '#EF4444' : valid ? '#C9A84C' : '#1E2D45'}`,
          transition: 'border-color 0.2s',
          ...style,
        }}
      />
      {error && (
        <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', animation: 'fadeIn 0.2s ease' }}>
          {error}
        </p>
      )}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

// ─── Login mode ───────────────────────────────────────────────

interface SharedModeProps {
  setMode: (m: AuthMode) => void
  showToast: (msg: string) => void
  onClose: () => void
}

function LoginMode({ setMode, showToast, onClose }: SharedModeProps) {
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; pw?: string; form?: string }>({})
  const [touched, setTouched] = useState<{ email?: boolean; pw?: boolean }>({})

  function validateEmail() {
    if (!email) return 'Email is required'
    if (!isValidEmail(email)) return 'Please enter a valid email'
    return ''
  }
  function validatePw() {
    if (!pw) return 'Password is required'
    return ''
  }

  function onBlurEmail() {
    setTouched(t => ({ ...t, email: true }))
    setErrors(e => ({ ...e, email: validateEmail() }))
  }
  function onBlurPw() {
    setTouched(t => ({ ...t, pw: true }))
    setErrors(e => ({ ...e, pw: validatePw() }))
  }

  const canSubmit = !loading && email && pw && !validateEmail() && !validatePw()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const eErr = validateEmail(), pErr = validatePw()
    setErrors({ email: eErr, pw: pErr })
    setTouched({ email: true, pw: true })
    if (eErr || pErr) return
    setLoading(true)
    try {
      await login(email, pw)
      onClose()
      showToast('Welcome back! ✨')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed. Please try again.'
      setErrors(prev => ({ ...prev, form: msg }))
    } finally {
      setLoading(false)
    }
  }

  function handleSocial() {
    showToast('Social login coming soon')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <ModalLogo />
      <div className="mb-2 text-center">
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
          Welcome Back
        </h2>
        <p className="mt-1 text-sm" style={{ color: '#8B9BB4' }}>Sign in to continue your journey</p>
      </div>

      <Field
        type="email" placeholder="Email address" value={email} autoComplete="email"
        onChange={e => setEmail(e.target.value)} onBlur={onBlurEmail}
        error={touched.email ? errors.email : undefined}
        valid={touched.email && !errors.email && !!email}
      />

      <div>
        <div className="relative">
          <Field
            type={showPw ? 'text' : 'password'} placeholder="Password" value={pw}
            autoComplete="current-password"
            onChange={e => setPw(e.target.value)} onBlur={onBlurPw}
            error={touched.pw ? errors.pw : undefined}
            valid={touched.pw && !errors.pw && !!pw}
            style={{ paddingRight: '44px' }}
          />
          <button
            type="button" tabIndex={-1}
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-3"
            style={{ color: '#8B9BB4', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        <div className="mt-1 flex justify-end">
          <button type="button" onClick={() => setMode('forgot-password')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C9A84C', fontSize: '13px' }}>
            Forgot password?
          </button>
        </div>
      </div>

      <button
        type="submit" disabled={!canSubmit}
        className="flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200"
        style={{
          height: '48px', background: canSubmit ? '#C9A84C' : '#1E2D45',
          color: canSubmit ? '#0B0F1A' : '#4B5563', border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
      >
        {loading ? <Spinner /> : 'Sign In'}
      </button>

      {errors.form && (
        <p style={{ color: '#EF4444', fontSize: '13px', textAlign: 'center', marginTop: '-8px' }}>
          {errors.form}
        </p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <div style={{ flex: 1, height: '1px', background: '#1E2D45' }} />
        <span style={{ color: '#4B5563', fontSize: '12px', whiteSpace: 'nowrap' }}>or continue with</span>
        <div style={{ flex: 1, height: '1px', background: '#1E2D45' }} />
      </div>

      {/* Social buttons */}
      <div className="flex gap-3">
        {[
          { icon: <GoogleIcon />, label: 'Google' },
          { icon: <FacebookIcon />, label: 'Facebook' },
        ].map(s => (
          <button
            key={s.label} type="button" onClick={handleSocial}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors"
            style={{ background: '#131929', border: '1px solid #1E2D45', color: '#F0F4FF', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2A3D55' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1E2D45' }}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <p className="mt-1 text-center text-sm" style={{ color: '#8B9BB4' }}>
        Don't have an account?{' '}
        <button type="button" onClick={() => setMode('register')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C9A84C', fontWeight: 600 }}>
          Create one free
        </button>
      </p>
    </form>
  )
}

// ─── Register mode (3-step) ───────────────────────────────────

interface RegisterModeProps extends SharedModeProps {
  setCapturedEmail: (e: string) => void
  preSelectedUserType?: 'client' | 'advisor' | null
}

function RegisterMode({ setMode, showToast, onClose, setCapturedEmail, preSelectedUserType }: RegisterModeProps) {
  const { register } = useAuthStore()
  const [step, setStep] = useState<RegStep>(1)
  const [accountType, setAccountType] = useState<AccountType | null>(preSelectedUserType ?? null)

  useEffect(() => {
    if (preSelectedUserType) setAccountType(preSelectedUserType)
  }, [preSelectedUserType])

  // Step 2 fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [s2Errors, setS2Errors] = useState<Record<string, string>>({})
  const [s2Touched, setS2Touched] = useState<Record<string, boolean>>({})

  // Step 3 fields
  const [countryCode, setCountryCode] = useState('+1')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeMarketing, setAgreeMarketing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const strength = passwordStrength(pw)

  const s2Validate = {
    name:      () => name.trim() ? '' : 'Full name is required',
    email:     () => !email ? 'Email is required' : !isValidEmail(email) ? 'Enter a valid email' : '',
    pw:        () => pw.length < 8 ? 'Min 8 characters' : !/[A-Z]/.test(pw) ? 'Add an uppercase letter' : !/[0-9]/.test(pw) ? 'Add a number' : '',
    confirmPw: () => confirmPw !== pw ? 'Passwords do not match' : '',
  }

  function blurS2(field: keyof typeof s2Validate) {
    setS2Touched(t => ({ ...t, [field]: true }))
    setS2Errors(e => ({ ...e, [field]: s2Validate[field]() }))
  }

  const s2Valid = !s2Validate.name() && !s2Validate.email() && !s2Validate.pw() && !s2Validate.confirmPw()

  function handleStep2Continue() {
    const errs = Object.fromEntries(
      (Object.keys(s2Validate) as Array<keyof typeof s2Validate>).map(k => [k, s2Validate[k]()])
    )
    setS2Errors(errs)
    setS2Touched({ name: true, email: true, pw: true, confirmPw: true })
    if (Object.values(errs).some(Boolean)) return
    setStep(3)
  }

  async function handleSubmit() {
    if (!agreeTerms || !accountType) return
    setLoading(true)
    setFormError('')
    try {
      await register(email, pw, name, accountType)
      if (accountType === 'advisor') {
        onClose()
        showToast("Application submitted! We'll review and get back to you within 48 hours.")
      } else {
        setCapturedEmail(email)
        setMode('verify-email')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setFormError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ModalLogo />

      {/* Progress indicator */}
      <div className="mb-1">
        <div className="mb-2 flex items-center justify-between">
          <span style={{ color: '#8B9BB4', fontSize: '12px' }}>Step {step} of 3</span>
          <span style={{ color: '#C9A84C', fontSize: '12px', fontWeight: 600 }}>
            {step === 1 ? 'Account Type' : step === 2 ? 'Your Details' : 'Almost Done'}
          </span>
        </div>
        <div style={{ height: '3px', background: '#1E2D45', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: '#C9A84C', borderRadius: '2px',
            width: `${(step / 3) * 100}%`, transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* ── Step 1 ── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
              Join WhiteStellar
            </h2>
            <p className="mt-1 text-sm" style={{ color: '#8B9BB4' }}>How would you like to use the platform?</p>
          </div>

          <div className="flex gap-3">
            {([
              { type: 'client' as AccountType, icon: <Search size={28} />, title: "I'm Seeking Guidance",
                desc: 'Connect with advisors for readings, insights and spiritual guidance', accentColor: '#C9A84C' },
              { type: 'advisor' as AccountType, icon: <Sparkles size={28} />, title: "I'm an Advisor",
                desc: 'Share your gifts, build your practice and connect with clients', accentColor: '#2DD4BF' },
            ] as const).map(card => {
              const selected = accountType === card.type
              return (
                <button
                  key={card.type} type="button"
                  onClick={() => setAccountType(card.type)}
                  className="flex flex-1 flex-col items-center gap-3 rounded-xl p-5 text-center transition-all duration-200"
                  style={{
                    background: selected ? `${card.accentColor}0D` : '#131929',
                    border: `2px solid ${selected ? card.accentColor : '#1E2D45'}`,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ color: selected ? card.accentColor : '#4B5563' }}>{card.icon}</span>
                  <span style={{ fontWeight: 700, color: '#F0F4FF', fontSize: '14px' }}>{card.title}</span>
                  <span style={{ color: '#8B9BB4', fontSize: '12px', lineHeight: 1.5 }}>{card.desc}</span>
                </button>
              )
            })}
          </div>
          {accountType === 'advisor' && (
            <p style={{ color: '#4B5563', fontSize: '12px', textAlign: 'center' }}>
              Advisor accounts require approval from our team
            </p>
          )}

          <button
            type="button" disabled={!accountType}
            onClick={() => accountType && setStep(2)}
            className="flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-200"
            style={{
              height: '48px', background: accountType ? '#C9A84C' : '#1E2D45',
              color: accountType ? '#0B0F1A' : '#4B5563', border: 'none', cursor: accountType ? 'pointer' : 'not-allowed',
            }}
          >
            Continue
          </button>

          <p className="text-center text-sm" style={{ color: '#8B9BB4' }}>
            Already have an account?{' '}
            <button type="button" onClick={() => setMode('login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C9A84C', fontWeight: 600 }}>
              Sign in
            </button>
          </p>
        </div>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <div className="flex flex-col gap-3">
          <div className="text-center">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
              Create Your Account
            </h2>
          </div>

          <Field placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
            onBlur={() => blurS2('name')}
            error={s2Touched.name ? s2Errors.name : undefined}
            valid={s2Touched.name && !s2Errors.name && !!name} />

          <Field type="email" placeholder="Email address" value={email} autoComplete="email"
            onChange={e => setEmail(e.target.value)} onBlur={() => blurS2('email')}
            error={s2Touched.email ? s2Errors.email : undefined}
            valid={s2Touched.email && !s2Errors.email && !!email} />

          <div>
            <div className="relative">
              <Field type={showPw ? 'text' : 'password'} placeholder="Password (8+ chars)" value={pw}
                onChange={e => setPw(e.target.value)} onBlur={() => blurS2('pw')}
                error={s2Touched.pw ? s2Errors.pw : undefined}
                valid={s2Touched.pw && !s2Errors.pw && !!pw}
                style={{ paddingRight: '44px' }} />
              <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-3"
                style={{ color: '#8B9BB4', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {pw && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', transition: 'background 0.3s',
                      background: i <= strength.level ? strength.color : '#1E2D45' }} />
                  ))}
                </div>
                {strength.label && (
                  <p style={{ color: strength.color, fontSize: '11px', marginTop: '3px' }}>{strength.label}</p>
                )}
              </div>
            )}
          </div>

          <Field type="password" placeholder="Confirm password" value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)} onBlur={() => blurS2('confirmPw')}
            error={s2Touched.confirmPw ? s2Errors.confirmPw : undefined}
            valid={s2Touched.confirmPw && !s2Errors.confirmPw && !!confirmPw} />

          <div className="mt-1 flex gap-3">
            <button type="button" onClick={() => setStep(1)}
              className="flex-1 rounded-xl py-3 text-sm font-semibold transition-colors"
              style={{ background: 'transparent', border: '1px solid #1E2D45', color: '#8B9BB4', cursor: 'pointer' }}>
              Back
            </button>
            <button type="button" onClick={handleStep2Continue}
              className="flex-[2] rounded-xl py-3 text-sm font-bold transition-all"
              style={{
                background: s2Valid ? '#C9A84C' : '#1E2D45',
                color: s2Valid ? '#0B0F1A' : '#4B5563', border: 'none', cursor: 'pointer',
              }}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3 ── */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
              You're Almost In ✨
            </h2>
          </div>

          {/* Phone with country code */}
          <div className="flex gap-2">
            <select
              value={countryCode} onChange={e => setCountryCode(e.target.value)}
              style={{
                background: '#131929', border: '1px solid #1E2D45', borderRadius: '10px',
                color: '#F0F4FF', fontSize: '14px', padding: '12px 8px', cursor: 'pointer',
                outline: 'none', flexShrink: 0,
              }}
            >
              {COUNTRY_CODES.map(c => (
                <option key={c.label} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
            <div style={{ flex: 1 }}>
              <Field type="tel" placeholder="Phone number" value={phone}
                onChange={e => setPhone(e.target.value)} />
            </div>
          </div>

          {/* Advisor bio */}
          {accountType === 'advisor' && (
            <textarea
              placeholder="Tell clients a bit about your gifts and experience…"
              value={bio} onChange={e => setBio(e.target.value)} rows={3}
              style={{
                width: '100%', background: '#131929', border: '1px solid #1E2D45', borderRadius: '10px',
                padding: '12px 16px', color: '#F0F4FF', fontSize: '14px', outline: 'none',
                resize: 'none', fontFamily: 'inherit', transition: 'border-color 0.2s', boxSizing: 'border-box',
              }}
            />
          )}

          {/* Checkboxes */}
          <div className="flex flex-col gap-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)}
                style={{ marginTop: '2px', accentColor: '#C9A84C', width: '16px', height: '16px', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#8B9BB4', lineHeight: 1.5 }}>
                I agree to the{' '}
                <span style={{ color: '#C9A84C', cursor: 'pointer' }}>Terms & Conditions</span>
                {' '}and{' '}
                <span style={{ color: '#C9A84C', cursor: 'pointer' }}>Privacy Policy</span>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreeMarketing} onChange={e => setAgreeMarketing(e.target.checked)}
                style={{ marginTop: '2px', accentColor: '#C9A84C', width: '16px', height: '16px', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#8B9BB4', lineHeight: 1.5 }}>
                I'd like to receive updates and exclusive offers by email
              </span>
            </label>
          </div>

          {formError && (
            <p style={{ color: '#EF4444', fontSize: '13px', textAlign: 'center' }}>{formError}</p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)}
              className="flex-1 rounded-xl py-3 text-sm font-semibold"
              style={{ background: 'transparent', border: '1px solid #1E2D45', color: '#8B9BB4', cursor: 'pointer' }}>
              Back
            </button>
            <button
              type="button" disabled={!agreeTerms || loading}
              onClick={handleSubmit}
              className="flex flex-[2] items-center justify-center rounded-xl py-3 text-sm font-bold transition-all"
              style={{
                background: agreeTerms && !loading
                  ? (accountType === 'advisor' ? '#2DD4BF' : '#C9A84C')
                  : '#1E2D45',
                color: agreeTerms && !loading ? '#0B0F1A' : '#4B5563',
                border: 'none', cursor: agreeTerms && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? <Spinner /> : accountType === 'advisor' ? 'Apply as Advisor' : 'Create My Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Forgot password mode ─────────────────────────────────────

function ForgotPasswordMode({ setMode }: { setMode: (m: AuthMode) => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidEmail(email)) { setError('Enter a valid email'); setTouched(true); return }
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      setTouched(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <ModalLogo />
        <CheckCircle size={56} style={{ color: '#C9A84C' }} />
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
            Check your inbox!
          </h2>
          <p className="mt-2 text-sm" style={{ color: '#8B9BB4' }}>
            We've sent a reset link to <span style={{ color: '#F0F4FF' }}>{email}</span>
          </p>
        </div>
        <button type="button" onClick={() => setMode('login')}
          style={{ color: '#C9A84C', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
          Back to Sign In
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <ModalLogo />
      <button type="button" onClick={() => setMode('login')}
        className="flex items-center gap-2 text-sm self-start"
        style={{ color: '#8B9BB4', background: 'none', border: 'none', cursor: 'pointer' }}>
        <ArrowLeft size={15} /> Back to Sign In
      </button>
      <div className="text-center">
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
          Reset Your Password
        </h2>
        <p className="mt-1 text-sm" style={{ color: '#8B9BB4' }}>
          Enter your email and we'll send you a reset link
        </p>
      </div>
      <Field
        type="email" placeholder="Email address" value={email}
        onChange={e => { setEmail(e.target.value); setError('') }}
        onBlur={() => { setTouched(true); if (!isValidEmail(email)) setError('Enter a valid email') }}
        error={touched ? error : undefined}
        valid={touched && !error && !!email}
      />
      <button type="submit"
        className="flex items-center justify-center rounded-xl font-bold text-sm"
        style={{ height: '48px', background: '#C9A84C', color: '#0B0F1A', border: 'none', cursor: 'pointer' }}>
        {loading ? <Spinner /> : 'Send Reset Link'}
      </button>
    </form>
  )
}

// ─── Verify email mode ────────────────────────────────────────

interface VerifyEmailProps {
  email: string
  showToast: (msg: string) => void
  onClose: () => void
}

function VerifyEmailMode({ email, showToast, onClose }: VerifyEmailProps) {
  function handleLater() {
    onClose()
    showToast('Check your inbox to verify your email and unlock all features ✨')
  }

  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <ModalLogo />
      <Mail size={56} style={{ color: '#C9A84C' }} />
      <div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, color: '#F0F4FF', margin: 0 }}>
          Verify Your Email
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: '#8B9BB4' }}>
          We've sent a verification link to{' '}
          <span style={{ color: '#F0F4FF' }}>{email || 'your email'}</span>.
          Click it to activate your account.
        </p>
      </div>
      <button
        type="button"
        onClick={() => showToast('Email resent!')}
        style={{ color: '#C9A84C', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
        Resend email
      </button>
      <button
        type="button" onClick={handleLater}
        style={{ color: '#4B5563', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
        I'll do this later
      </button>
    </div>
  )
}

// ─── Main AuthModal ───────────────────────────────────────────

export default function AuthModal() {
  const { authModalOpen, authModalMode, preSelectedUserType, closeAuthModal } = useModalStore()
  const [mode, setMode] = useState<AuthMode>(authModalMode)
  const [capturedEmail, setCapturedEmail] = useState('')
  const [toast, setToast] = useState({ msg: '', visible: false })
  const scrollRef = useRef<HTMLDivElement>(null)

  // Sync mode from store when modal opens
  useEffect(() => {
    if (authModalOpen) {
      setMode(authModalMode)
      setTimeout(() => scrollRef.current?.scrollTo({ top: 0 }), 0)
    }
  }, [authModalOpen, authModalMode])

  // Scroll to top when mode changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [mode])

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = authModalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [authModalOpen])

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAuthModal() }
    if (authModalOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [authModalOpen, closeAuthModal])

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  if (!authModalOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeAuthModal}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Modal card */}
        <div
          ref={scrollRef}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '20px',
            width: '480px', maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh',
            overflowY: 'auto', position: 'relative',
            animation: 'modalIn 0.2s ease both',
          }}
        >
          {/* Close button */}
          <button
            aria-label="Close" onClick={closeAuthModal}
            style={{
              position: 'absolute', top: '16px', right: '16px', zIndex: 10,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#4B5563', display: 'flex', padding: '4px',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#F0F4FF' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#4B5563' }}
          >
            <X size={20} />
          </button>

          {/* Content */}
          <div style={{ padding: '32px 32px 28px' }}>
            {mode === 'login' && (
              <LoginMode key="login" setMode={setMode} showToast={showToast} onClose={closeAuthModal} />
            )}
            {mode === 'register' && (
              <RegisterMode key="register" setMode={setMode} showToast={showToast} onClose={closeAuthModal}
                setCapturedEmail={setCapturedEmail} preSelectedUserType={preSelectedUserType} />
            )}
            {mode === 'forgot-password' && (
              <ForgotPasswordMode key="forgot" setMode={setMode} />
            )}
            {mode === 'verify-email' && (
              <VerifyEmailMode key="verify" email={capturedEmail} showToast={showToast} onClose={closeAuthModal} />
            )}
          </div>
        </div>
      </div>

      {/* Toast rendered outside modal so it's on top */}
      <Toast message={toast.msg} visible={toast.visible} />

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  )
}
