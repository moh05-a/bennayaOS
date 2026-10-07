import { useCallback } from 'react'
import { useAuth } from './useAuth'
import { useLanguage } from './useLanguage'
import { LANGUAGES } from '../i18n'
import { formatMoney } from '../utils/format'

/**
 * Formats money using the signed-in company's currency.
 * Components call format(amount) and never think about JOD vs SAR, or about
 * how the current language writes numbers.
 */
export function useCurrency() {
  const { session } = useAuth()
  const { language } = useLanguage()
  const currencyCode = session?.company.currencyCode ?? 'JOD'
  const locale = LANGUAGES[language].numberLocale

  const format = useCallback(
    (amount: number) => formatMoney(amount, currencyCode, locale),
    [currencyCode, locale],
  )

  return { format, currencyCode }
}
