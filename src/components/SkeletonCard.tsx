// ============================================================
// WhiteStellar — SkeletonCard (loading placeholder)
// src/components/SkeletonCard.tsx
// ============================================================

interface SkeletonCardProps {
  height?: number
  borderRadius?: number
}

function Shimmer({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #131929 25%, #1E2D45 50%, #131929 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s infinite',
        borderRadius: '6px',
        ...style,
      }}
    />
  )
}

export default function SkeletonCard({ height = 320, borderRadius = 16 }: SkeletonCardProps) {
  return (
    <>
      <div
        style={{
          background: '#0D1221',
          border: '1px solid #1E2D45',
          borderRadius,
          overflow: 'hidden',
          height,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Avatar */}
        <Shimmer style={{ width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0 }} />
        {/* Name */}
        <Shimmer style={{ height: '16px', width: '60%' }} />
        {/* Subtitle */}
        <Shimmer style={{ height: '12px', width: '40%' }} />
        {/* Tags */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Shimmer style={{ height: '22px', width: '60px', borderRadius: '20px' }} />
          <Shimmer style={{ height: '22px', width: '70px', borderRadius: '20px' }} />
        </div>
        {/* Bio lines */}
        <Shimmer style={{ height: '12px', width: '100%' }} />
        <Shimmer style={{ height: '12px', width: '85%' }} />
        {/* CTA */}
        <div style={{ marginTop: 'auto' }}>
          <Shimmer style={{ height: '40px', width: '100%', borderRadius: '10px' }} />
        </div>
      </div>

      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  )
}
