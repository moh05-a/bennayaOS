import { useLanguage } from '../hooks/useLanguage'
import { LANGUAGES } from '../i18n'

/**
 * One tap toggles between English and Arabic. The button is labelled in the
 * language it switches TO ("العربية" while in English), because someone who
 * cannot read the current language must still be able to find the way out.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage()
  const next = language === 'ar' ? 'en' : 'ar'

  return (
    <button
      type="button"
      onClick={() => setLanguage(next)}
      title={t('language.switch')}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${className}`}
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
