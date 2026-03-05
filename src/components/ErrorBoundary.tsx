// ============================================================
// WhiteStellar — ErrorBoundary
// src/components/ErrorBoundary.tsx
// ============================================================

import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? 'Something went wrong.' }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: '16px',
            background: '#0D1221', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '16px', padding: '40px 24px', textAlign: 'center',
            margin: '24px 0',
          }}
        >
          <AlertTriangle size={40} style={{ color: '#EF4444' }} />
          <div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '18px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 8px',
              }}
            >
              Something went wrong
            </h3>
            <p style={{ color: '#8B9BB4', fontSize: '13px', margin: 0, maxWidth: '320px' }}>
              {this.state.message}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            style={{
              background: '#C9A84C', color: '#0B0F1A', border: 'none',
              borderRadius: '10px', padding: '10px 24px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
