// ============================================================
// WhiteStellar — Super Admin: Platform Settings
// src/pages/admin/Settings.tsx
// ============================================================

import { useState } from 'react'
import { Check, AlertTriangle, X } from 'lucide-react'
import Toast from '../../components/Toast'

// ─── Toggle switch ────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: '40px', height: '22px', borderRadius: '11px', cursor: 'pointer',
      background: on ? '#C9A84C' : '#1A2235', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: '3px', left: on ? '21px' : '3px',
        width: '16px', height: '16px', borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
      }} />
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
      <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: '0 0 20px', fontSize: '15px' }}>{title}</h3>
      {children}
    </div>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '12px 0', borderBottom: '1px solid #1A2235' }}>
      <div>
        <p style={{ color: '#F0F4FF', fontSize: '14px', margin: '0 0 2px' }}>{label}</p>
        {description && <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>{description}</p>}
      </div>
      {children}
    </div>
  )
}

function NumberInput({ value, onChange, suffix, min = 0, max = 100, step = 1 }: {
  value: number; onChange: (v: number) => void; suffix?: string; min?: number; max?: number; step?: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width: '70px', background: '#1A2540', border: '1px solid #1A2235',
          borderRadius: '8px', padding: '7px 10px', color: '#F0F4FF', fontSize: '14px',
          outline: 'none', textAlign: 'right',
        }}
      />
      {suffix && <span style={{ color: '#8B9BB4', fontSize: '13px' }}>{suffix}</span>}
    </div>
  )
}

// ─── Reset confirm modal ──────────────────────────────────────

function ResetModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const [typed, setTyped] = useState('')
  const confirmed = typed === 'RESET'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#0D1221', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} color="#EF4444" />
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4' }}>
            <X size={18} />
          </button>
        </div>
        <h3 style={{ color: '#EF4444', fontWeight: 700, margin: '0 0 8px' }}>Reset Demo Data</h3>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 16px', lineHeight: 1.6 }}>
          This will reset all platform data to its original demo state. <strong style={{ color: '#F0F4FF' }}>This cannot be undone.</strong>
        </p>
        <p style={{ color: '#8B9BB4', fontSize: '13px', margin: '0 0 8px' }}>
          Type <strong style={{ color: '#EF4444' }}>RESET</strong> to confirm:
        </p>
        <input
          value={typed}
          onChange={e => setTyped(e.target.value)}
          placeholder="RESET"
          style={{
            width: '100%', background: '#1A2540', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '10px 14px', color: '#F0F4FF', fontSize: '14px',
            outline: 'none', marginBottom: '16px', boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #1A2235', background: '#1A2540', color: '#8B9BB4', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          <button onClick={onConfirm} disabled={!confirmed} style={{
            flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
            background: confirmed ? '#EF4444' : '#4B5563', color: '#fff',
            fontWeight: 700, cursor: confirmed ? 'pointer' : 'default', fontSize: '14px',
          }}>Reset All Data</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function AdminSettings() {
  // Commission & Pricing
  const [commission, setCommission] = useState(30)
  const [minChat, setMinChat] = useState(1.99)
  const [minAudio, setMinAudio] = useState(1.99)
  const [minVideo, setMinVideo] = useState(1.99)
  const [freeMinutes, setFreeMinutes] = useState(3)
  const [newClientDiscount, setNewClientDiscount] = useState(80)
  const [pricingSaved, setPricingSaved] = useState(false)

  // Email toggles
  const [emailToggles, setEmailToggles] = useState({
    welcomeClient:    true,
    welcomeAdvisor:   true,
    rejectionReason:  true,
    adminNewApp:      true,
    adminFlaggedReview: false,
    sessionReceipt:   true,
  })

  // Maintenance
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [showReset, setShowReset] = useState(false)

  const [toast, setToast] = useState({ msg: '', visible: false })

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  function handlePricingSave() {
    setPricingSaved(true)
    showToast('Pricing settings updated ✨')
    setTimeout(() => setPricingSaved(false), 2500)
  }

  function toggleEmail(key: keyof typeof emailToggles) {
    setEmailToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const saveBtn = (saved: boolean, onClick: () => void, label = 'Save Settings') => (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      background: saved ? '#22C55E' : 'linear-gradient(135deg,#C9A84C,#E8C96D)',
      border: 'none', color: saved ? '#fff' : '#0B0F1A',
      fontWeight: 700, padding: '10px 24px', borderRadius: '10px',
      cursor: 'pointer', fontSize: '14px', marginTop: '16px',
    }}>
      {saved ? <><Check size={14} /> Saved!</> : label}
    </button>
  )

  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>Platform Settings</h1>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>Configure global platform behavior and policies.</p>
      </div>

      {/* Commission & Pricing */}
      <Section title="Commission & Pricing">
        <SettingRow label="Platform Commission Rate" description="Percentage taken from each session">
          <NumberInput value={commission} onChange={setCommission} suffix="%" min={0} max={100} />
        </SettingRow>
        <SettingRow label="Minimum Chat Session Price" description="Per minute, in USD">
          <NumberInput value={minChat} onChange={setMinChat} suffix="$/min" min={0.5} max={50} step={0.5} />
        </SettingRow>
        <SettingRow label="Minimum Audio Session Price" description="Per minute, in USD">
          <NumberInput value={minAudio} onChange={setMinAudio} suffix="$/min" min={0.5} max={50} step={0.5} />
        </SettingRow>
        <SettingRow label="Minimum Video Session Price" description="Per minute, in USD">
          <NumberInput value={minVideo} onChange={setMinVideo} suffix="$/min" min={0.5} max={50} step={0.5} />
        </SettingRow>
        <SettingRow label="Free Minutes for New Clients" description="Complimentary minutes on first session">
          <NumberInput value={freeMinutes} onChange={setFreeMinutes} suffix="min" min={0} max={30} />
        </SettingRow>
        <SettingRow label="New Client Discount" description="Discount applied to new client's first session">
          <NumberInput value={newClientDiscount} onChange={setNewClientDiscount} suffix="%" min={0} max={100} />
        </SettingRow>
        {saveBtn(pricingSaved, handlePricingSave, 'Save Pricing Settings')}
      </Section>

      {/* Email Notifications */}
      <Section title="Email Notifications">
        {[
          { key: 'welcomeClient',    label: 'Send welcome email to new clients'        },
          { key: 'welcomeAdvisor',   label: 'Send welcome email to approved advisors'  },
          { key: 'rejectionReason',  label: 'Send rejection email with reason'         },
          { key: 'adminNewApp',      label: 'Notify admin on new advisor application'  },
          { key: 'adminFlaggedReview', label: 'Notify admin on flagged review'         },
          { key: 'sessionReceipt',   label: 'Send session receipt to clients'          },
        ].map(({ key, label }) => (
          <SettingRow key={key} label={label}>
            <Toggle on={emailToggles[key as keyof typeof emailToggles]} onChange={() => toggleEmail(key as keyof typeof emailToggles)} />
          </SettingRow>
        ))}
      </Section>

      {/* Maintenance */}
      <Section title="Platform Maintenance">
        <div style={{ background: maintenanceMode ? 'rgba(239,68,68,0.06)' : 'transparent', border: maintenanceMode ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent', borderRadius: '10px', padding: maintenanceMode ? '12px' : '0', marginBottom: '16px', transition: 'all 0.2s' }}>
          <SettingRow label="Maintenance Mode" description={maintenanceMode ? '⚠️ Platform is currently OFFLINE for all users' : 'Take the platform offline for all users'}>
            <Toggle on={maintenanceMode} onChange={v => { setMaintenanceMode(v); if (v) showToast('⚠️ Maintenance mode enabled!') }} />
          </SettingRow>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => showToast('Cache cleared ✨')} style={{
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
            color: '#C9A84C', borderRadius: '10px', padding: '9px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          }}>
            Clear Platform Cache
          </button>
          <button style={{
            background: '#1A2540', border: '1px solid #1A2235',
            color: '#8B9BB4', borderRadius: '10px', padding: '9px 18px', cursor: 'pointer', fontSize: '13px',
          }}>
            Download Error Logs
          </button>
        </div>
      </Section>

      {/* Danger Zone */}
      <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ color: '#EF4444', fontWeight: 600, margin: '0 0 6px', fontSize: '15px' }}>Danger Zone</h3>
        <p style={{ color: '#8B9BB4', fontSize: '13px', margin: '0 0 20px' }}>Irreversible actions. Proceed with extreme caution.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowReset(true)} style={{
            background: 'none', border: '1px solid rgba(239,68,68,0.4)',
            color: '#EF4444', borderRadius: '10px', padding: '9px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          }}>
            Reset All Demo Data
          </button>
          <button style={{
            background: 'none', border: '1px solid rgba(201,168,76,0.4)',
            color: '#C9A84C', borderRadius: '10px', padding: '9px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
          }}>
            Export All Platform Data
          </button>
        </div>
      </div>

      {showReset && (
        <ResetModal
          onClose={() => setShowReset(false)}
          onConfirm={() => { setShowReset(false); showToast('Demo data reset ✓') }}
        />
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}
