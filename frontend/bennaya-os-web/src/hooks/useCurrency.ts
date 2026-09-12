import { useCallback } from 'react'
import { useAuth } from './useAuth'
import { formatMoney } from '../utils/format'

/**
 * Formats money using the signed-in company's currency.
 * Components call format(amount) and never think about JOD vs SAR.
 */
export function useCurrency() {
  const { session } = useAuth()
  const currencyCode = session?.company.currencyCode ?? 'JOD'

  const format = useCallback(
    (amount: number) => formatMoney(amount, currencyCode),
    [currencyCode],
  )

  return { format, currencyCode }
}
