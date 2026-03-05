interface ToastProps {
  message: string
  visible: boolean
}

export default function Toast({ message, visible }: ToastProps) {
  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '16px'})`,
        opacity: visible ? 1 : 0,
        pointerEvents: 'none',
        zIndex: 99999,
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        background: '#131929',
        border: '1px solid #2DD4BF',
        color: '#2DD4BF',
        borderRadius: '10px',
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      {message}
    </div>
  )
}
