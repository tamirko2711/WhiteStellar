// ============================================================
// WhiteStellar — Avatar Crop Modal (shared)
// src/components/modals/AvatarCropModal.tsx
// ============================================================

import { useState, useRef } from 'react'

interface Props {
  src: string
  onConfirm: (dataUrl: string) => void
  onClose: () => void
}

export default function AvatarCropModal({ src, onConfirm, onClose }: Props) {
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

  // Touch support
  function onTouchStart(e: React.TouchEvent) {
    dragging.current = true
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!dragging.current) return
    const dx = e.touches[0].clientX - lastPos.current.x
    const dy = e.touches[0].clientY - lastPos.current.y
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    setOffset(o => ({ x: o.x + dx, y: o.y + dy }))
  }
  function onTouchEnd() { dragging.current = false }

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
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9000, padding: '20px',
    }}>
      <div style={{
        background: '#131929', border: '1px solid #1E2D45',
        borderRadius: '20px', padding: '28px', width: '300px', maxWidth: '100%',
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
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
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
