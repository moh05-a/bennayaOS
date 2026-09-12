import type { AuthSession } from '../types/auth'

/**
 * Where the JWT lives between page reloads.
 *
 * Tradeoff worth knowing: localStorage is readable by any JavaScript on the
 * page, so a cross-site-scripting bug could steal the token. The more secure
 * option is an httpOnly cookie, which JavaScript cannot read at all - but that
 * requires CSRF protection and cookie/CORS configuration.
 *
 * For the MVP we use localStorage and keep XSS risk low by never rendering
 * untrusted HTML. Moving to httpOnly cookies is on the list alongside refresh
 * tokens. Isolating it in this one file means that change touches nothing else.
 */
const STORAGE_KEY = 'bennaya.session'

export const authStorage = {
  read(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as AuthSession
    } catch {
      // Private mode, cleared storage, or corrupted JSON. Treat as logged out.
      return null
    }
  },

  write(session: AuthSession): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {
      // Storage unavailable: the session still works for this tab.
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Nothing to do.
    }
  },
}
