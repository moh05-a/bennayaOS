/**
 * Money formatting.
 *
 * The currency code is ALWAYS passed in from the signed-in company, never
 * hardcoded. Intl.NumberFormat then knows JOD uses 3 decimals and SAR uses 2,
 * so opening Riyadh later needs no code change here. The locale comes from the
 * current UI language (see useCurrency).
 *
 * Date formatting lives in LanguageContext (formatDate from useLanguage), since
 * it depends only on the language.
 */
export function formatMoney(amount: number, currencyCode: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'code',
    }).format(amount)
  } catch {
    // An unknown currency code should degrade, not crash the page.
    return `${currencyCode} ${amount.toFixed(2)}`
  }
}

/** Today as "YYYY-MM-DD" in the user's local timezone, for date input defaults. */
export function todayIsoDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
