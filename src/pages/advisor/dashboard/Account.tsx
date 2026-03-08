// ============================================================
// WhiteStellar — Advisor Dashboard: Account Settings
// src/pages/advisor/dashboard/Account.tsx
// ============================================================

import { useState } from 'react'
import {
  Eye, EyeOff, CreditCard, Building2, Wallet,
  Mail, Phone, AlertTriangle, Check, X, Sparkles,
} from 'lucide-react'

// ─── Password strength ────────────────────────────────────────

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '#1E2D45' }
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const MAP = [
    { label: 'Weak',   color: '#EF4444' },
    { label: 'Fair',   color: '#F59E0B' },
    { label: 'Good',   color: '#3B82F6' },
    { label: 'Strong', color: '#22C55E' },
  ]
  return { score, ...MAP[Math.min(score - 1, 3)] }
}

// ─── Section wrapper ──────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#0F1828', border: '1px solid #1E2D45',
      borderRadius: '16px', padding: '24px', marginBottom: '20px',
    }}>
      <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: '0 0 20px', fontSize: '15px' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string
}) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{
        display: 'block', color: '#8B9BB4', fontSize: '12px',
        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px',
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', background: '#1A2540', border: '1px solid #1E2D45',
          borderRadius: '10px', padding: '10px 14px', color: '#F0F4FF',
          fontSize: '14px', outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

// ─── Withdrawal method card ───────────────────────────────────

type WithdrawMethod = 'paypal' | 'payoneer' | 'bank'

function WithdrawCard({
  icon, label, description, value, selected, onClick,
}: {
  icon: React.ReactNode; label: string; description: string
  value: WithdrawMethod; selected: WithdrawMethod; onClick: () => void
}) {
  const active = selected === value
  return (
    <div
      onClick={onClick}
      style={{
        flex: '1 1 150px', background: active ? 'rgba(201,168,76,0.06)' : '#1A2540',
        border: `1px solid ${active ? '#C9A84C' : '#1E2D45'}`,
        borderRadius: '12px', padding: '16px', cursor: 'pointer',
        transition: 'all 0.15s', position: 'relative',
      }}
    >
      {active && (
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          width: '18px', height: '18px', borderRadius: '50%',
          background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={10} color="#0B0F1A" strokeWidth={3} />
        </div>
      )}
      <div style={{ color: active ? '#C9A84C' : '#8B9BB4', marginBottom: '8px' }}>
        {icon}
      </div>
      <p style={{ color: active ? '#C9A84C' : '#F0F4FF', fontWeight: 600, fontSize: '14px', margin: '0 0 3px' }}>
        {label}
      </p>
      <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>{description}</p>
    </div>
  )
}

// ─── Delete confirmation modal ────────────────────────────────

function DeleteModal({ onClose }: { onClose: () => void }) {
  const [typed, setTyped] = useState('')
  const confirmed = typed === 'DELETE'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.8)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: '#0F1828', border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '16px', padding: '28px', maxWidth: '440px', width: '100%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={20} color="#EF4444" />
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4' }}>
            <X size={18} />
          </button>
        </div>
        <h3 style={{ color: '#EF4444', fontWeight: 700, margin: '0 0 8px', fontSize: '18px' }}>
          Delete Account
        </h3>
        <p style={{ color: '#8B9BB4', fontSize: '14px', lineHeight: 1.65, margin: '0 0 16px' }}>
          This will permanently delete your advisor profile, all session history, earnings records, and reviews. <strong style={{ color: '#F0F4FF' }}>This cannot be undone.</strong>
        </p>
        <p style={{ color: '#8B9BB4', fontSize: '13px', margin: '0 0 8px' }}>
          Type <strong style={{ color: '#EF4444' }}>DELETE</strong> to confirm:
        </p>
        <input
          value={typed}
          onChange={e => setTyped(e.target.value)}
          placeholder="DELETE"
          style={{
            width: '100%', background: '#1A2540', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '10px 14px', color: '#F0F4FF',
            fontSize: '14px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', borderRadius: '10px',
            background: '#1A2540', border: '1px solid #1E2D45',
            color: '#8B9BB4', cursor: 'pointer', fontSize: '14px',
          }}>
            Cancel
          </button>
          <button
            onClick={() => alert('Account deletion simulated.')}
            disabled={!confirmed}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              background: confirmed ? '#EF4444' : '#4B5563', border: 'none',
              color: '#fff', fontWeight: 700, cursor: confirmed ? 'pointer' : 'default',
              fontSize: '14px',
            }}
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────

