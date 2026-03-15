// ============================================================
// WhiteStellar — Session Wrapper (fullscreen container)
// src/components/session/SessionWrapper.tsx
// ============================================================

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'

interface Props {
  children: React.ReactNode
}

export default function SessionWrapper({ children }: Props) {
  const navigate = useNavigate()
  const { status, tickSecond } = useSessionStore()

  // If no session, bail to home
  useEffect(() => {
    if (status === 'idle') navigate('/', { replace: true })
  }, [status, navigate])

  // Tick every second while active
  useEffect(() => {
    if (status !== 'active') return
    const interval = setInterval(tickSecond, 1000)
    return () => clearInterval(interval)
  }, [status, tickSecond])

  // When session ends — navigate to summary
  // (wallet balance already updated by endSession() in sessionStore)
  useEffect(() => {
    if (status !== 'ended') return
    navigate('/session/end', { replace: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Warn on browser refresh / close
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'Are you sure you want to leave? Your session will end.'
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  if (status === 'idle' || status === 'ended') return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#080C16', display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  )
}
