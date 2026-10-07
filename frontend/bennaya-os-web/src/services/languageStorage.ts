import type { Language } from '../i18n'

/**
 * Remembers the chosen UI language between visits.
 *
 * The value is also kept in memory, so the API client and the React tree agree
 * on the language even when localStorage is unavailable (private mode).
 *
 * First visit: Arabic if the browser is set to Arabic, otherwise English.
 */
const STORAGE_KEY = 'bennaya.language'

let current: Language | null = null

function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ar'
}

export const languageStorage = {
  read(): Language {
    if (current) return current

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (isLanguage(stored)) {
        current = stored
        return current
      }
    } catch {
      // Storage unavailable: fall through to the browser's language.
    }

    current = navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en'
    return current
  },

  write(language: Language): void {
    current = language
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      // Storage unavailable: the choice still holds for this tab.
    }
  },
}
