import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../services/authApi'
import { authStorage } from '../services/authStorage'
import { setUnauthorizedHandler } from '../services/api'
import type { AuthSession, LoginRequest, RegisterRequest } from '../types/auth'

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (request: LoginRequest) => Promise<void>
  register: (request: RegisterRequest) => Promise<void>
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Holds who is signed in. React Context is the right tool here because the
 * session is small, changes rarely, and is needed all over the tree - exactly
 * the case where Redux would be overkill.
 *
 * Server data (clients, projects) deliberately does NOT live here. That is
 * TanStack Query's job, and mixing the two is what makes state unmanageable.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialised straight from storage so a page refresh does not flash the
  // login screen before restoring the session.
  const [session, setSession] = useState<AuthSession | null>(() => authStorage.read())

  const logout = useCallback(() => {
    authStorage.clear()
    setSession(null)
  }, [])

  // If any request comes back 401, the token is dead - drop the session.
  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  // A stored token can expire while the tab sits open. Checking on mount avoids
  // showing a logged-in UI that will fail on its first request.
  useEffect(() => {
    if (session && new Date(session.expiresAt).getTime() <= Date.now()) {
      logout()
    }
  }, [session, logout])

  const login = useCallback(async (request: LoginRequest) => {
    const result = await authApi.login(request)
    authStorage.write(result)
    setSession(result)
  }, [])

  const register = useCallback(async (request: RegisterRequest) => {
    const result = await authApi.register(request)
    authStorage.write(result)
    setSession(result)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
