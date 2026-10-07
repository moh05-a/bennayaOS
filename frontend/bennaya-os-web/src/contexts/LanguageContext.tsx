import { createContext, useCallback, useLayoutEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { LANGUAGES, translate } from '../i18n'
import type { Language, TranslationKey, TranslationParams } from '../i18n'
import { languageStorage } from '../services/languageStorage'

interface LanguageContextValue {
  language: Language
  dir: 'ltr' | 'rtl'
  setLanguage: (language: Language) => void
  /** Translates a key into the current language. */
  t: (key: TranslationKey, params?: TranslationParams) => string
  /** "2026-03-15" -> "15 Mar 2026" / "15 آذار 2026". Null shows a dash. */
  formatDate: (isoDate: string | null) => string
}

// eslint-disable-next-line react-refresh/only-export-components
export const LanguageContext = createContext<LanguageContextValue | null>(null)

/**
 * Holds the UI language. Changing it re-renders every component that calls
 * useLanguage(), flips the page direction, and makes the API client send the
 * new language on its next request, so server messages switch too.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => languageStorage.read())

  // lang and dir live on <html> so the browser handles RTL layout, text
  // shaping and screen-reader pronunciation for the whole page. A layout
  // effect applies them before paint, so there is no flash of the wrong side.
  useLayoutEffect(() => {
    const root = document.documentElement
    root.lang = language
    root.dir = LANGUAGES[language].dir
  }, [language])

  const setLanguage = useCallback((next: Language) => {
    languageStorage.write(next)
    setLanguageState(next)
  }, [])

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => translate(language, key, params),
    [language],
  )

  const formatDate = useCallback(
    (isoDate: string | null) => formatIsoDate(isoDate, LANGUAGES[language].dateLocale),
    [language],
  )

  const value = useMemo<LanguageContextValue>(
    () => ({ language, dir: LANGUAGES[language].dir, setLanguage, t, formatDate }),
    [language, setLanguage, t, formatDate],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

function formatIsoDate(isoDate: string | null, locale: string): string {
  if (!isoDate) return '—'

  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return isoDate

  // Constructing from explicit parts avoids Date parsing an ISO string as UTC
  // and then displaying the previous day in a negative-offset timezone.
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
