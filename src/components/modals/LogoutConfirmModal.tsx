import { LogOut, X } from 'lucide-react'

interface Props {
  onConfirm: () => void
  onCancel: () => void
}

export default function LogoutConfirmModal({ onConfirm, onCancel }: Props) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0D1221', border: '1px solid #1E2D45', borderRadius: '16px',
          padding: '32px', width: '360px', maxWidth: 'calc(100vw - 32px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
          textAlign: 'center',
        }}
      >
        <button
          onClick={onCancel}
          style={{
            position: 'absolute' as const, top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#4B5563', display: 'flex', padding: '4px',
          }}
        >
          <X size={18} />
        </button>

        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#EF4444',
        }}>
          <LogOut size={22} />
        </div>

        <div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: '20px',
            fontWeight: 700, color: '#F0F4FF', margin: '0 0 8px',
          }}>
            Sign Out?
          </h2>
          <p style={{ color: '#8B9BB4', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
            Are you sure you want to sign out of your account?
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px', borderRadius: '10px',
              background: 'transparent', border: '1px solid #1E2D45',
              color: '#8B9BB4', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '11px', borderRadius: '10px',
              background: '#EF4444', border: 'none',
              color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
