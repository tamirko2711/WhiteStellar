// ============================================================
// WhiteStellar — Super Admin: Hero Banners
// src/pages/admin/Banners.tsx
// ============================================================

import { useState } from 'react'
import { Plus, Edit2, Trash2, X, GripVertical } from 'lucide-react'
import { HERO_BANNERS, type HeroBanner } from '../../data/advisors'
import Toast from '../../components/Toast'

// ─── Toggle switch ────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: '38px', height: '21px', borderRadius: '11px', cursor: 'pointer',
      background: on ? '#C9A84C' : '#1A2235', position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: '2.5px', left: on ? '19px' : '2.5px',
        width: '16px', height: '16px', borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
      }} />
    </div>
  )
}

// ─── Banner edit modal ────────────────────────────────────────

function BannerModal({
  initial, onSave, onClose,
}: { initial?: Partial<HeroBanner>; onSave: (b: Partial<HeroBanner>) => void; onClose: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '')
  const [ctaText, setCtaText] = useState(initial?.ctaText ?? '')
  const [ctaUrl, setCtaUrl] = useState(initial?.ctaUrl ?? '')
  const [bgImage, setBgImage] = useState(initial?.backgroundImage ?? '')
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', padding: '28px', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#F0F4FF', fontWeight: 700, margin: 0, fontSize: '17px' }}>
            {initial?.title ? 'Edit Banner' : 'Add New Banner'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4' }}>
            <X size={18} />
          </button>
        </div>

        {/* Preview */}
        {bgImage && (
          <div style={{ position: 'relative', height: '120px', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
            <img src={bgImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px' }}>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '18px', margin: 0 }}>{title || 'Banner Title'}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: 0 }}>{subtitle || 'Subtitle'}</p>
            </div>
          </div>
        )}

        {[
          { label: 'Title', value: title, set: setTitle, placeholder: 'e.g. Find Your Clarity' },
          { label: 'Subtitle', value: subtitle, set: setSubtitle, placeholder: 'e.g. Connect with world-class advisors' },
          { label: 'CTA Button Text', value: ctaText, set: setCtaText, placeholder: 'e.g. Explore Advisors' },
          { label: 'CTA URL', value: ctaUrl, set: setCtaUrl, placeholder: '/category/psychic-readings' },
          { label: 'Background Image URL', value: bgImage, set: setBgImage, placeholder: 'https://images.unsplash.com/…' },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{f.label}</label>
            <input
              value={f.value}
              onChange={e => f.set(e.target.value)}
              placeholder={f.placeholder}
              style={{ width: '100%', background: '#1A2540', border: '1px solid #1A2235', borderRadius: '10px', padding: '10px 14px', color: '#F0F4FF', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Toggle on={isActive} onChange={setIsActive} />
          <span style={{ color: '#F0F4FF', fontSize: '14px' }}>Banner is active</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #1A2235', background: '#1A2540', color: '#8B9BB4', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          <button
            onClick={() => onSave({ title, subtitle, ctaText, ctaUrl, backgroundImage: bgImage, isActive })}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg,#C9A84C,#E8C96D)', color: '#0B0F1A', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}
          >
            {initial?.title ? 'Save Changes' : 'Add Banner'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function AdminBanners() {
  const [banners, setBanners] = useState(HERO_BANNERS)
  const [editTarget, setEditTarget] = useState<HeroBanner | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState({ msg: '', visible: false })

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  function handleSave(data: Partial<HeroBanner>) {
    if (editTarget) {
      setBanners(prev => prev.map(b => b.id === editTarget.id ? { ...b, ...data } : b))
      showToast('Banner updated ✨')
      setEditTarget(null)
    } else {
      setBanners(prev => [...prev, { id: Date.now(), slug: '', ...data } as HeroBanner])
      showToast('Banner added ✨')
      setShowAdd(false)
    }
  }

  function toggleActive(id: number) {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b))
  }

  function deleteBanner(id: number) {
    setBanners(prev => prev.filter(b => b.id !== id))
    showToast('Banner deleted.')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>Hero Banners</h1>
          <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>Manage homepage hero carousel banners.</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'linear-gradient(135deg,#C9A84C,#E8C96D)', border: 'none',
          color: '#0B0F1A', fontWeight: 700, padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
        }}>
          <Plus size={15} /> Add New Banner
        </button>
      </div>

      <div style={{
        background: '#0D1221', border: '1px solid #1A2235',
        borderRadius: '10px', padding: '10px 16px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <GripVertical size={14} color="#4B5563" />
        <p style={{ color: '#4B5563', fontSize: '12px', margin: 0 }}>
          Banners display in order shown. Drag to reorder. (Reorder UI coming soon)
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {banners.map(banner => (
          <div key={banner.id} style={{
            background: '#0D1221', border: `1px solid ${banner.isActive ? '#1A2235' : 'rgba(75,85,99,0.3)'}`,
            borderRadius: '16px', overflow: 'hidden', opacity: banner.isActive ? 1 : 0.6,
          }}>
            {/* Preview */}
            <div style={{ position: 'relative', height: '160px' }}>
              <img src={banner.backgroundImage} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '20px', margin: 0, textAlign: 'center' }}>{banner.title}</h2>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: 0, textAlign: 'center' }}>{banner.subtitle}</p>
                {banner.ctaText && (
                  <div style={{ marginTop: '8px', background: 'rgba(201,168,76,0.9)', color: '#0B0F1A', borderRadius: '8px', padding: '6px 18px', fontSize: '13px', fontWeight: 700 }}>
                    {banner.ctaText}
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Toggle on={banner.isActive} onChange={() => toggleActive(banner.id)} />
                <span style={{ color: banner.isActive ? '#22C55E' : '#4B5563', fontSize: '13px', fontWeight: 600 }}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setEditTarget(banner)} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
                  color: '#C9A84C', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                }}>
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => deleteBanner(banner.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  color: '#EF4444', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px',
                }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(editTarget || showAdd) && (
        <BannerModal
          initial={editTarget ?? undefined}
          onSave={handleSave}
          onClose={() => { setEditTarget(null); setShowAdd(false) }}
        />
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}
