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
import { useLanguage } from '../../hooks/useLanguage'
import type { Supplier } from '../../types/supplier'
import { initials } from '../../utils/initials'
import { SupplierFormModal } from './SupplierFormModal'

export function SuppliersPage() {
  const queryClient = useQueryClient()
  const { format } = useCurrency()
  const { t } = useLanguage()

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
        caught instanceof ApiError ? caught.message : t('suppliers.deleteError'),
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
      ? t('suppliers.deleteWithExpenses', {
          name: supplier.name,
          count: supplier.expenseCount,
          amount: format(supplier.totalSpent),
        })
      : t('common.confirmDelete', { name: supplier.name })

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t('suppliers.title')}
        description={t('suppliers.description')}
        action={<Button onClick={openCreate}>{t('suppliers.add')}</Button>}
      />

      {isPending && <Spinner label={t('suppliers.loading')} />}

      {isError && (
        <ErrorMessage
          message={error instanceof ApiError ? error.message : t('suppliers.loadError')}
        />
      )}

      {suppliers && suppliers.length === 0 && (
        <EmptyState
          title={t('suppliers.emptyTitle')}
          description={t('suppliers.emptyDescription')}
          action={<Button onClick={openCreate}>{t('suppliers.add')}</Button>}
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
                        <span dir="ltr">{supplier.phone}</span>
                      </a>
                    )}
                    {supplier.email && (
                      <p className="truncate text-sm text-slate-500">{supplier.email}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-end">
                    <p className="text-sm font-semibold tabular-nums text-slate-900">
                      {format(supplier.totalSpent)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t('suppliers.expenseCount', { count: supplier.expenseCount })}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <Button variant="secondary" onClick={() => openEdit(supplier)} className="flex-1">
                    {t('common.edit')}
                  </Button>
                  <Button variant="dangerGhost" onClick={() => setDeleting(supplier)} className="flex-1">
                    {t('common.delete')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {/* DESKTOP: table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:block">
            <table className="w-full text-start text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-medium">{t('fields.name')}</th>
                  <th className="px-5 py-3.5 font-medium">{t('fields.phone')}</th>
                  <th className="px-5 py-3.5 font-medium">{t('fields.email')}</th>
                  <th className="px-5 py-3.5 text-end font-medium">{t('suppliers.expensesColumn')}</th>
                  <th className="px-5 py-3.5 text-end font-medium">{t('money.totalSpent')}</th>
                  <th className="px-5 py-3.5 text-end font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          aria-hidden
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-semibold text-blue-700"
                        >
                          {initials(supplier.name)}
                        </div>
                        <span className="font-semibold text-slate-900">{supplier.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <span dir="ltr">{supplier.phone ?? '-'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{supplier.email ?? '-'}</td>
                    <td className="px-5 py-3.5 text-end tabular-nums text-slate-600">
                      {supplier.expenseCount}
                    </td>
                    <td className="px-5 py-3.5 text-end font-medium tabular-nums text-slate-900">
                      {format(supplier.totalSpent)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" onClick={() => openEdit(supplier)}>
                          {t('common.edit')}
                        </Button>
                        <Button variant="dangerGhost" onClick={() => setDeleting(supplier)}>
                          {t('common.delete')}
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
        title={t('suppliers.deleteTitle')}
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
