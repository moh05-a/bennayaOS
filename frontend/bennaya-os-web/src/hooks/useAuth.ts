import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

/**
 * Throws when used outside AuthProvider, turning a confusing "cannot read
 * property of null" into a clear message pointing at the real mistake.
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === null) {
    throw new Error('useAuth must be used inside an <AuthProvider>.')
  }

  return context
}
