import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { paymentsApi } from '../../services/paymentsApi'
import { ApiError } from '../../services/api'
import { invalidateProjectFinancials } from '../../utils/invalidate'
import { useCurrency } from '../../hooks/useCurrency'
import { useLanguage } from '../../hooks/useLanguage'
import { todayIsoDate } from '../../utils/format'
import type { ClientPayment } from '../../types/payment'

interface PaymentFormModalProps {
  isOpen: boolean
  projectId: string
  payment: ClientPayment | null
  onClose: () => void
}

/**
 * Common payment labels. Tapping one fills the description, because typing
 * "Foundation payment" on a phone at a building site is friction we can remove.
 * These are dictionary keys, so the filled-in text is in the user's language.
 */
const QUICK_LABELS = ['deposit', 'foundation', 'structure', 'finishing', 'final'] as const

export function PaymentFormModal({ isOpen, projectId, payment, onClose }: PaymentFormModalProps) {
  const queryClient = useQueryClient()
  const { currencyCode } = useCurrency()
  const { t } = useLanguage()

  const [form, setForm] = useState({
    amount: '',
    date: todayIsoDate(),
    description: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setForm(
      payment
        ? {
            amount: String(payment.amount),
            date: payment.date,
            description: payment.description ?? '',
          }
        : { amount: '', date: todayIsoDate(), description: '' },
    )
    setFieldErrors({})
    setFormError(null)
  }, [isOpen, payment])

  const mutation = useMutation({
    mutationFn: (values: typeof form) => {
      const payload = {
        amount: Number(values.amount || 0),
        date: values.date,
        description: values.description.trim() || null,
      }
      return payment
        ? paymentsApi.update(payment.id, payload)
        : paymentsApi.create(projectId, payload)
    },
    onSuccess: () => {
      invalidateProjectFinancials(queryClient, projectId)
      onClose()
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        const errors = error.fieldErrors
        if (Object.keys(errors).length > 0) setFieldErrors(errors)
        else setFormError(error.message)
      } else {
        setFormError(t('errors.generic'))
      }
    },
  })

  const update =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setFieldErrors({})
    setFormError(null)
    mutation.mutate(form)
  }

  return (
    <Modal
      isOpen={isOpen}
      title={payment ? t('payments.edit') : t('payments.record')}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <ErrorMessage message={formError} />}

        <Input
          label={t('payments.amountReceived', { currency: currencyCode })}
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          required
          autoFocus
          value={form.amount}
          onChange={update('amount')}
          error={fieldErrors.amount}
          placeholder="15000.000"
        />

        <Input
          label={t('payments.dateReceived')}
          type="date"
          required
          value={form.date}
          onChange={update('date')}
          error={fieldErrors.date}
        />

        <div className="space-y-2">
          <Input
            label={t('fields.description')}
            value={form.description}
            onChange={update('description')}
            error={fieldErrors.description}
            placeholder={t('paymentLabels.deposit')}
          />

          <div className="flex flex-wrap gap-1.5">
            {QUICK_LABELS.map((key) => {
              const label = t(`paymentLabels.${key}`)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, description: label }))}
                  className="rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {payment ? t('common.saveChanges') : t('payments.record')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
