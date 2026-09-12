/**
 * Money and date formatting.
 *
 * The currency code is ALWAYS passed in from the signed-in company, never
 * hardcoded. Intl.NumberFormat then knows JOD uses 3 decimals and SAR uses 2,
 * so opening Riyadh later needs no code change here.
 */
export function formatMoney(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat('en-JO', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'code',
    }).format(amount)
  } catch {
    // An unknown currency code should degrade, not crash the page.
    return `${currencyCode} ${amount.toFixed(2)}`
  }
}

/** "2026-03-15" -> "15 Mar 2026". Parsed as parts so no timezone shift occurs. */
export function formatDate(isoDate: string | null): string {
  if (!isoDate) return '—'

  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return isoDate

  // Constructing from explicit parts avoids Date parsing an ISO string as UTC
  // and then displaying the previous day in a negative-offset timezone.
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Today as "YYYY-MM-DD" in the user's local timezone, for date input defaults. */
export function todayIsoDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
