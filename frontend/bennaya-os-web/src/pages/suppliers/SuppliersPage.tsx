import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'
import { suppliersApi } from '../../services/suppliersApi'
import { ApiError } from '../../services/api'
import { useCurrency } from '../../hooks/useCurrency'
import type { Supplier } from '../../types/supplier'
import { SupplierFormModal } from './SupplierFormModal'

export function SuppliersPage() {
  const queryClient = useQueryClient()
  const { format } = useCurrency()

  const [editing, setEditing] = useState<Supplier | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Supplier | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data: suppliers, isPending, isError, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: ({ signal }) => suppliersApi.list(signal),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => suppliersApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      // Expenses keep their amounts but lose the supplier name, so any cached
      // expense list is now showing a name that no longer exists.
      void queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setDeleting(null)
      setDeleteError(null)
    },
    onError: (caught: unknown) => {
      setDeleteError(
        caught instanceof ApiError ? caught.message : 'Could not delete this supplier.',
      )
    },
  })

  const openCreate = () => {
    setEditing(null)
    setIsFormOpen(true)
  }

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier)
    setIsFormOpen(true)
  }

  // Spelling out the consequence beats a generic "are you sure?".
  const deleteMessage = (supplier: Supplier) =>
    supplier.expenseCount > 0
      ? `Delete "${supplier.name}"? Its ${supplier.expenseCount} expense(s) worth ${format(
          supplier.totalSpent,
        )} will be kept, but will no longer show a supplier.`
      : `Delete "${supplier.name}"? This cannot be undone.`

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Suppliers"
        description="The businesses you buy materials and services from."
        action={<Button onClick={openCreate}>Add supplier</Button>}
      />

      {isPending && <Spinner label="Loading suppliers" />}

      {isError && (
        <ErrorMessage
          message={error instanceof ApiError ? error.message : 'Could not load suppliers.'}
        />
      )}

      {suppliers && suppliers.length === 0 && (
        <EmptyState
          title="No suppliers yet"
          description="Add your suppliers so you can tag expenses and see how much you spend with each one."
          action={<Button onClick={openCreate}>Add supplier</Button>}
        />
      )}

      {suppliers && suppliers.length > 0 && (
        <>
          {/* MOBILE: cards */}
          <ul className="space-y-3 sm:hidden">
            {suppliers.map((supplier) => (
              <li
                key={supplier.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{supplier.name}</p>
                    {supplier.phone && (
                      <a
                        href={`tel:${supplier.phone}`}
                        className="mt-0.5 block text-sm text-slate-600 underline underline-offset-2"
                      >
                        {supplier.phone}
                      </a>
                    )}
                    {supplier.email && (
                      <p className="truncate text-sm text-slate-500">{supplier.email}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-slate-900">
                      {format(supplier.totalSpent)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {supplier.expenseCount} expense{supplier.expenseCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <Button variant="secondary" onClick={() => openEdit(supplier)} className="flex-1">
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleting(supplier)} className="flex-1">
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
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 text-right font-medium">Expenses</th>
                  <th className="px-4 py-3 text-right font-medium">Total spent</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{supplier.name}</td>
                    <td className="px-4 py-3 text-slate-600">{supplier.phone ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{supplier.email ?? '-'}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                      {supplier.expenseCount}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                      {format(supplier.totalSpent)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" onClick={() => openEdit(supplier)}>
                          Edit
                        </Button>
                        <Button variant="ghost" onClick={() => setDeleting(supplier)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <SupplierFormModal
        isOpen={isFormOpen}
        supplier={editing}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete supplier"
        message={deleteError ?? (deleting ? deleteMessage(deleting) : '')}
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
