import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Spinner } from '../../components/ui/Spinner'
import { expensesApi } from '../../services/expensesApi'
import { ApiError } from '../../services/api'
import { useCurrency } from '../../hooks/useCurrency'
import { formatDate } from '../../utils/format'
import type { Expense } from '../../types/expense'
import { ExpenseFormModal } from './ExpenseFormModal'

const CATEGORY_STYLES: Record<string, string> = {
  Materials: 'bg-blue-50 text-blue-700',
  Labor: 'bg-purple-50 text-purple-700',
  Equipment: 'bg-amber-50 text-amber-700',
  Transportation: 'bg-teal-50 text-teal-700',
  Subcontractor: 'bg-indigo-50 text-indigo-700',
  Other: 'bg-slate-100 text-slate-700',
}

function CategoryTag({ category }: { category: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        CATEGORY_STYLES[category] ?? CATEGORY_STYLES.Other
      }`}
    >
      {category}
    </span>
  )
}

export function ExpensesTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const { format } = useCurrency()

  const [editing, setEditing] = useState<Expense | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Expense | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['expenses', projectId],
    queryFn: ({ signal }) => expensesApi.listForProject(projectId, signal),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['expenses', projectId] })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      setDeleting(null)
      setDeleteError(null)
    },
    onError: (caught: unknown) => {
      setDeleteError(
        caught instanceof ApiError ? caught.message : 'Could not delete this expense.',
      )
    },
  })

  const openCreate = () => {
    setEditing(null)
    setIsFormOpen(true)
  }

  const openEdit = (expense: Expense) => {
    setEditing(expense)
    setIsFormOpen(true)
  }

  if (isPending) return <Spinner label="Loading expenses" />

  if (isError) {
    return (
      <ErrorMessage
        message={error instanceof ApiError ? error.message : 'Could not load expenses.'}
      />
    )
  }

  const { items, totalAmount, totalsByCategory } = data

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total spent
          </p>
          {/* This number comes from SUM() in PostgreSQL, not from adding up the
              rows below - so it stays correct once the list is paginated. */}
          <p className="mt-0.5 text-2xl font-semibold tabular-nums text-slate-900">
            {format(totalAmount)}
          </p>
        </div>
        <Button onClick={openCreate}>Add expense</Button>
      </div>

      {totalsByCategory.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {totalsByCategory.map((entry) => (
            <div
              key={entry.category}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
            >
              <p className="text-xs text-slate-500">{entry.category}</p>
              <p className="text-sm font-semibold tabular-nums text-slate-900">
                {format(entry.amount)}
              </p>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          description="Record what you spend on this project to track where the money goes."
          action={<Button onClick={openCreate}>Add expense</Button>}
        />
      ) : (
        <>
          {/* MOBILE: cards */}
          <ul className="space-y-3 sm:hidden">
            {items.map((expense) => (
              <li
                key={expense.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold tabular-nums text-slate-900">
                      {format(expense.amount)}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">{formatDate(expense.date)}</p>
                  </div>
                  <CategoryTag category={expense.category} />
                </div>

                {expense.description && (
                  <p className="mt-2 text-sm text-slate-600">{expense.description}</p>
                )}

                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <Button variant="secondary" onClick={() => openEdit(expense)} className="flex-1">
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleting(expense)} className="flex-1">
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
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-4 py-3">
                      <CategoryTag category={expense.category} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{expense.description ?? '-'}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                      {format(expense.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" onClick={() => openEdit(expense)}>
                          Edit
                        </Button>
                        <Button variant="ghost" onClick={() => setDeleting(expense)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-medium text-slate-600">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-slate-900">
                    {format(totalAmount)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      <ExpenseFormModal
        isOpen={isFormOpen}
        projectId={projectId}
        expense={editing}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete expense"
        message={
          deleteError ??
          `Delete this ${deleting ? format(deleting.amount) : ''} expense? This cannot be undone.`
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
