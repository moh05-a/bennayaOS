import { useContext } from 'react'
import { LanguageContext } from '../contexts/LanguageContext'

/**
 * Current language, t() for translating, and formatDate().
 * Throws when used outside LanguageProvider, same as useAuth.
 */
export function useLanguage() {
  const context = useContext(LanguageContext)

  if (context === null) {
    throw new Error('useLanguage must be used inside a <LanguageProvider>.')
  }

  return context
}