export default function AdvisorAccount() {
  // Password change
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')

  // Withdrawal
  const [withdrawal, setWithdrawal] = useState<WithdrawMethod>('paypal')
  const [paypalEmail, setPaypalEmail] = useState('luna@example.com')
  const [payoneerEmail, setPayoneerEmail] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [bankRouting, setBankRouting] = useState('')
  const [withdrawSaved, setWithdrawSaved] = useState(false)

  // Contact
  const [email, setEmail] = useState('luna.starweaver@whiteStellar.com')
  const [phone, setPhone] = useState('+1 555 0100')
  const [contactSaved, setContactSaved] = useState(false)

  // AI Pre-Screen Agent
  const [prescreenEnabled, setPrescreenEnabled] = useState(false)
  const [prescreenRange, setPrescreenRange] = useState<1 | 2 | 3>(1)
  const [prescreenSaved, setPrescreenSaved] = useState(false)

  // Danger zone
  const [showDelete, setShowDelete] = useState(false)
  const [deactivated, setDeactivated] = useState(false)

  const strength = passwordStrength(newPw)

  function handleChangePw() {
    setPwError('')
    if (!currentPw) return setPwError('Current password is required.')
    if (newPw.length < 8) return setPwError('New password must be at least 8 characters.')
    if (newPw !== confirmPw) return setPwError('Passwords do not match.')
    setTimeout(() => {
      setPwSaved(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => setPwSaved(false), 2500)
    }, 700)
  }

  function handleWithdrawSave() {
    setTimeout(() => {
      setWithdrawSaved(true)
      setTimeout(() => setWithdrawSaved(false), 2500)
    }, 500)
  }

  function handleContactSave() {
    setTimeout(() => {
      setContactSaved(true)
      setTimeout(() => setContactSaved(false), 2500)
    }, 500)
  }

  function SaveBtn({ saved, onClick, label = 'Save Changes' }: {
    saved: boolean; onClick: () => void; label?: string
  }) {
    return (
      <button
        onClick={onClick}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: saved ? '#22C55E' : 'linear-gradient(135deg,#C9A84C,#E8C96D)',
          border: 'none', color: saved ? '#fff' : '#0B0F1A',
          fontWeight: 700, padding: '10px 24px', borderRadius: '10px',
          cursor: 'pointer', fontSize: '14px',
        }}
      >
        {saved ? <><Check size={14} /> Saved!</> : label}
      </button>
    )
  }

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>
          Account Settings
        </h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
          Manage your login, payouts, and account preferences.
        </p>
      </div>

      {/* Change Password */}
      <Section title="Change Password">
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Current Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showCurrentPw ? 'text' : 'password'}
              value={currentPw}
              onChange={e => setCurrentPw(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', background: '#1A2540', border: '1px solid #1E2D45',
                borderRadius: '10px', padding: '10px 44px 10px 14px', color: '#F0F4FF',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => setShowCurrentPw(v => !v)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563' }}
            >
              {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            New Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showNewPw ? 'text' : 'password'}
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="At least 8 characters"
              style={{
                width: '100%', background: '#1A2540', border: '1px solid #1E2D45',
                borderRadius: '10px', padding: '10px 44px 10px 14px', color: '#F0F4FF',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <button
              onClick={() => setShowNewPw(v => !v)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563' }}
            >
              {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {newPw && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: '4px', borderRadius: '2px',
                    background: i <= strength.score ? strength.color : '#1E2D45',
                    transition: 'background 0.2s',
                  }} />
                ))}
              </div>
              <span style={{ color: strength.color, fontSize: '11px' }}>{strength.label}</span>
            </div>
          )}
        </div>

        <Field label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} type="password" placeholder="Re-enter new password" />

        {pwError && (
          <p style={{ color: '#EF4444', fontSize: '13px', margin: '0 0 12px' }}>{pwError}</p>
        )}

        <SaveBtn saved={pwSaved} onClick={handleChangePw} label="Update Password" />
      </Section>

      {/* Withdrawal Method */}
      <Section title="Withdrawal Method">
        <p style={{ color: '#8B9BB4', fontSize: '13px', margin: '0 0 16px' }}>
          Choose where your earnings are sent when you request a payout.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <WithdrawCard
            icon={<Wallet size={22} />}
            label="PayPal"
            description="Instant transfers"
            value="paypal"
            selected={withdrawal}
            onClick={() => setWithdrawal('paypal')}
          />
          <WithdrawCard
            icon={<CreditCard size={22} />}
            label="Payoneer"
            description="Global payments"
            value="payoneer"
            selected={withdrawal}
            onClick={() => setWithdrawal('payoneer')}
          />
          <WithdrawCard
            icon={<Building2 size={22} />}
            label="Bank Transfer"
            description="2–5 business days"
            value="bank"
            selected={withdrawal}
            onClick={() => setWithdrawal('bank')}
          />
        </div>

        {withdrawal === 'paypal' && (
          <Field label="PayPal Email" value={paypalEmail} onChange={setPaypalEmail} type="email" />
        )}
        {withdrawal === 'payoneer' && (
          <Field label="Payoneer Account Email" value={payoneerEmail} onChange={setPayoneerEmail} type="email" placeholder="your@payoneer.com" />
        )}
        {withdrawal === 'bank' && (
          <>
            <Field label="Bank Name" value={bankName} onChange={setBankName} placeholder="e.g. Chase Bank" />
            <Field label="Account Number" value={bankAccount} onChange={setBankAccount} />
            <Field label="Routing Number" value={bankRouting} onChange={setBankRouting} />
          </>
        )}

        <SaveBtn saved={withdrawSaved} onClick={handleWithdrawSave} />
      </Section>

      {/* Contact Info */}
      <Section title="Contact Information">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Mail size={16} color="#4B5563" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              style={{
                width: '100%', background: '#1A2540', border: '1px solid #1E2D45',
                borderRadius: '10px', padding: '10px 14px', color: '#F0F4FF',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Phone size={16} color="#4B5563" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              Phone Number
            </label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              type="tel"
              style={{
                width: '100%', background: '#1A2540', border: '1px solid #1E2D45',
                borderRadius: '10px', padding: '10px 14px', color: '#F0F4FF',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
        <SaveBtn saved={contactSaved} onClick={handleContactSave} />
      </Section>

      {/* AI Pre-Screen Agent */}
      <div style={{
        background: '#0F1828',
        border: '1px solid #C9A84C',
        borderRadius: '16px', padding: '24px', marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Sparkles size={18} color="#C9A84C" />
          <h3 style={{ color: '#C9A84C', fontWeight: 700, margin: 0, fontSize: '15px' }}>
            AI Pre-Screen Agent
          </h3>
          {/* Toggle */}
          <button
            onClick={() => setPrescreenEnabled(v => !v)}
            style={{
              marginLeft: 'auto', width: '44px', height: '24px',
              borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: prescreenEnabled ? '#C9A84C' : '#1E2D45',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: '3px',
              left: prescreenEnabled ? '23px' : '3px',
              width: '18px', height: '18px', borderRadius: '50%',
              background: '#F0F4FF', transition: 'left 0.2s',
            }} />
          </button>
        </div>
        <p style={{ color: '#8B9BB4', fontSize: '13px', margin: '0 0 20px', lineHeight: 1.6 }}>
          When enabled, an AI assistant warms up new clients before you join — gathering context and evaluating intent so you can start every session already informed.
        </p>

        {prescreenEnabled && (
          <>
            <p style={{ color: '#F0F4FF', fontSize: '13px', fontWeight: 600, margin: '0 0 10px' }}>
              Activate for clients joining their:
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {([
                { value: 1, label: '1st session only' },
                { value: 2, label: '1st & 2nd sessions' },
                { value: 3, label: '1st, 2nd & 3rd sessions' },
              ] as const).map(opt => {
                const active = prescreenRange === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setPrescreenRange(opt.value)}
                    style={{
                      flex: '1 1 140px', padding: '10px 14px', borderRadius: '10px',
                      border: `1px solid ${active ? '#C9A84C' : '#1E2D45'}`,
                      background: active ? 'rgba(201,168,76,0.10)' : '#1A2540',
                      color: active ? '#C9A84C' : '#8B9BB4',
                      fontSize: '13px', fontWeight: active ? 700 : 400,
                      cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                  >
                    {active && <Check size={13} color="#C9A84C" />}
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </>
        )}

        <button
          onClick={() => {
            setTimeout(() => {
              setPrescreenSaved(true)
              setTimeout(() => setPrescreenSaved(false), 2500)
            }, 400)
          }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: prescreenSaved ? '#22C55E' : 'linear-gradient(135deg,#C9A84C,#E8C96D)',
            border: 'none', color: prescreenSaved ? '#fff' : '#0B0F1A',
            fontWeight: 700, padding: '10px 24px', borderRadius: '10px',
            cursor: 'pointer', fontSize: '14px',
          }}
        >
          {prescreenSaved ? <><Check size={14} /> Saved!</> : 'Save Preferences'}
        </button>
      </div>

      {/* Danger Zone */}
      <div style={{
        background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '16px', padding: '24px',
      }}>
        <h3 style={{ color: '#EF4444', fontWeight: 600, margin: '0 0 6px', fontSize: '15px' }}>
          Danger Zone
        </h3>
        <p style={{ color: '#8B9BB4', fontSize: '13px', margin: '0 0 20px' }}>
          These actions are irreversible. Please proceed with caution.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Deactivate */}
          <div style={{
            flex: '1 1 240px', background: '#0F1828', border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: '12px', padding: '16px',
          }}>
            <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px', margin: '0 0 4px' }}>
              Deactivate Account
            </p>
            <p style={{ color: '#8B9BB4', fontSize: '12px', margin: '0 0 12px', lineHeight: 1.5 }}>
              Your profile will be hidden from clients. You can reactivate anytime.
            </p>
            <button
              onClick={() => setDeactivated(d => !d)}
              style={{
                background: deactivated ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${deactivated ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: deactivated ? '#22C55E' : '#EF4444',
                borderRadius: '8px', padding: '7px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              }}
            >
              {deactivated ? 'Reactivate Account' : 'Deactivate Account'}
            </button>
          </div>

          {/* Delete */}
          <div style={{
            flex: '1 1 240px', background: '#0F1828', border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: '12px', padding: '16px',
          }}>
            <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px', margin: '0 0 4px' }}>
              Delete Account
            </p>
            <p style={{ color: '#8B9BB4', fontSize: '12px', margin: '0 0 12px', lineHeight: 1.5 }}>
              Permanently remove all your data from WhiteStellar. This cannot be undone.
            </p>
            <button
              onClick={() => setShowDelete(true)}
              style={{
                background: '#EF4444', border: 'none',
                color: '#fff', borderRadius: '8px', padding: '7px 16px',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              }}
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {showDelete && <DeleteModal onClose={() => setShowDelete(false)} />}
    </div>
  )
}
