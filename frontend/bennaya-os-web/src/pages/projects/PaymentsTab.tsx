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
import { useCurrency } from '../../hooks/useCurrency'
import { formatDate } from '../../utils/format'
import type { ClientPayment } from '../../types/payment'
import { PaymentFormModal } from './PaymentFormModal'

export function PaymentsTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const { format } = useCurrency()

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
      void queryClient.invalidateQueries({ queryKey: ['payments', projectId] })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      setDeleting(null)
      setDeleteError(null)
    },
    onError: (caught: unknown) => {
      setDeleteError(
        caught instanceof ApiError ? caught.message : 'Could not delete this payment.',
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

  if (isPending) return <Spinner label="Loading payments" />

  if (isError) {
    return (
      <ErrorMessage
        message={error instanceof ApiError ? error.message : 'Could not load payments.'}
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
        <Button onClick={openCreate}>Record payment</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Contract value" value={format(contractValue)} />
        <StatCard label="Received" value={format(totalReceived)} tone="positive" />
        <StatCard
          label={isOverpaid ? 'Overpaid by' : 'Outstanding'}
          // Show the overpayment as a positive figure under a clear label,
          // rather than a confusing minus sign.
          value={format(Math.abs(outstandingBalance))}
          tone={isOverpaid ? 'positive' : 'warning'}
          hint={isOverpaid ? 'Client has paid more than the contract' : undefined}
        />
      </div>

      {contractValue > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Collected</span>
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
          title="No payments recorded"
          description="Record what the client has paid so you always know what is still owed."
          action={<Button onClick={openCreate}>Record payment</Button>}
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
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleting(payment)} className="flex-1">
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {/* DESKTOP: table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{payment.description ?? '-'}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-emerald-700">
                      {format(payment.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" onClick={() => openEdit(payment)}>
                          Edit
                        </Button>
                        <Button variant="ghost" onClick={() => setDeleting(payment)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-sm font-medium text-slate-600">
                    Total received
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-slate-900">
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
        title="Delete payment"
        message={
          deleteError ??
          `Delete this ${deleting ? format(deleting.amount) : ''} payment? This cannot be undone.`
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
