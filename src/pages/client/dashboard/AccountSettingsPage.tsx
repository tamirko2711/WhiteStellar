// ============================================================
// WhiteStellar — Account Settings Page
// src/pages/client/dashboard/AccountSettingsPage.tsx
// ============================================================

import { useState } from 'react'
import { Mail, Lock, Chrome, Apple, Trash2, Eye, EyeOff, Check } from 'lucide-react'
import { useAuthStore } from '../../../store/authStore'
import Toast from '../../../components/Toast'

// ─── Section wrapper ──────────────────────────────────────────

function Section({
  icon: Icon, title, subtitle, children,
}: {
  icon: React.ElementType
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div style={{
      background: '#0D1221', border: '1px solid #1A2235',
      borderRadius: '16px', padding: '24px', marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'rgba(201,168,76,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color="#C9A84C" />
        </div>
        <h2 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '16px', margin: 0 }}>{title}</h2>
      </div>
      <p style={{ color: '#4B5563', fontSize: '13px', margin: '0 0 20px', paddingLeft: '42px' }}>{subtitle}</p>
      {children}
    </div>
  )
}

// ─── Text input ───────────────────────────────────────────────

function Input({
  label, type = 'text', value, onChange, placeholder, rightEl,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void
  placeholder?: string; rightEl?: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', background: '#131929', border: '1px solid #1E2D45',
            borderRadius: '10px', padding: '11px 14px',
            color: '#F0F4FF', fontSize: '14px', outline: 'none',
            boxSizing: 'border-box',
            paddingRight: rightEl ? '44px' : '14px',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#C9A84C' }}
          onBlur={e => { e.currentTarget.style.borderColor = '#1E2D45' }}
        />
        {rightEl && (
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            {rightEl}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Primary button ───────────────────────────────────────────

function PrimaryBtn({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#1A2540' : 'linear-gradient(135deg,#C9A84C,#E8C96D)',
        border: 'none', borderRadius: '10px', padding: '11px 22px',
        color: disabled ? '#4B5563' : '#0B0F1A',
        fontWeight: 700, fontSize: '14px',
        cursor: disabled ? 'default' : 'pointer', transition: 'opacity 0.15s',
      }}
    >
      {children}
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function AccountSettingsPage() {
  useAuthStore()

  // Email
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')

  // Password
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Connected accounts
  const [googleConnected, setGoogleConnected] = useState(false)
  const [appleConnected, setAppleConnected] = useState(false)

  // Danger zone
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Toast
  const [toast, setToast] = useState({ msg: '', visible: false })
  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  function handleEmailSave() {
    if (!newEmail.includes('@')) return
    showToast('Verification email sent to ' + newEmail)
    setNewEmail('')
    setEmailPassword('')
  }

  function handlePasswordSave() {
    if (!currentPw || !newPw || newPw !== confirmPw) return
    if (newPw.length < 8) return
    showToast('Password updated successfully!')
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
  }

  function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') return
    showToast('Account deletion request submitted.')
    setShowDeleteModal(false)
    setDeleteConfirmText('')
  }

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button
      onClick={toggle}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', padding: 0, display: 'flex' }}
    >
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )

  return (
    <div style={{ maxWidth: '560px' }}>
      <h1 style={{
        color: '#F0F4FF', fontWeight: 700, fontSize: '22px',
        fontFamily: "'Playfair Display', serif", margin: '0 0 24px',
      }}>
        Account Settings
      </h1>

      {/* ── Section 1: Change Email ── */}
      <Section icon={Mail} title="Email Address" subtitle="Update the email linked to your account">
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#131929', border: '1px solid #1E2D45',
          borderRadius: '10px', padding: '11px 14px', marginBottom: '14px',
        }}>
          <Check size={14} color="#2DD4BF" />
          <span style={{ color: '#8B9BB4', fontSize: '13px' }}>Current: </span>
          <span style={{ color: '#F0F4FF', fontSize: '14px', fontWeight: 500 }}>
            {'sarah.m@email.com'}
          </span>
        </div>
        <Input
          label="New Email Address"
          type="email"
          value={newEmail}
          onChange={setNewEmail}
          placeholder="you@example.com"
        />
        <Input
          label="Confirm with Password"
          type={showCurrent ? 'text' : 'password'}
          value={emailPassword}
          onChange={setEmailPassword}
          placeholder="Enter your current password"
          rightEl={eyeBtn(showCurrent, () => setShowCurrent(v => !v))}
        />
        <PrimaryBtn
          onClick={handleEmailSave}
          disabled={!newEmail.includes('@') || !emailPassword}
        >
          Send Verification Email
        </PrimaryBtn>
      </Section>

      {/* ── Section 2: Change Password ── */}
      <Section icon={Lock} title="Change Password" subtitle="Use a strong password with at least 8 characters">
        <Input
          label="Current Password"
          type={showCurrent ? 'text' : 'password'}
          value={currentPw}
          onChange={setCurrentPw}
          placeholder="••••••••"
          rightEl={eyeBtn(showCurrent, () => setShowCurrent(v => !v))}
        />
        <Input
          label="New Password"
          type={showNew ? 'text' : 'password'}
          value={newPw}
          onChange={setNewPw}
          placeholder="Min. 8 characters"
          rightEl={eyeBtn(showNew, () => setShowNew(v => !v))}
        />

        {/* Password strength */}
        {newPw.length > 0 && (
          <div style={{ marginBottom: '14px', marginTop: '-6px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              {[1, 2, 3, 4].map(i => {
                const strength = newPw.length >= 12 ? 4 : newPw.length >= 10 ? 3 : newPw.length >= 8 ? 2 : 1
                const filled = i <= strength
                const color = strength <= 1 ? '#EF4444' : strength === 2 ? '#F59E0B' : strength === 3 ? '#22C55E' : '#2DD4BF'
                return (
                  <div key={i} style={{
                    flex: 1, height: '3px', borderRadius: '2px',
                    background: filled ? color : '#1E2D45', transition: 'background 0.2s',
                  }} />
                )
              })}
            </div>
            <span style={{ fontSize: '11px', color: '#4B5563' }}>
              {newPw.length < 8 ? 'Too short' : newPw.length < 10 ? 'Weak' : newPw.length < 12 ? 'Good' : 'Strong'}
            </span>
          </div>
        )}

        <Input
          label="Confirm New Password"
          type={showConfirm ? 'text' : 'password'}
          value={confirmPw}
          onChange={setConfirmPw}
          placeholder="Repeat new password"
          rightEl={eyeBtn(showConfirm, () => setShowConfirm(v => !v))}
        />
        {confirmPw && newPw !== confirmPw && (
          <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '-10px', marginBottom: '14px' }}>
            Passwords don't match
          </p>
        )}
        <PrimaryBtn
          onClick={handlePasswordSave}
          disabled={!currentPw || newPw.length < 8 || newPw !== confirmPw}
        >
          Update Password
        </PrimaryBtn>
      </Section>

      {/* ── Section 3: Connected Accounts ── */}
      <Section icon={Chrome} title="Connected Accounts" subtitle="Link third-party accounts for faster sign-in">
        {[
          { icon: Chrome, label: 'Google', desc: 'Sign in with your Google account', state: googleConnected, toggle: () => setGoogleConnected(v => !v) },
          { icon: Apple, label: 'Apple', desc: 'Sign in with your Apple ID', state: appleConnected, toggle: () => setAppleConnected(v => !v) },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#131929', border: '1px solid #1E2D45',
            borderRadius: '12px', padding: '14px 16px', marginBottom: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'rgba(30,45,69,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon size={18} color="#8B9BB4" />
              </div>
              <div>
                <p style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px', margin: 0 }}>{item.label}</p>
                <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>{item.desc}</p>
              </div>
            </div>
            <button
              onClick={() => { item.toggle(); showToast(item.state ? item.label + ' disconnected' : item.label + ' connected!') }}
              style={{
                padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', border: '1px solid',
                background: item.state ? 'rgba(239,68,68,0.08)' : 'rgba(201,168,76,0.08)',
                borderColor: item.state ? 'rgba(239,68,68,0.3)' : 'rgba(201,168,76,0.3)',
                color: item.state ? '#EF4444' : '#C9A84C',
                transition: 'all 0.15s',
              }}
            >
              {item.state ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </Section>

      {/* ── Section 4: Danger Zone ── */}
      <div style={{
        background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '16px', padding: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(239,68,68,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trash2 size={16} color="#EF4444" />
          </div>
          <h2 style={{ color: '#EF4444', fontWeight: 700, fontSize: '16px', margin: 0 }}>Danger Zone</h2>
        </div>
        <p style={{ color: '#4B5563', fontSize: '13px', margin: '0 0 16px', paddingLeft: '42px' }}>
          Permanently delete your account and all associated data.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '11px 22px',
            color: '#EF4444', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
          }}
        >
          Delete My Account
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(8,12,22,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            background: '#0D1221', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '420px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Trash2 size={20} color="#EF4444" />
              <h3 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '18px', margin: 0 }}>
                Delete Account
              </h3>
            </div>
            <p style={{ color: '#8B9BB4', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
              This action is <strong style={{ color: '#EF4444' }}>irreversible</strong>. Your account, wallet balance, session history, and saved advisors will be permanently deleted.
            </p>
            <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Type <strong style={{ color: '#EF4444' }}>DELETE</strong> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{
                width: '100%', background: '#131929', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', padding: '11px 14px',
                color: '#F0F4FF', fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', marginBottom: '16px',
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                style={{
                  flex: 1, padding: '12px',
                  background: deleteConfirmText === 'DELETE' ? '#EF4444' : '#1A2540',
                  border: 'none', borderRadius: '10px',
                  color: deleteConfirmText === 'DELETE' ? '#fff' : '#4B5563',
                  fontWeight: 700, fontSize: '14px',
                  cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'default',
                }}
              >
                Delete Account
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText('') }}
                style={{
                  flex: 1, padding: '12px',
                  background: 'none', border: '1px solid #1A2235',
                  borderRadius: '10px', color: '#8B9BB4',
                  fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}
