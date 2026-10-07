import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Spinner } from '../../components/ui/Spinner'
import { StatCard } from '../../components/ui/StatCard'
import { paymentsApi } from '../../services/paymentsApi'
import { ApiError } from '../../services/api'
import { invalidateProjectFinancials } from '../../utils/invalidate'
import { useCurrency } from '../../hooks/useCurrency'
import { useLanguage } from '../../hooks/useLanguage'
import type { ClientPayment } from '../../types/payment'
import { PaymentFormModal } from './PaymentFormModal'

export function PaymentsTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const { format } = useCurrency()
  const { t, formatDate } = useLanguage()

  const [editing, setEditing] = useState<ClientPayment | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<ClientPayment | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['payments', projectId],
    queryFn: ({ signal }) => paymentsApi.listForProject(projectId, signal),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentsApi.remove(id),
    onSuccess: () => {
      invalidateProjectFinancials(queryClient, projectId)
      setDeleting(null)
      setDeleteError(null)
    },
    onError: (caught: unknown) => {
      setDeleteError(
        caught instanceof ApiError ? caught.message : t('payments.deleteError'),
      )
    },
  })

  const openCreate = () => {
    setEditing(null)
    setIsFormOpen(true)
  }

  const openEdit = (payment: ClientPayment) => {
    setEditing(payment)
    setIsFormOpen(true)
  }

  if (isPending) return <Spinner label={t('payments.loading')} />

  if (isError) {
    return (
      <ErrorMessage
        message={error instanceof ApiError ? error.message : t('payments.loadError')}
      />
    )
  }

  const { items, totalReceived, contractValue, outstandingBalance } = data

  // Negative outstanding means the client has paid more than the contract.
  const isOverpaid = outstandingBalance < 0

  // Guard against dividing by zero on a project whose value is not set yet.
  const percentReceived =
    contractValue > 0 ? Math.min(100, (totalReceived / contractValue) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>{t('payments.record')}</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label={t('money.contractValue')} value={format(contractValue)} />
        <StatCard label={t('money.received')} value={format(totalReceived)} tone="positive" />
        <StatCard
          label={isOverpaid ? t('money.overpaidBy') : t('money.outstanding')}
          // Show the overpayment as a positive figure under a clear label,
          // rather than a confusing minus sign.
          value={format(Math.abs(outstandingBalance))}
          tone={isOverpaid ? 'positive' : 'warning'}
          hint={isOverpaid ? t('payments.overpaidHint') : undefined}
        />
      </div>

      {contractValue > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{t('payments.collected')}</span>
            <span className="tabular-nums">{percentReceived.toFixed(0)}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${percentReceived}%` }}
            />
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title={t('payments.emptyTitle')}
          description={t('payments.emptyDescription')}
          action={<Button onClick={openCreate}>{t('payments.record')}</Button>}
        />
      ) : (
        <>
          {/* MOBILE: cards */}
          <ul className="space-y-3 sm:hidden">
            {items.map((payment) => (
              <li
                key={payment.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold tabular-nums text-emerald-700">
                      {format(payment.amount)}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">{formatDate(payment.date)}</p>
                  </div>
                </div>

                {payment.description && (
                  <p className="mt-2 text-sm text-slate-600">{payment.description}</p>
                )}

                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <Button variant="secondary" onClick={() => openEdit(payment)} className="flex-1">
                    {t('common.edit')}
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleting(payment)} className="flex-1">
                    {t('common.delete')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {/* DESKTOP: table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:block">
            <table className="w-full text-start text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">{t('fields.date')}</th>
                  <th className="px-4 py-3 font-medium">{t('fields.description')}</th>
                  <th className="px-4 py-3 text-end font-medium">{t('fields.amount')}</th>
                  <th className="px-4 py-3 text-end font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{payment.description ?? '-'}</td>
                    <td className="px-4 py-3 text-end font-medium tabular-nums text-emerald-700">
                      {format(payment.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" onClick={() => openEdit(payment)}>
                          {t('common.edit')}
                        </Button>
                        <Button variant="ghost" onClick={() => setDeleting(payment)}>
                          {t('common.delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-sm font-medium text-slate-600">
                    {t('payments.totalReceived')}
                  </td>
                  <td className="px-4 py-3 text-end text-sm font-semibold tabular-nums text-slate-900">
                    {format(totalReceived)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      <PaymentFormModal
        isOpen={isFormOpen}
        projectId={projectId}
        payment={editing}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleting !== null}
        title={t('payments.deleteTitle')}
        message={
          deleteError ??
          t('payments.deleteConfirm', { amount: deleting ? format(deleting.amount) : '' })
        }
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onCancel={() => {
          setDeleting(null)
          setDeleteError(null)
        }}
      />
    </div>
  )
}
