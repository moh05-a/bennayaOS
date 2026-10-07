import { useLanguage } from '../hooks/useLanguage'
import { LANGUAGES } from '../i18n'
import type { Language } from '../i18n'

interface LanguageSwitcherProps {
  className?: string
  /**
   * "button": one tap toggles, labelled in the language it switches TO
   * ("العربية" while in English), because someone who cannot read the current
   * language must still be able to find the way out.
   * "segmented": both languages side by side, each in its own script, with
   * the current one highlighted.
   */
  variant?: 'button' | 'segmented'
}

const ORDER: Language[] = ['en', 'ar']

export function LanguageSwitcher({ className = '', variant = 'button' }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage()

  if (variant === 'segmented') {
    return (
      <div
        role="group"
        aria-label={t('language.switch')}
        className={`grid grid-cols-2 rounded-lg bg-slate-100 p-0.75 text-[13px] font-medium ${className}`}
      >
        {ORDER.map((option) => {
          const isCurrent = option === language
          return (
            <button
              key={option}
              type="button"
              lang={option}
              aria-pressed={isCurrent}
              onClick={() => setLanguage(option)}
              className={`rounded-md px-2 py-1.5 transition ${
                isCurrent
                  ? 'bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {LANGUAGES[option].nativeName}
            </button>
          )
        })}
      </div>
    )
  }

  const next = language === 'ar' ? 'en' : 'ar'

  return (
    <button
      type="button"
      onClick={() => setLanguage(next)}
      title={t('language.switch')}
      className={`inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
        className="size-4 shrink-0"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 3.75 5.7 3.75 9S14.5 18.3 12 21c-2.5-2.7-3.75-5.7-3.75-9S9.5 5.7 12 3Z" />
      </svg>
      <span lang={next}>{LANGUAGES[next].nativeName}</span>
    </button>
  )
}
