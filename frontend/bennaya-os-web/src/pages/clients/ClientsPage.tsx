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
import type { Client } from '../../types/client'
import { ClientFormModal } from './ClientFormModal'

export function ClientsPage() {
  const queryClient = useQueryClient()

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
        caught instanceof ApiError ? caught.message : 'Could not delete this client.',
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
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Clients"
        description="The people and companies you build for."
        action={<Button onClick={openCreate}>Add client</Button>}
      />

      {isPending && <Spinner label="Loading clients" />}

      {isError && (
        <ErrorMessage
          message={error instanceof ApiError ? error.message : 'Could not load clients.'}
        />
      )}

      {clients && clients.length === 0 && (
        <EmptyState
          title="No clients yet"
          description="Add your first client to start creating projects for them."
          action={<Button onClick={openCreate}>Add client</Button>}
        />
      )}

      {clients && clients.length > 0 && (
        <>
          {/* MOBILE: cards. A desktop table squeezed onto a phone is unusable,
              so below sm we render the same data as stacked cards instead. */}
          <ul className="space-y-3 sm:hidden">
            {clients.map((client) => (
              <li
                key={client.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{client.name}</p>
                    {client.phone && (
                      <a
                        href={`tel:${client.phone}`}
                        className="mt-0.5 block text-sm text-slate-600 underline underline-offset-2"
                      >
                        {client.phone}
                      </a>
                    )}
                    {client.email && (
                      <p className="truncate text-sm text-slate-500">{client.email}</p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {client.projectCount} project{client.projectCount === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <Button variant="secondary" onClick={() => openEdit(client)} className="flex-1">
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleting(client)} className="flex-1">
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
                  <th className="px-4 py-3 font-medium">Projects</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{client.name}</td>
                    <td className="px-4 py-3 text-slate-600">{client.phone ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{client.email ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{client.projectCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" onClick={() => openEdit(client)}>
                          Edit
                        </Button>
                        <Button variant="ghost" onClick={() => setDeleting(client)}>
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

      <ClientFormModal
        isOpen={isFormOpen}
        client={editing}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete client"
        message={deleteError ?? `Delete "${deleting?.name}"? This cannot be undone.`}
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
