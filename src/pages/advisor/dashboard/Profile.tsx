// ============================================================
// WhiteStellar — Advisor Dashboard: My Profile
// src/pages/advisor/dashboard/Profile.tsx
// ============================================================

import { useState, useRef, useEffect } from 'react'
import {
  Camera, Eye, EyeOff, Save, Star, Check,
  MessageCircle, Phone, Video,
} from 'lucide-react'
import { ADVISORS, CATEGORIES, SPECIALIZATIONS, SKILLS_AND_METHODS, LANGUAGES } from '../../../data/advisors'
import { useAuthStore } from '../../../store/authStore'
import {
  getAdvisorByUserId, getAdvisorJunctions, saveAdvisorProfile,
} from '../../../lib/api/advisorProfile'

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

// ─── Cover photo presets ──────────────────────────────────────

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80',
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&q=80',
  'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
  'https://images.unsplash.com/photo-1476611317561-60117649dd94?w=800&q=80',
  'https://images.unsplash.com/photo-1547327132-4f40c26ca29b?w=800&q=80',
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80',
  'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80',
]

// ─── Avatar crop modal ────────────────────────────────────────

function AvatarCropModal({ src, onConfirm, onClose }: {
  src: string
  onConfirm: (dataUrl: string) => void
  onClose: () => void
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  function onMouseDown(e: React.MouseEvent) {
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setOffset(o => ({ x: o.x + dx, y: o.y + dy }))
  }
  function onMouseUp() { dragging.current = false }

  function confirm() {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 200
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      ctx.beginPath()
      ctx.arc(100, 100, 100, 0, Math.PI * 2)
      ctx.clip()
      const iw = img.naturalWidth * scale
      const ih = img.naturalHeight * scale
      ctx.drawImage(img, 100 + offset.x - iw / 2, 100 + offset.y - ih / 2, iw, ih)
      onConfirm(canvas.toDataURL('image/jpeg', 0.92))
    }
    img.src = src
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000,
    }}>
      <div style={{
        background: '#131929', border: '1px solid #1E2D45',
        borderRadius: '20px', padding: '28px', width: '300px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
      }}>
        <div>
          <h3 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '16px', margin: '0 0 4px', textAlign: 'center' }}>
            Crop Profile Photo
          </h3>
          <p style={{ color: '#8B9BB4', fontSize: '12px', margin: 0, textAlign: 'center' }}>
            Drag to position · slider to zoom
          </p>
        </div>

        {/* Crop circle */}
        <div
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{
            width: '200px', height: '200px', borderRadius: '50%',
            overflow: 'hidden', border: '3px solid #C9A84C',
            cursor: 'grab', position: 'relative', background: '#0B0F1A', flexShrink: 0,
          }}
        >
          <img
            src={src}
            draggable={false}
            style={{
              position: 'absolute',
              left: `calc(50% + ${offset.x}px)`,
              top: `calc(50% + ${offset.y}px)`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              transformOrigin: 'center center',
              maxWidth: 'none',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Zoom */}
        <div style={{ width: '100%' }}>
          <label style={{ color: '#8B9BB4', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
            Zoom: {scale.toFixed(1)}×
          </label>
          <input
            type="range" min={0.5} max={3} step={0.05}
            value={scale}
            onChange={e => setScale(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#C9A84C' }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid #1E2D45',
              color: '#8B9BB4', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              background: 'linear-gradient(135deg,#C9A84C,#E8C96D)',
              border: 'none', color: '#0B0F1A',
              cursor: 'pointer', fontSize: '14px', fontWeight: 700,
            }}
          >
            Apply
          </button>
        </div>
      </div>
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
  const { user } = useAuthStore()
  const isDevMode = !user || user.id.startsWith('dev-')
  const mockAdvisor = ADVISORS.find(a => a.id === 1)!

  const avatarRef = useRef<HTMLInputElement>(null)
  const bgRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(!isDevMode)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState('')

  // Use mock defaults (overridden for real users after fetch)
  const [avatarSrc, setAvatarSrc] = useState(isDevMode ? mockAdvisor.avatar : '')
  const [bgSrc, setBgSrc] = useState(isDevMode ? mockAdvisor.backgroundImage : '')
  const [name, setName] = useState(isDevMode ? mockAdvisor.fullName : (user?.fullName ?? ''))
  const [shortBio, setShortBio] = useState(isDevMode ? mockAdvisor.shortBio : '')
  const [longBio, setLongBio] = useState(isDevMode ? mockAdvisor.longBio : '')
  const [pricing, setPricing] = useState<Pricing>(isDevMode ? { ...mockAdvisor.pricing } : { chat: null, audio: null, video: null })
  const [enabledTypes, setEnabledTypes] = useState<string[]>(isDevMode ? mockAdvisor.sessionTypes : [])
  const [selectedCats, setSelectedCats] = useState<number[]>(isDevMode ? mockAdvisor.categories.map(c => c.id) : [])
  const [selectedSpecs, setSelectedSpecs] = useState<number[]>(isDevMode ? mockAdvisor.specializations.map(s => s.id) : [])
  const [selectedSkills, setSelectedSkills] = useState<number[]>(isDevMode ? mockAdvisor.skillsAndMethods.map(s => s.id) : [])
  const [selectedLangs, setSelectedLangs] = useState<number[]>(isDevMode ? mockAdvisor.languages.map(l => l.id) : [])

  // Load real advisor data from Supabase
  useEffect(() => {
    if (isDevMode || !user) return
    async function load() {
      setLoading(true)
      try {
        const record = await getAdvisorByUserId(user!.id)
        if (record) {
          setName(record.full_name ?? user!.fullName ?? '')
          setShortBio(record.short_bio ?? '')
          setLongBio(record.long_bio ?? '')
          setAvatarSrc(record.avatar ?? '')
          setBgSrc(record.background_image ?? '')
          setPricing({ chat: record.chat_price, audio: record.audio_price, video: record.video_price })
          const types: string[] = []
          if (record.chat_price) types.push('chat')
          if (record.audio_price) types.push('audio')
          if (record.video_price) types.push('video')
          setEnabledTypes(types)
          const junctions = await getAdvisorJunctions(record.id)
          setSelectedCats(junctions.categoryIds)
          setSelectedSpecs(junctions.specializationIds)
          setSelectedSkills(junctions.skillIds)
          setSelectedLangs(junctions.languageIds)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isDevMode, user])

  function pickImage(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (s: string) => void,
    forAvatar = false,
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (file.size > 300 * 1024) {
      setPhotoError(`"${file.name}" is ${(file.size / 1024).toFixed(0)} KB — please choose a photo under 300 KB.`)
      return
    }
    setPhotoError('')
    if (forAvatar) {
      // Route through crop modal — crop modal returns data URL via canvas
      const url = URL.createObjectURL(file)
      setCropSrc(url)
    } else {
      // Convert to data URL so it persists to Supabase (blob:// URLs are session-only)
      const reader = new FileReader()
      reader.onload = ev => { if (ev.target?.result) setter(ev.target.result as string) }
      reader.readAsDataURL(file)
    }
  }

  function toggleType(type: string) {
    setEnabledTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
    // Clear price when disabled
    if (enabledTypes.includes(type)) {
      setPricing(p => ({ ...p, [type]: null }))
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    setProgress(10)
    try {
      if (isDevMode) {
        await new Promise(r => setTimeout(r, 300))
        setProgress(60)
        await new Promise(r => setTimeout(r, 400))
        setProgress(100)
      } else {
        setProgress(30)
        await saveAdvisorProfile(user!.id, {
          fullName: name,
          shortBio,
          longBio,
          chatPrice: enabledTypes.includes('chat') ? (pricing.chat ?? 1.99) : null,
          audioPrice: enabledTypes.includes('audio') ? (pricing.audio ?? 2.99) : null,
          videoPrice: enabledTypes.includes('video') ? (pricing.video ?? 3.99) : null,
          categoryIds: selectedCats,
          specializationIds: selectedSpecs,
          skillIds: selectedSkills,
          languageIds: selectedLangs,
          avatar: avatarSrc || undefined,
          backgroundImage: bgSrc || undefined,
        })
        setProgress(100)
        // Sync updated avatar into authStore so Navbar/sidebar reflect the new photo immediately
        if (avatarSrc) {
          useAuthStore.setState(s => s.user ? { user: { ...s.user, avatar: avatarSrc } } : {})
        }
      }
      setSaved(true)
      setTimeout(() => { setSaved(false); setProgress(0) }, 2500)
    } catch (err) {
      console.error('Failed to save profile:', err)
      const msg = (err as { message?: string })?.message ?? 'Save failed. Please try again.'
      setSaveError(msg.includes('row-level security')
        ? 'Permission denied. Please contact support if this persists.'
        : msg)
      setProgress(0)
    } finally {
      setSaving(false)
    }
  }

  const displayAdvisor = isDevMode ? mockAdvisor : null
  const catNames = CATEGORIES
    .filter(c => selectedCats.includes(c.id))
    .map(c => c.title)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <p style={{ color: '#8B9BB4', fontSize: '14px' }}>Loading your profile...</p>
      </div>
    )
  }

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

            {/* Photo size warning */}
            {photoError && (
              <div style={{
                background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)',
                borderRadius: '10px', padding: '10px 14px', marginBottom: '14px',
                display: 'flex', alignItems: 'flex-start', gap: '8px',
              }}>
                <span style={{ color: '#EAB308', fontSize: '16px', lineHeight: 1 }}>⚠</span>
                <p style={{ color: '#EAB308', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{photoError}</p>
              </div>
            )}

            {/* Cover photo */}
            <div style={{ marginBottom: '22px' }}>
              <p style={{ color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                Cover Photo
              </p>

              {/* Current cover preview */}
              {bgSrc && (
                <div style={{ height: '70px', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px', border: '1px solid #1E2D45' }}>
                  <img src={bgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              {/* Preset gallery */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
                {COVER_PRESETS.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => { setBgSrc(url); setPhotoError('') }}
                    style={{
                      height: '50px', borderRadius: '7px', overflow: 'hidden',
                      cursor: 'pointer',
                      border: `2px solid ${bgSrc === url ? '#C9A84C' : 'transparent'}`,
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <img src={url} alt={`Preset ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>

              {/* Custom upload */}
              <button
                onClick={() => bgRef.current?.click()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid #1E2D45',
                  color: '#8B9BB4', borderRadius: '8px', padding: '7px 14px',
                  cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                }}
              >
                <Camera size={13} /> Upload Custom (max 300 KB)
              </button>
              <input ref={bgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => pickImage(e, setBgSrc)} />
            </div>

            {/* Profile photo */}
            <div>
              <p style={{ color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>
                Profile Photo
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => avatarRef.current?.click()}>
                  <img
                    src={avatarSrc || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'A')}&background=1E2D45&color=C9A84C`}
                    alt=""
                    style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #C9A84C' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Camera size={16} color="#fff" />
                  </div>
                  <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => pickImage(e, setAvatarSrc, true)} />
                </div>
                <div>
                  <p style={{ color: '#F0F4FF', fontSize: '14px', fontWeight: 600, margin: '0 0 2px' }}>Profile Photo</p>
                  <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>Click to select · max 300 KB · drag to crop</p>
                </div>
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

          {/* Progress bar */}
          {(saving || saved) && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ color: saved ? '#22C55E' : '#8B9BB4', fontSize: '12px', fontWeight: 600 }}>
                  {saved ? 'Profile saved successfully!' : 'Saving your profile…'}
                </span>
                <span style={{ color: saved ? '#22C55E' : '#C9A84C', fontSize: '12px', fontWeight: 700 }}>
                  {progress}%
                </span>
              </div>
              <div style={{ height: '4px', background: '#1E2D45', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: saved ? '#22C55E' : 'linear-gradient(90deg,#C9A84C,#E8C96D)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          )}

          {/* Save error */}
          {saveError && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px', padding: '10px 14px', marginBottom: '12px',
              display: 'flex', alignItems: 'flex-start', gap: '8px',
            }}>
              <span style={{ color: '#EF4444', fontSize: '18px', lineHeight: 1 }}>⚠</span>
              <p style={{ color: '#EF4444', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{saveError}</p>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: saved
                ? '#22C55E'
                : saving ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg,#C9A84C,#E8C96D)',
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
              avatar={avatarSrc || 'https://i.pravatar.cc/150?img=47'}
              bgImage={bgSrc || 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800'}
              name={name}
              bio={shortBio}
              rating={displayAdvisor?.rating ?? 0}
              reviewCount={displayAdvisor?.reviewCount ?? 0}
              pricing={pricing}
              enabledTypes={enabledTypes}
              cats={catNames}
            />
          </div>
        )}
      </div>

      {/* Avatar crop modal */}
      {cropSrc && (
        <AvatarCropModal
          src={cropSrc}
          onConfirm={dataUrl => {
            setAvatarSrc(dataUrl)
            setCropSrc(null)
            // Update authStore immediately so Navbar + sidebar reflect the photo right away
            useAuthStore.setState(s => s.user ? { user: { ...s.user, avatar: dataUrl } } : {})
          }}
          onClose={() => setCropSrc(null)}
        />
      )}
    </div>
  )
}
