import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useModalStore } from '../store/modalStore'

interface Props {
  allowedTypes: Array<'client' | 'advisor' | 'superadmin'>
  children: React.ReactNode
}

/**
 * Wraps routes that require authentication.
 * - Not logged in → opens auth modal + redirects to /
 * - Logged in but wrong userType → redirects to /
 */
export default function ProtectedRoute({ allowedTypes, children }: Props) {
  const { isLoggedIn, userType } = useAuthStore()
  const { openAuthModal } = useModalStore()

  useEffect(() => {
    if (!isLoggedIn) openAuthModal('login')
  }, [isLoggedIn, openAuthModal])

  if (!isLoggedIn) return <Navigate to="/" replace />
  if (userType && !allowedTypes.includes(userType)) return <Navigate to="/" replace />

  return <>{children}</>
}
