import { useState, useRef } from 'react'
import { Camera, Trash2, Eye, EyeOff, LayoutGrid } from 'lucide-react'
import { format } from 'date-fns'
import { CLIENTS } from '../../../data/advisors'
import { useAuthStore } from '../../../store/authStore'
import Toast from '../../../components/Toast'

// ─── Constants ────────────────────────────────────────────────

const CLIENT_ID   = 201
const CLIENT_DATA = CLIENTS.find(c => c.id === CLIENT_ID)!

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Israel', 'Spain', 'Italy', 'Brazil',
]

const COUNTRY_FLAGS: Record<string, string> = {
  'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Canada': '🇨🇦',
  'Australia':     '🇦🇺', 'Germany':        '🇩🇪', 'France': '🇫🇷',
  'Israel':        '🇮🇱', 'Spain':          '🇪🇸', 'Italy':  '🇮🇹',
  'Brazil':        '🇧🇷',
}

// ─── Helpers ──────────────────────────────────────────────────

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

// ─── Toggle switch ────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      style={{
        width: '44px', height: '24px', borderRadius: '12px', flexShrink: 0,
        background: on ? '#C9A84C' : '#1E2D45',
        position: 'relative', border: 'none', cursor: 'pointer',
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: '3px',
        left: on ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
      }} />
    </button>
  )
}

// ─── Input field ──────────────────────────────────────────────

function Field({
  label, type = 'text', value, onChange, children, ...rest
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  children?: React.ReactNode
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', color: '#8B9BB4', fontWeight: 500 }}>{label}</label>
      {children ?? (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          {...rest}
          style={{
            background: '#131929', border: '1px solid #1E2D45', borderRadius: '10px',
            padding: '11px 14px', color: '#F0F4FF', fontSize: '14px', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#2A3D55' }}
          onBlur={e  => { e.currentTarget.style.borderColor = '#1E2D45' }}
        />
      )}
    </div>
  )
}

// ─── Preview card ─────────────────────────────────────────────

function PreviewCard({
  avatarUrl, name, country, joinedAt, totalSessions,
}: {
  avatarUrl: string; name: string; country: string; joinedAt: string; totalSessions: number
}) {
  const flag = COUNTRY_FLAGS[country] ?? '🌍'

  return (
    <div style={{
      background: '#0D1221', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '16px',
      padding: '28px 24px', textAlign: 'center', position: 'sticky', top: '84px',
    }}>
      <p style={{ color: '#8B9BB4', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px' }}>
        Profile Preview
      </p>
      <img
        src={avatarUrl || 'https://i.pravatar.cc/150?img=5'}
        alt={name}
        style={{
          width: '80px', height: '80px', borderRadius: '50%',
          border: '2px solid rgba(201,168,76,0.4)', margin: '0 auto 14px', display: 'block',
          objectFit: 'cover',
        }}
      />
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 4px' }}>
        {name || 'Your Name'}
      </p>
      <p style={{ fontSize: '13px', color: '#8B9BB4', margin: '0 0 12px' }}>
        {flag} {country || 'Country'}
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, color: '#F0F4FF', fontSize: '18px', margin: 0 }}>{totalSessions}</p>
          <p style={{ color: '#4B5563', fontSize: '11px', margin: 0 }}>Sessions</p>
        </div>
        <div style={{ width: '1px', background: '#1E2D45' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, color: '#F0F4FF', fontSize: '18px', margin: 0 }}>
            {format(new Date(joinedAt), 'yyyy')}
          </p>
          <p style={{ color: '#4B5563', fontSize: '11px', margin: 0 }}>Member since</p>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)',
        borderRadius: '20px', padding: '5px 14px',
      }}>
        <LayoutGrid size={12} style={{ color: '#2DD4BF' }} />
        <span style={{ fontSize: '11px', color: '#2DD4BF', fontWeight: 600 }}>Verified Client</span>
      </div>
    </div>
  )
}

// ─── Profile Settings page ────────────────────────────────────

