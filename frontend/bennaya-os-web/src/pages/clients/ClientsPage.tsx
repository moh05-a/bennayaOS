import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { PageHeader } from '../../components/ui/PageHeader'
import { Spinner } from '../../components/ui/Spinner'
import { clientsApi } from '../../services/clientsApi'
import { ApiError } from '../../services/api'
import { useLanguage } from '../../hooks/useLanguage'
import type { Client } from '../../types/client'
import { initials } from '../../utils/initials'
import { ClientFormModal } from './ClientFormModal'

/** Avatar tints cycle through the palette so neighbouring cards differ. */
const AVATAR_COLORS = [
  'bg-amber-50 text-amber-700',
  'bg-blue-50 text-blue-700',
  'bg-emerald-50 text-emerald-700',
  'bg-[#f3e6f1] text-[#86346f]',
]

export function ClientsPage() {
  const queryClient = useQueryClient()
  const { t } = useLanguage()

  const [editing, setEditing] = useState<Client | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Client | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // useQuery handles loading, error, caching and refetching. The queryKey is
  // the cache identity - invalidating ['clients'] anywhere refreshes this list.
  const { data: clients, isPending, isError, error } = useQuery({
    queryKey: ['clients'],
    queryFn: ({ signal }) => clientsApi.list(signal),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['clients'] })
      setDeleting(null)
      setDeleteError(null)
    },
    onError: (caught: unknown) => {
      // The API returns 409 with a readable reason when the client still has
      // projects. Show that message rather than a generic failure.
      setDeleteError(
        caught instanceof ApiError ? caught.message : t('clients.deleteError'),
      )
    },
  })

  const openCreate = () => {
    setEditing(null)
    setIsFormOpen(true)
  }

  const openEdit = (client: Client) => {
    setEditing(client)
    setIsFormOpen(true)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t('clients.title')}
        description={t('clients.description')}
        action={<Button onClick={openCreate}>{t('clients.add')}</Button>}
      />

      {isPending && <Spinner label={t('clients.loading')} />}

      {isError && (
        <ErrorMessage
          message={error instanceof ApiError ? error.message : t('clients.loadError')}
        />
      )}

      {clients && clients.length === 0 && (
        <EmptyState
          title={t('clients.emptyTitle')}
          description={t('clients.emptyDescription')}
          action={<Button onClick={openCreate}>{t('clients.add')}</Button>}
        />
      )}

      {clients && clients.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client, index) => {
            const avatar = AVATAR_COLORS[index % AVATAR_COLORS.length]

            return (
              <li
                key={client.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden
                    className={`flex size-10.5 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold ${avatar}`}
                  >
                    {initials(client.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-slate-900">
                      {client.name}
                    </p>
                    {client.email && (
                      <p className="truncate text-[13px] text-slate-500">{client.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[13px]">
                  {client.phone && (
                    <a
                      href={`tel:${client.phone}`}
                      className="whitespace-nowrap rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-900 hover:bg-slate-50"
                    >
                      <span dir="ltr">{client.phone}</span>
                    </a>
                  )}
                  <span className="whitespace-nowrap rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-600">
                    {t('clients.projectCount', { count: client.projectCount })}
                  </span>
                </div>

                <div className="mt-auto flex gap-2 border-t border-slate-100 pt-3">
                  <Button variant="secondary" onClick={() => openEdit(client)} className="flex-1">
                    {t('common.edit')}
                  </Button>
                  <Button variant="dangerGhost" onClick={() => setDeleting(client)} className="flex-1">
                    {t('common.delete')}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ClientFormModal
        isOpen={isFormOpen}
        client={editing}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleting !== null}
        title={t('clients.deleteTitle')}
        message={deleteError ?? t('common.confirmDelete', { name: deleting?.name ?? '' })}
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
