import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Spinner } from '../../components/ui/Spinner'
import { subcontractorsApi } from '../../services/subcontractorsApi'
import { ApiError } from '../../services/api'
import { invalidateProjectFinancials } from '../../utils/invalidate'
import { useCurrency } from '../../hooks/useCurrency'
import { formatDate, todayIsoDate } from '../../utils/format'
import type { Subcontractor } from '../../types/subcontractor'

interface SubcontractorPaymentsModalProps {
  isOpen: boolean
  projectId: string
  subcontractor: Subcontractor | null
  onClose: () => void
}

/**
 * Payment history and the "record a payment" form in one dialog, because those
 * two things are always wanted together: you check what you already paid, then
 * pay the rest.
 */
export function SubcontractorPaymentsModal({
  isOpen,
  projectId,
  subcontractor,
  onClose,
}: SubcontractorPaymentsModalProps) {
  const queryClient = useQueryClient()
  const { format } = useCurrency()

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayIsoDate())
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { data: payments, isPending } = useQuery({
    queryKey: ['subcontractor-payments', subcontractor?.id],
    queryFn: ({ signal }) => subcontractorsApi.listPayments(subcontractor!.id, signal),
    enabled: isOpen && subcontractor !== null,
  })

  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: ['subcontractor-payments', subcontractor?.id],
    })
    invalidateProjectFinancials(queryClient, projectId)
  }

  const addMutation = useMutation({
    mutationFn: () =>
      subcontractorsApi.addPayment(subcontractor!.id, {
        amount: Number(amount || 0),
        date,
        description: description.trim() || null,
      }),
    onSuccess: () => {
      refresh()
      setAmount('')
      setDescription('')
      setDate(todayIsoDate())
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        const errors = error.fieldErrors
        if (Object.keys(errors).length > 0) setFieldErrors(errors)
        else setFormError(error.message)
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (paymentId: string) => subcontractorsApi.removePayment(paymentId),
    onSuccess: refresh,
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setFieldErrors({})
    setFormError(null)
    addMutation.mutate()
  }

  if (!subcontractor) return null

  const isOverpaid = subcontractor.remaining < 0

  return (
    <Modal isOpen={isOpen} title={`Payments - ${subcontractor.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center">
          <div>
            <p className="text-xs text-slate-500">Contract</p>
            <p className="text-sm font-semibold tabular-nums text-slate-900">
              {format(subcontractor.contractAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Paid</p>
            <p className="text-sm font-semibold tabular-nums text-slate-900">
              {format(subcontractor.totalPaid)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{isOverpaid ? 'Overpaid' : 'Remaining'}</p>
            <p
              className={`text-sm font-semibold tabular-nums ${
                isOverpaid ? 'text-amber-700' : 'text-slate-900'
              }`}
            >
              {format(Math.abs(subcontractor.remaining))}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 border-t border-slate-100 pt-4">
          {formError && <ErrorMessage message={formError} />}

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Amount"
              type="number"
              step="0.001"
              min="0"
              inputMode="decimal"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              error={fieldErrors.amount}
              placeholder="4000.000"
            />
            <Input
              label="Date"
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              error={fieldErrors.date}
            />
          </div>

          <Input
            label="Note"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="First instalment"
          />

          <Button type="submit" isLoading={addMutation.isPending} className="w-full">
            Record payment
          </Button>
        </form>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Payment history
          </h3>

          {isPending ? (
            <Spinner label="Loading payments" />
          ) : !payments || payments.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No payments yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100">
              {payments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium tabular-nums text-slate-900">
                      {format(payment.amount)}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {formatDate(payment.date)}
                      {payment.description ? ` · ${payment.description}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(payment.id)}
                    disabled={deleteMutation.isPending}
                    className="shrink-0 rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-red-700 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}