export default function ProfileSettings() {
  const { user } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)

  // Form state (pre-filled)
  const [avatarUrl, setAvatarUrl]       = useState(user?.avatar ?? CLIENT_DATA.avatar)
  const [name, setName]                 = useState(user?.fullName ?? CLIENT_DATA.fullName)
  const [email, setEmail]               = useState(CLIENT_DATA.email)
  const [phone, setPhone]               = useState(CLIENT_DATA.phone)
  const [country, setCountry]           = useState(CLIENT_DATA.country)
  const [dob, setDob]                   = useState('')

  // Password change
  const [currentPw, setCurrentPw]       = useState('')
  const [newPw, setNewPw]               = useState('')
  const [confirmPw, setConfirmPw]       = useState('')
  const [showNewPw, setShowNewPw]       = useState(false)
  const [pwLoading, setPwLoading]       = useState(false)

  // Communication prefs
  const [prefs, setPrefs] = useState({
    advisorOnline:    true,
    sessionReminders: true,
    promos:           false,
    sms:              false,
  })

  // Save
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState({ msg: '', visible: false })

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setAvatarUrl(URL.createObjectURL(file))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    showToast('Profile updated successfully ✨')
  }

  async function handleUpdatePassword() {
    if (!currentPw || !newPw || newPw !== confirmPw) return
    setPwLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setPwLoading(false)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    showToast('Password updated successfully')
  }

  const strength = passwordStrength(newPw)

  return (
    <form onSubmit={handleSave}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '32px', alignItems: 'start' }} className="profile-grid">

        {/* ── Left: form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Page heading */}
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 4px' }}>
              Profile Settings
            </h1>
            <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>Manage your personal information</p>
          </div>

          {/* Profile photo */}
          <section style={{ background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '14px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#F0F4FF', margin: '0 0 16px' }}>
              Profile Photo
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <img
                src={avatarUrl}
                alt={name}
                style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid rgba(201,168,76,0.4)', objectFit: 'cover' }}
              />
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'transparent', border: '1px solid rgba(201,168,76,0.5)',
                    color: '#C9A84C', borderRadius: '8px', padding: '8px 16px',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Camera size={14} /> Upload New Photo
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarUrl('https://i.pravatar.cc/150?img=5')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'none', border: 'none', color: '#4B5563',
                    fontSize: '13px', cursor: 'pointer',
                  }}
                >
                  <Trash2 size={13} /> Remove Photo
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
            </div>
          </section>

          {/* Personal info */}
          <section style={{ background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '14px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#F0F4FF', margin: '0 0 20px' }}>
              Personal Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Field label="Full Name"       value={name}  onChange={setName}  />
              <Field label="Email Address"   type="email"  value={email}  onChange={setEmail}  />
              <Field label="Phone Number"    type="tel"    value={phone}  onChange={setPhone}  />
              <Field label="Date of Birth"   type="date"   value={dob}    onChange={setDob}
                style={{ colorScheme: 'dark' } as React.CSSProperties}
              />
              <Field label="Country" value={country} onChange={setCountry}>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  style={{
                    background: '#131929', border: '1px solid #1E2D45', borderRadius: '10px',
                    padding: '11px 14px', color: '#F0F4FF', fontSize: '14px', outline: 'none', cursor: 'pointer',
                  }}
                >
                  {COUNTRIES.map(c => <option key={c} value={c}>{COUNTRY_FLAGS[c]} {c}</option>)}
                </select>
              </Field>
            </div>
          </section>

          {/* Change password */}
          <section style={{ background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '14px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#F0F4FF', margin: '0 0 20px' }}>
              Change Password
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Field label="Current Password" type="password" value={currentPw} onChange={setCurrentPw} />

              <div>
                <label style={{ fontSize: '12px', color: '#8B9BB4', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="8+ characters"
                    style={{
                      width: '100%', background: '#131929', border: '1px solid #1E2D45', borderRadius: '10px',
                      padding: '11px 44px 11px 14px', color: '#F0F4FF', fontSize: '14px', outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(v => !v)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4',
                    }}
                  >
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {newPw && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: '3px', borderRadius: '2px', transition: 'background 0.3s',
                          background: i <= strength.level ? strength.color : '#1E2D45',
                        }} />
                      ))}
                    </div>
                    {strength.label && (
                      <p style={{ color: strength.color, fontSize: '11px', marginTop: '3px' }}>{strength.label}</p>
                    )}
                  </div>
                )}
              </div>

              <Field label="Confirm New Password" type="password" value={confirmPw} onChange={setConfirmPw} />

              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={!currentPw || !newPw || newPw !== confirmPw || pwLoading}
                style={{
                  alignSelf: 'flex-start',
                  background: currentPw && newPw && newPw === confirmPw && !pwLoading ? '#C9A84C' : '#1E2D45',
                  color: currentPw && newPw && newPw === confirmPw && !pwLoading ? '#0B0F1A' : '#4B5563',
                  border: 'none', borderRadius: '10px', padding: '10px 20px',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                {pwLoading ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </section>

          {/* Communication prefs */}
          <section style={{ background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '14px', padding: '24px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#F0F4FF', margin: '0 0 20px' }}>
              Communication Preferences
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {([
                { key: 'advisorOnline',    label: 'Email me when an advisor I follow comes online'  },
                { key: 'sessionReminders', label: 'Email me session reminders'                       },
                { key: 'promos',           label: 'Receive promotional offers'                       },
                { key: 'sms',             label: 'SMS notifications'                                },
              ] as const).map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <span style={{ fontSize: '13px', color: '#8B9BB4', lineHeight: 1.5 }}>{item.label}</span>
                  <Toggle
                    on={prefs[item.key]}
                    onChange={v => setPrefs(p => ({ ...p, [item.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%', height: '50px', borderRadius: '12px', border: 'none',
              background: saving ? '#1E2D45' : '#C9A84C',
              color: saving ? '#4B5563' : '#0B0F1A',
              fontSize: '15px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {/* ── Right: preview card ── */}
        <div className="profile-preview">
          <PreviewCard
            avatarUrl={avatarUrl}
            name={name}
            country={country}
            joinedAt={CLIENT_DATA.joinedAt}
            totalSessions={CLIENT_DATA.totalSessions}
          />
        </div>
      </div>

      {/* Responsive: stack on small screens */}
      <style>{`
        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr !important; }
          .profile-preview { display: none; }
        }
      `}</style>

      <Toast message={toast.msg} visible={toast.visible} />
    </form>
  )
}
