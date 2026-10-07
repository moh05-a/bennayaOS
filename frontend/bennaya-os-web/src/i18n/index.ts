import { ar } from './ar'
import { en } from './en'
import type { Dictionary, Language, PluralForms, TranslationKey, TranslationParams } from './types'

export type { Language, TranslationKey, TranslationParams } from './types'

interface LanguageMeta {
  /** Shown in the switcher, always in the language itself. */
  nativeName: string
  dir: 'ltr' | 'rtl'
  /** Locale for money and numbers. */
  numberLocale: string
  /** Locale for dates. */
  dateLocale: string
}

/**
 * Arabic uses the Jordanian locale (so months read "آذار", not "مارس") but
 * keeps Western digits ("nu-latn"): that is what contractors type into forms
 * and what invoices here use, so the numbers on screen match the paperwork.
 */
export const LANGUAGES: Record<Language, LanguageMeta> = {
  en: { nativeName: 'English', dir: 'ltr', numberLocale: 'en-JO', dateLocale: 'en-GB' },
  ar: { nativeName: 'العربية', dir: 'rtl', numberLocale: 'ar-JO-u-nu-latn', dateLocale: 'ar-JO-u-nu-latn' },
}

const DICTIONARIES: Record<Language, Dictionary> = { en, ar }

// Intl.PluralRules is not free to construct, and t() runs on every render.
const pluralRulesCache = new Map<Language, Intl.PluralRules>()

function pluralRules(language: Language): Intl.PluralRules {
  let rules = pluralRulesCache.get(language)
  if (!rules) {
    rules = new Intl.PluralRules(language)
    pluralRulesCache.set(language, rules)
  }
  return rules
}

function lookup(dictionary: Dictionary, key: string): string | PluralForms | undefined {
  let node: unknown = dictionary
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined
    node = (node as Record<string, unknown>)[part]
  }
  if (typeof node === 'string') return node
  if (typeof node === 'object' && node !== null && 'other' in node) return node as PluralForms
  return undefined
}

/**
 * Looks up `key` for `language`, picks the plural form from params.count when
 * the entry is a plural, then fills in {placeholders}.
 *
 * Falls back to English, then to the key itself, so a gap never crashes a page.
 * Used directly by non-React code (the API client); components use t() from
 * useLanguage(), which is this function bound to the current language.
 */
export function translate(
  language: Language,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  const entry = lookup(DICTIONARIES[language], key) ?? lookup(en, key)
  if (entry === undefined) return key

  const text =
    typeof entry === 'string'
      ? entry
      : (entry[pluralRules(language).select(Number(params?.count ?? 0))] ?? entry.other)

  if (!params) return text

  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}
