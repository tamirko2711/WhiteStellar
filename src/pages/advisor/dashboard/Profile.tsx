// ============================================================
// WhiteStellar — Advisor Dashboard: My Profile
// src/pages/advisor/dashboard/Profile.tsx
// ============================================================

import { useState, useRef } from 'react'
import {
  Camera, Eye, EyeOff, Save, Star, Check,
  MessageCircle, Phone, Video,
} from 'lucide-react'
import { ADVISORS, CATEGORIES, SPECIALIZATIONS, SKILLS_AND_METHODS, LANGUAGES } from '../../../data/advisors'

// ─── Types ────────────────────────────────────────────────────

interface Pricing {
  chat: number | null
  audio: number | null
  video: number | null
}

// ─── Toggle switch ────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: '40px', height: '22px', borderRadius: '11px', cursor: 'pointer',
        background: on ? '#C9A84C' : '#1E2D45',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '3px', left: on ? '21px' : '3px',
        width: '16px', height: '16px', borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
      }} />
    </div>
  )
}

// ─── Multi-select pill box ────────────────────────────────────

function MultiSelect<T extends { id: number; title?: string; name?: string }>({
  label, options, selected, onChange, max,
}: {
  label: string
  options: T[]
  selected: number[]
  onChange: (ids: number[]) => void
  max?: number
}) {
  function toggle(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter(x => x !== id))
    } else {
      if (max && selected.length >= max) return
      onChange([...selected, id])
    }
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
        {label} {max ? <span style={{ color: '#4B5563', fontWeight: 400 }}>(max {max})</span> : null}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {options.map(opt => {
          const id = opt.id
          const display = (opt as { title?: string; name?: string }).title ?? (opt as { title?: string; name?: string }).name ?? ''
          const active = selected.includes(id)
          const disabled = !active && max !== undefined && selected.length >= max
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              disabled={disabled}
              style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', cursor: disabled ? 'default' : 'pointer',
                border: '1px solid',
                borderColor: active ? '#C9A84C' : '#1E2D45',
                background: active ? 'rgba(201,168,76,0.1)' : disabled ? 'rgba(255,255,255,0.01)' : '#0F1828',
                color: active ? '#C9A84C' : disabled ? '#4B5563' : '#8B9BB4',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {display}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Session type card ────────────────────────────────────────

function SessionTypeCard({
  icon, label, enabled, price, onToggle, onPrice,
}: {
  icon: React.ReactNode
  label: string
  enabled: boolean
  price: number | null
  onToggle: () => void
  onPrice: (v: number) => void
}) {
  return (
    <div style={{
      background: '#0F1828', border: `1px solid ${enabled ? 'rgba(201,168,76,0.3)' : '#1E2D45'}`,
      borderRadius: '14px', padding: '18px 20px', flex: '1 1 180px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: enabled ? 'rgba(201,168,76,0.12)' : '#1A2540',
            color: enabled ? '#C9A84C' : '#4B5563',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </div>
          <span style={{ color: '#F0F4FF', fontWeight: 600, fontSize: '14px' }}>{label}</span>
        </div>
        <Toggle on={enabled} onChange={onToggle} />
      </div>
      {enabled && (
        <div>
          <label style={{ color: '#4B5563', fontSize: '11px', display: 'block', marginBottom: '6px' }}>
            Rate per minute
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
              color: '#C9A84C', fontWeight: 700, fontSize: '15px',
            }}>$</span>
            <input
              type="number"
              min={0.5}
              max={50}
              step={0.5}
              value={price ?? ''}
              onChange={e => onPrice(parseFloat(e.target.value) || 0)}
              style={{
                width: '100%', background: '#1A2540', border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '8px', padding: '8px 8px 8px 24px',
                color: '#C9A84C', fontSize: '15px', fontWeight: 700, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      )}
      {!enabled && (
        <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>Disabled — clients can't book this type</p>
      )}
    </div>
  )
}

// ─── Preview card ─────────────────────────────────────────────

function PreviewCard({
  avatar, bgImage, name, bio, rating, reviewCount,
  pricing, enabledTypes, cats,
}: {
  avatar: string; bgImage: string; name: string; bio: string
  rating: number; reviewCount: number; pricing: Pricing
  enabledTypes: string[]; cats: string[]
}) {
  return (
    <div style={{
      background: '#0F1828', border: '1px solid #1E2D45',
      borderRadius: '16px', overflow: 'hidden', position: 'sticky', top: '80px',
    }}>
      {/* Banner */}
      <div style={{ position: 'relative', height: '100px' }}>
        <img src={bgImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
        {/* Avatar */}
        <img
          src={avatar}
          alt={name}
          style={{
            position: 'absolute', bottom: '-24px', left: '16px',
            width: '52px', height: '52px', borderRadius: '50%',
            border: '3px solid #C9A84C', objectFit: 'cover',
          }}
        />
      </div>

      <div style={{ padding: '30px 16px 16px' }}>
        <p style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '16px', margin: '0 0 2px' }}>{name}</p>
        <p style={{ color: '#8B9BB4', fontSize: '12px', margin: '0 0 8px', lineHeight: 1.5 }}>{bio}</p>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <Star size={13} fill="#C9A84C" color="#C9A84C" />
          <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '13px' }}>{rating.toFixed(1)}</span>
          <span style={{ color: '#4B5563', fontSize: '12px' }}>({reviewCount.toLocaleString()})</span>
        </div>

        {/* Cats */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
          {cats.map(c => (
            <span key={c} style={{
              background: '#1A2540', color: '#8B9BB4',
              borderRadius: '4px', padding: '2px 8px', fontSize: '11px',
            }}>
              {c}
            </span>
          ))}
        </div>

        {/* Pricing */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {enabledTypes.includes('chat') && pricing.chat && (
            <span style={{
              background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '6px', padding: '4px 8px', fontSize: '12px', fontWeight: 600,
            }}>
              💬 ${pricing.chat}/min
            </span>
          )}
          {enabledTypes.includes('audio') && pricing.audio && (
            <span style={{
              background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '6px', padding: '4px 8px', fontSize: '12px', fontWeight: 600,
            }}>
              📞 ${pricing.audio}/min
            </span>
          )}
          {enabledTypes.includes('video') && pricing.video && (
            <span style={{
              background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '6px', padding: '4px 8px', fontSize: '12px', fontWeight: 600,
            }}>
              🎥 ${pricing.video}/min
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────

export default function AdvisorProfile() {
  const advisor = ADVISORS.find(a => a.id === 1)!
  const avatarRef = useRef<HTMLInputElement>(null)
  const bgRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const [avatarSrc, setAvatarSrc] = useState(advisor.avatar)
  const [bgSrc, setBgSrc] = useState(advisor.backgroundImage)
  const [name, setName] = useState(advisor.fullName)
  const [shortBio, setShortBio] = useState(advisor.shortBio)
  const [longBio, setLongBio] = useState(advisor.longBio)
  const [pricing, setPricing] = useState<Pricing>({ ...advisor.pricing })
  const [enabledTypes, setEnabledTypes] = useState<string[]>(advisor.sessionTypes)
  const [selectedCats, setSelectedCats] = useState(advisor.categories.map(c => c.id))
  const [selectedSpecs, setSelectedSpecs] = useState(advisor.specializations.map(s => s.id))
  const [selectedSkills, setSelectedSkills] = useState(advisor.skillsAndMethods.map(s => s.id))
  const [selectedLangs, setSelectedLangs] = useState(advisor.languages.map(l => l.id))

  function pickImage(e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) {
    const file = e.target.files?.[0]
    if (file) setter(URL.createObjectURL(file))
  }

  function toggleType(type: string) {
    setEnabledTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }, 900)
  }

  const catNames = CATEGORIES
    .filter(c => selectedCats.includes(c.id))
    .map(c => c.title)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>
            My Profile
          </h1>
          <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>
            Edit your public listing as clients see it.
          </p>
        </div>
        <button
          onClick={() => setPreview(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: preview ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${preview ? 'rgba(201,168,76,0.3)' : '#1E2D45'}`,
            color: preview ? '#C9A84C' : '#8B9BB4',
            borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px',
          }}
        >
          {preview ? <EyeOff size={14} /> : <Eye size={14} />}
          {preview ? 'Hide Preview' : 'Preview as Client'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left — edit form */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Photo section */}
          <div style={{
            background: '#0F1828', border: '1px solid #1E2D45',
            borderRadius: '16px', padding: '24px', marginBottom: '20px',
          }}>
            <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: '0 0 18px', fontSize: '15px' }}>Photos</h3>

            {/* Background image */}
            <div style={{ position: 'relative', height: '110px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', cursor: 'pointer' }}
              onClick={() => bgRef.current?.click()}>
              <img src={bgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Camera size={16} color="#fff" />
                <span style={{ color: '#fff', fontSize: '13px' }}>Change Banner</span>
              </div>
              <input ref={bgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => pickImage(e, setBgSrc)} />
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => avatarRef.current?.click()}>
                <img src={avatarSrc} alt="" style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #C9A84C' }} />
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Camera size={16} color="#fff" />
                </div>
                <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => pickImage(e, setAvatarSrc)} />
              </div>
              <div>
                <p style={{ color: '#F0F4FF', fontSize: '14px', fontWeight: 600, margin: '0 0 2px' }}>Profile Photo</p>
                <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>Recommended: square, at least 200×200px</p>
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div style={{
            background: '#0F1828', border: '1px solid #1E2D45',
            borderRadius: '16px', padding: '24px', marginBottom: '20px',
          }}>
            <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: '0 0 18px', fontSize: '15px' }}>Basic Info</h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Display Name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%', background: '#1A2540', border: '1px solid #1E2D45',
                  borderRadius: '10px', padding: '10px 14px', color: '#F0F4FF',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Short Bio <span style={{ color: '#4B5563', fontWeight: 400 }}>(shown on listing cards)</span>
              </label>
              <textarea
                value={shortBio}
                onChange={e => setShortBio(e.target.value.slice(0, 120))}
                rows={2}
                style={{
                  width: '100%', background: '#1A2540', border: '1px solid #1E2D45',
                  borderRadius: '10px', padding: '10px 14px', color: '#F0F4FF',
                  fontSize: '14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <span style={{ color: '#4B5563', fontSize: '11px' }}>{shortBio.length}/120</span>
            </div>

            <div>
              <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Full Bio
              </label>
              <textarea
                value={longBio}
                onChange={e => setLongBio(e.target.value.slice(0, 1000))}
                rows={5}
                style={{
                  width: '100%', background: '#1A2540', border: '1px solid #1E2D45',
                  borderRadius: '10px', padding: '10px 14px', color: '#F0F4FF',
                  fontSize: '14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <span style={{ color: '#4B5563', fontSize: '11px' }}>{longBio.length}/1000</span>
            </div>
          </div>

          {/* Session types & pricing */}
          <div style={{
            background: '#0F1828', border: '1px solid #1E2D45',
            borderRadius: '16px', padding: '24px', marginBottom: '20px',
          }}>
            <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: '0 0 18px', fontSize: '15px' }}>
              Session Types & Pricing
            </h3>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <SessionTypeCard
                icon={<MessageCircle size={16} />}
                label="Chat"
                enabled={enabledTypes.includes('chat')}
                price={pricing.chat}
                onToggle={() => toggleType('chat')}
                onPrice={v => setPricing(p => ({ ...p, chat: v }))}
              />
              <SessionTypeCard
                icon={<Phone size={16} />}
                label="Audio"
                enabled={enabledTypes.includes('audio')}
                price={pricing.audio}
                onToggle={() => toggleType('audio')}
                onPrice={v => setPricing(p => ({ ...p, audio: v }))}
              />
              <SessionTypeCard
                icon={<Video size={16} />}
                label="Video"
                enabled={enabledTypes.includes('video')}
                price={pricing.video}
                onToggle={() => toggleType('video')}
                onPrice={v => setPricing(p => ({ ...p, video: v }))}
              />
            </div>
          </div>

          {/* Multi-selects */}
          <div style={{
            background: '#0F1828', border: '1px solid #1E2D45',
            borderRadius: '16px', padding: '24px', marginBottom: '24px',
          }}>
            <h3 style={{ color: '#F0F4FF', fontWeight: 600, margin: '0 0 18px', fontSize: '15px' }}>
              Expertise & Languages
            </h3>
            <MultiSelect
              label="Categories"
              options={CATEGORIES}
              selected={selectedCats}
              onChange={setSelectedCats}
              max={3}
            />
            <MultiSelect
              label="Specializations"
              options={SPECIALIZATIONS}
              selected={selectedSpecs}
              onChange={setSelectedSpecs}
              max={5}
            />
            <MultiSelect
              label="Skills & Methods"
              options={SKILLS_AND_METHODS}
              selected={selectedSkills}
              onChange={setSelectedSkills}
              max={6}
            />
            <MultiSelect
              label="Languages"
              options={LANGUAGES}
              selected={selectedLangs}
              onChange={setSelectedLangs}
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: saved
                ? '#22C55E'
                : saving ? '#4B5563' : 'linear-gradient(135deg,#C9A84C,#E8C96D)',
              border: 'none', color: saved ? '#fff' : '#0B0F1A',
              fontWeight: 700, padding: '13px 32px', borderRadius: '12px',
              cursor: saving ? 'wait' : 'pointer', fontSize: '15px',
              transition: 'all 0.2s',
            }}
          >
            {saved ? <><Check size={16} /> Saved!</> : saving ? 'Saving…' : <><Save size={16} /> Save Profile</>}
          </button>
        </div>

        {/* Right — preview */}
        {preview && (
          <div style={{ width: '260px', flexShrink: 0 }}>
            <p style={{ color: '#4B5563', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
              Client Preview
            </p>
            <PreviewCard
              avatar={avatarSrc}
              bgImage={bgSrc}
              name={name}
              bio={shortBio}
              rating={advisor.rating}
              reviewCount={advisor.reviewCount}
              pricing={pricing}
              enabledTypes={enabledTypes}
              cats={catNames}
            />
          </div>
        )}
      </div>
    </div>
  )
}
