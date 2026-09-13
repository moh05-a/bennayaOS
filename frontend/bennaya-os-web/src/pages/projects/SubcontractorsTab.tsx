import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Spinner } from '../../components/ui/Spinner'
import { StatCard } from '../../components/ui/StatCard'
import { subcontractorsApi } from '../../services/subcontractorsApi'
import { ApiError } from '../../services/api'
import { invalidateProjectFinancials } from '../../utils/invalidate'
import { useCurrency } from '../../hooks/useCurrency'
import type { Subcontractor } from '../../types/subcontractor'
import { SubcontractorFormModal } from './SubcontractorFormModal'
import { SubcontractorPaymentsModal } from './SubcontractorPaymentsModal'

export function SubcontractorsTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const { format } = useCurrency()

  const [editing, setEditing] = useState<Subcontractor | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [payingTo, setPayingTo] = useState<Subcontractor | null>(null)
  const [deleting, setDeleting] = useState<Subcontractor | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['subcontractors', projectId],
    queryFn: ({ signal }) => subcontractorsApi.listForProject(projectId, signal),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subcontractorsApi.remove(id),
    onSuccess: () => {
      invalidateProjectFinancials(queryClient, projectId)
      setDeleting(null)
      setDeleteError(null)
    },
    onError: (caught: unknown) => {
      setDeleteError(
        caught instanceof ApiError ? caught.message : 'Could not delete this subcontractor.',
      )
    },
  })

  const openCreate = () => {
    setEditing(null)
    setIsFormOpen(true)
  }

  const openEdit = (subcontractor: Subcontractor) => {
    setEditing(subcontractor)
    setIsFormOpen(true)
  }

  if (isPending) return <Spinner label="Loading subcontractors" />

  if (isError) {
    return (
      <ErrorMessage
        message={error instanceof ApiError ? error.message : 'Could not load subcontractors.'}
      />
    )
  }

  const { items, totalCommitted, totalPaid, totalRemaining } = data

  // Keep the fresh copy from the list in sync with the open payments dialog,
  // so the balances at the top of it update after each payment.
  const openSubcontractor = payingTo
    ? (items.find((item) => item.id === payingTo.id) ?? payingTo)
    : null

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Add subcontractor</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Committed" value={format(totalCommitted)} />
        <StatCard label="Paid" value={format(totalPaid)} />
        <StatCard
          label="Still owed"
          value={format(totalRemaining)}
          tone={totalRemaining > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* This is the one place the double-counting rule must be visible. */}
      <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
        Record subcontractor money here, not as an expense &mdash; otherwise the same payment is
        counted twice in this project&apos;s totals.
      </p>

      {items.length === 0 ? (
        <EmptyState
          title="No subcontractors yet"
          description="Add the electricians, plumbers and other trades on this project to track what you owe them."
          action={<Button onClick={openCreate}>Add subcontractor</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {items.map((subcontractor) => {
            const isOverpaid = subcontractor.remaining < 0
            const paidPercent =
              subcontractor.contractAmount > 0
                ? Math.min(100, (subcontractor.totalPaid / subcontractor.contractAmount) * 100)
                : 0

            return (
              <li
                key={subcontractor.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{subcontractor.name}</p>
                    <p className="text-sm text-slate-500">
                      {subcontractor.specialty ?? 'Trade not set'}
                      {subcontractor.phone && (
                        <>
                          {' · '}
                          <a
                            href={`tel:${subcontractor.phone}`}
                            className="underline underline-offset-2"
                          >
                            {subcontractor.phone}
                          </a>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      {isOverpaid ? 'Overpaid by' : 'Remaining'}
                    </p>
                    <p
                      className={`text-lg font-semibold tabular-nums ${
                        isOverpaid
                          ? 'text-amber-700'
                          : subcontractor.remaining === 0
                            ? 'text-emerald-700'
                            : 'text-slate-900'
                      }`}
                    >
                      {format(Math.abs(subcontractor.remaining))}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>
                      Paid{' '}
                      <span className="font-medium tabular-nums text-slate-700">
                        {format(subcontractor.totalPaid)}
                      </span>{' '}
                      of {format(subcontractor.contractAmount)}
                    </span>
                    <span className="tabular-nums">{paidPercent.toFixed(0)}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverpaid ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${isOverpaid ? 100 : paidPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  <Button onClick={() => setPayingTo(subcontractor)}>
                    Payments ({subcontractor.paymentCount})
                  </Button>
                  <Button variant="secondary" onClick={() => openEdit(subcontractor)}>
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleting(subcontractor)}>
                    Delete
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <SubcontractorFormModal
        isOpen={isFormOpen}
        projectId={projectId}
        subcontractor={editing}
        onClose={() => setIsFormOpen(false)}
      />

      <SubcontractorPaymentsModal
        isOpen={openSubcontractor !== null}
        projectId={projectId}
        subcontractor={openSubcontractor}
        onClose={() => setPayingTo(null)}
      />

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete subcontractor"
        message={
          deleteError ??
          (deleting && deleting.paymentCount > 0
            ? `Delete "${deleting.name}"? This also deletes ${deleting.paymentCount} payment(s) totalling ${format(deleting.totalPaid)}. This cannot be undone.`
            : `Delete "${deleting?.name}"? This cannot be undone.`)
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
