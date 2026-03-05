// ============================================================
// WhiteStellar — Super Admin: Categories
// src/pages/admin/Categories.tsx
// ============================================================

import { useState } from 'react'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import {
  Eye, Heart, Layers, Star, Sparkles, Moon, Briefcase,
  Compass, Zap, Globe, Sun, Wind,
} from 'lucide-react'
import { CATEGORIES, type Category } from '../../data/advisors'
import Toast from '../../components/Toast'

// ─── Icon options ─────────────────────────────────────────────

const ICON_OPTIONS = [
  { name: 'Eye', Icon: Eye },
  { name: 'Heart', Icon: Heart },
  { name: 'Layers', Icon: Layers },
  { name: 'Star', Icon: Star },
  { name: 'Sparkles', Icon: Sparkles },
  { name: 'Moon', Icon: Moon },
  { name: 'Briefcase', Icon: Briefcase },
  { name: 'Compass', Icon: Compass },
  { name: 'Zap', Icon: Zap },
  { name: 'Globe', Icon: Globe },
  { name: 'Sun', Icon: Sun },
  { name: 'Wind', Icon: Wind },
]

function IconByName({ name, size = 32 }: { name: string; size?: number }) {
  const found = ICON_OPTIONS.find(o => o.name === name)
  if (!found) return <Star size={size} />
  const { Icon } = found
  return <Icon size={size} />
}

// ─── Category modal ───────────────────────────────────────────

function CategoryModal({
  initial, onSave, onClose,
}: {
  initial?: Partial<Category>
  onSave: (cat: Partial<Category>) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? 'Star')

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', padding: '28px', maxWidth: '500px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#F0F4FF', fontWeight: 700, margin: 0, fontSize: '17px' }}>
            {initial?.title ? 'Edit Category' : 'Add New Category'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B9BB4' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={{
            width: '100%', background: '#1A2540', border: '1px solid #1A2235', borderRadius: '10px',
            padding: '10px 14px', color: '#F0F4FF', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
          }} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{
            width: '100%', background: '#1A2540', border: '1px solid #1A2235', borderRadius: '10px',
            padding: '10px 14px', color: '#F0F4FF', fontSize: '14px', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
          }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#8B9BB4', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Icon</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {ICON_OPTIONS.map(({ name, Icon }) => (
              <button key={name} onClick={() => setIcon(name)} style={{
                width: '44px', height: '44px', borderRadius: '10px', cursor: 'pointer',
                border: `1px solid ${icon === name ? '#C9A84C' : '#1A2235'}`,
                background: icon === name ? 'rgba(201,168,76,0.1)' : '#1A2540',
                color: icon === name ? '#C9A84C' : '#4B5563',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #1A2235', background: '#1A2540', color: '#8B9BB4', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          <button
            onClick={() => onSave({ title, description, icon })}
            disabled={!title.trim()}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
              background: title.trim() ? 'linear-gradient(135deg,#C9A84C,#E8C96D)' : '#4B5563',
              color: '#0B0F1A', fontWeight: 700, cursor: title.trim() ? 'pointer' : 'default', fontSize: '14px',
            }}
          >
            {initial?.title ? 'Save Changes' : 'Add Category'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete confirm modal ─────────────────────────────────────

function DeleteModal({ category, onConfirm, onClose }: { category: Category; onConfirm: () => void; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#0D1221', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%' }}>
        <h3 style={{ color: '#EF4444', fontWeight: 700, margin: '0 0 8px' }}>Delete "{category.title}"?</h3>
        <p style={{ color: '#8B9BB4', fontSize: '14px', margin: '0 0 24px', lineHeight: 1.6 }}>
          Deleting this category will affect <strong style={{ color: '#F0F4FF' }}>{category.advisorCount} advisors</strong>. Are you sure?
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #1A2235', background: '#1A2540', color: '#8B9BB4', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#EF4444', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function AdminCategories() {
  const [categories, setCategories] = useState(CATEGORIES)
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState({ msg: '', visible: false })

  function showToast(msg: string) {
    setToast({ msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  function handleSave(data: Partial<Category>) {
    if (editTarget) {
      setCategories(prev => prev.map(c => c.id === editTarget.id ? { ...c, ...data } : c))
      showToast('Category updated ✨')
      setEditTarget(null)
    } else {
      const newCat: Category = {
        id: Date.now(),
        slug: (data.title ?? '').toLowerCase().replace(/\s+/g, '-'),
        title: data.title ?? '',
        description: data.description ?? '',
        icon: data.icon ?? 'Star',
        advisorCount: 0,
      }
      setCategories(prev => [...prev, newCat])
      showToast('Category created ✨')
      setShowAdd(false)
    }
  }

  function handleDelete(id: number) {
    setCategories(prev => prev.filter(c => c.id !== id))
    showToast('Category deleted.')
    setDeleteTarget(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '22px', margin: '0 0 4px' }}>Categories</h1>
          <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0 }}>Manage advisor listing categories.</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'linear-gradient(135deg,#C9A84C,#E8C96D)', border: 'none',
          color: '#0B0F1A', fontWeight: 700, padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
        }}>
          <Plus size={15} /> Add New Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ background: '#0D1221', border: '1px solid #1A2235', borderRadius: '16px', padding: '20px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '12px',
              background: 'rgba(201,168,76,0.1)', color: '#C9A84C',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
            }}>
              <IconByName name={cat.icon} size={26} />
            </div>
            <h3 style={{ color: '#F0F4FF', fontWeight: 700, fontSize: '15px', margin: '0 0 6px' }}>{cat.title}</h3>
            <p style={{ color: '#8B9BB4', fontSize: '13px', margin: '0 0 12px', lineHeight: 1.5 }}>{cat.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                background: '#1A2540', color: '#8B9BB4',
                borderRadius: '20px', padding: '3px 10px', fontSize: '12px',
              }}>
                {cat.advisorCount} advisors
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setEditTarget(cat)} style={{
                  background: 'none', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C',
                  borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <Edit2 size={11} /> Edit
                </button>
                <button onClick={() => setDeleteTarget(cat)} style={{
                  background: 'none', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444',
                  borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(editTarget || showAdd) && (
        <CategoryModal
          initial={editTarget ?? undefined}
          onSave={handleSave}
          onClose={() => { setEditTarget(null); setShowAdd(false) }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          category={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  )
}
