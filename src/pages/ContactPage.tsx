// ============================================================
// WhiteStellar — Contact Page
// src/pages/ContactPage.tsx
// ============================================================

import { useState } from 'react'
import { Mail, Clock, MessageCircle, CheckCircle, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { submitContactForm } from '../lib/api/reviews'

// ─── Types ────────────────────────────────────────────────────

interface FormState {
  requestType: string
  name: string
  email: string
  subject: string
  message: string
}

const REQUEST_TYPES = [
  'General Inquiry',
  'Billing & Payments',
  'Account Issue',
  'Session Problem',
  'Advisor Complaint',
  'Technical Support',
  'Partnership / Media',
  'Join as an Advisor',
]

const CONTACT_INFO = [
  {
    icon: Mail,
    title: 'Email Support',
    value: 'service@whitestellar.com',
    subtext: 'We reply within 24 hours',
    href: 'mailto:service@whitestellar.com',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    value: 'Available on the platform',
    subtext: 'Mon–Fri, 9am–9pm EST',
    href: null,
  },
  {
    icon: Clock,
    title: 'Response Time',
    value: 'Within 24 hours',
    subtext: 'Usually much faster',
    href: null,
  },
]

// ─── Component ────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    requestType: '',
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function validate(): boolean {
    const next: Partial<FormState> = {}
    if (!form.requestType) next.requestType = 'Please select a request type'
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.email.trim()) next.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email'
    if (!form.subject.trim()) next.subject = 'Subject is required'
    if (!form.message.trim()) next.message = 'Message is required'
    else if (form.message.trim().length < 20) next.message = 'Please provide more detail (min 20 characters)'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await submitContactForm({
        requestType: form.requestType,
        subject: form.subject,
        email: form.email,
        message: `From: ${form.name}\n\n${form.message}`,
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Contact form error:', err)
      setErrors(prev => ({ ...prev, message: 'Failed to send message. Please try again.' }))
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    background: '#0B0F1A',
    border: `1px solid ${hasError ? '#EF4444' : '#1E2D45'}`,
    borderRadius: '10px', padding: '11px 14px',
    color: '#F0F4FF', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.15s',
  })

  const labelStyle: React.CSSProperties = {
    display: 'block', color: '#8B9BB4', fontSize: '13px',
    fontWeight: 600, marginBottom: '6px',
  }

  const errorStyle: React.CSSProperties = {
    color: '#EF4444', fontSize: '11px', marginTop: '4px',
  }

  return (
    <div style={{ background: '#0B0F1A', minHeight: '100vh', color: '#F0F4FF' }}>

      {/* ── Hero ── */}
      <section style={{
        background: 'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(99,60,180,0.16) 0%, transparent 65%)',
        padding: '64px 24px 48px', textAlign: 'center',
        borderBottom: '1px solid #1E2D45',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <Star size={14} fill="#C9A84C" color="#C9A84C" />
          <span style={{ color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Get in Touch
          </span>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 700, margin: '0 0 12px' }}>
          Contact Us
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '16px', maxWidth: '480px', marginInline: 'auto' }}>
          Have a question, issue, or feedback? We are here to help. Fill out the form and our team will get back to you shortly.
        </p>
      </section>

      {/* ── Main content ── */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '56px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'flex-start' }}>

          {/* ── Left: Form ── */}
          <div style={{ flex: '1 1 58%' }}>
            {submitted ? (
              /* Success state */
              <div style={{
                background: '#0D1221', border: '1px solid rgba(45,212,191,0.3)',
                borderRadius: '20px', padding: '56px 32px', textAlign: 'center',
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <CheckCircle size={28} color="#2DD4BF" />
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
                  Message Sent!
                </h2>
                <p style={{ color: '#8B9BB4', fontSize: '15px', marginBottom: '24px', lineHeight: 1.7 }}>
                  Thank you for reaching out. Our team will review your message and reply to <strong style={{ color: '#F0F4FF' }}>{form.email}</strong> within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ requestType: '', name: '', email: '', subject: '', message: '' }) }}
                  style={{
                    background: '#C9A84C', color: '#0B0F1A', border: 'none',
                    borderRadius: '10px', padding: '10px 24px',
                    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E8C76A' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#C9A84C' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              /* Form */
              <form
                onSubmit={handleSubmit}
                style={{
                  background: '#0D1221', border: '1px solid #1E2D45',
                  borderRadius: '20px', padding: '32px',
                }}
                noValidate
              >
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
                  Send a Message
                </h2>

                {/* Request type */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={labelStyle}>Request Type *</label>
                  <select
                    value={form.requestType}
                    onChange={e => handleChange('requestType', e.target.value)}
                    style={{ ...inputStyle(!!errors.requestType), appearance: 'none', cursor: 'pointer' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.requestType ? '#EF4444' : '#1E2D45' }}
                  >
                    <option value="" disabled style={{ background: '#0D1221' }}>Select a topic...</option>
                    {REQUEST_TYPES.map(t => (
                      <option key={t} value={t} style={{ background: '#0D1221' }}>{t}</option>
                    ))}
                  </select>
                  {errors.requestType && <p style={errorStyle}>{errors.requestType}</p>}
                </div>

                {/* Name + Email row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="Your name"
                      style={inputStyle(!!errors.name)}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.name ? '#EF4444' : '#1E2D45' }}
                    />
                    {errors.name && <p style={errorStyle}>{errors.name}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => handleChange('email', e.target.value)}
                      placeholder="you@email.com"
                      style={inputStyle(!!errors.email)}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = errors.email ? '#EF4444' : '#1E2D45' }}
                    />
                    {errors.email && <p style={errorStyle}>{errors.email}</p>}
                  </div>
                </div>

                {/* Subject */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={labelStyle}>Subject *</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => handleChange('subject', e.target.value)}
                    placeholder="Brief summary of your issue"
                    style={inputStyle(!!errors.subject)}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.subject ? '#EF4444' : '#1E2D45' }}
                  />
                  {errors.subject && <p style={errorStyle}>{errors.subject}</p>}
                </div>

                {/* Message */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Message *</label>
                  <textarea
                    value={form.message}
                    onChange={e => handleChange('message', e.target.value)}
                    placeholder="Please describe your question or issue in detail..."
                    rows={6}
                    style={{ ...inputStyle(!!errors.message), resize: 'vertical', minHeight: '120px', fontFamily: 'inherit' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = errors.message ? '#EF4444' : '#1E2D45' }}
                  />
                  {errors.message && <p style={errorStyle}>{errors.message}</p>}
                  <p style={{ color: '#4B5563', fontSize: '11px', marginTop: '4px' }}>
                    {form.message.length} characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%', padding: '13px',
                    background: submitting ? '#8B6B2E' : '#C9A84C',
                    color: '#0B0F1A', border: 'none',
                    borderRadius: '10px', fontWeight: 700, fontSize: '15px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = '#E8C76A' }}
                  onMouseLeave={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = '#C9A84C' }}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* ── Right: Contact info ── */}
          <div style={{ flex: '1 1 36%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
              Contact Information
            </h2>
            <p style={{ color: '#8B9BB4', fontSize: '14px', marginBottom: '8px', lineHeight: 1.7 }}>
              Whether you have a billing question, session issue, or just want to say hello — we are always happy to hear from you.
            </p>

            {CONTACT_INFO.map(info => (
              <div
                key={info.title}
                style={{
                  background: '#0D1221', border: '1px solid #1E2D45',
                  borderRadius: '14px', padding: '20px',
                  display: 'flex', gap: '14px', alignItems: 'flex-start',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <info.icon size={18} color="#C9A84C" />
                </div>
                <div>
                  <p style={{ color: '#4B5563', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    {info.title}
                  </p>
                  {info.href ? (
                    <a
                      href={info.href}
                      style={{ color: '#F0F4FF', fontSize: '14px', fontWeight: 600, textDecoration: 'none', display: 'block', marginBottom: '2px' }}
                    >
                      {info.value}
                    </a>
                  ) : (
                    <p style={{ color: '#F0F4FF', fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{info.value}</p>
                  )}
                  <p style={{ color: '#8B9BB4', fontSize: '12px' }}>{info.subtext}</p>
                </div>
              </div>
            ))}

            {/* FAQ prompt */}
            <div style={{
              background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '14px', padding: '20px', marginTop: '4px',
            }}>
              <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                Looking for quick answers?
              </p>
              <p style={{ color: '#8B9BB4', fontSize: '13px', marginBottom: '14px', lineHeight: 1.6 }}>
                Our FAQ covers billing, sessions, advisors, and more. Check it out before reaching out.
              </p>
              <Link
                to="/faq"
                style={{
                  display: 'inline-block', color: '#C9A84C', fontSize: '13px',
                  fontWeight: 600, textDecoration: 'none',
                  border: '1px solid rgba(201,168,76,0.4)',
                  borderRadius: '8px', padding: '7px 16px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'rgba(201,168,76,0.1)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'transparent'
                }}
              >
                Browse FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
