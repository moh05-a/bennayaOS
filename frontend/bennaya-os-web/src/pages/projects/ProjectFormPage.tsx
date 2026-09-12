import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Input } from '../../components/ui/Input'
import { PageHeader } from '../../components/ui/PageHeader'
import { Select } from '../../components/ui/Select'
import { Spinner } from '../../components/ui/Spinner'
import { Textarea } from '../../components/ui/Textarea'
import { clientsApi } from '../../services/clientsApi'
import { projectsApi } from '../../services/projectsApi'
import { ApiError } from '../../services/api'
import { useCurrency } from '../../hooks/useCurrency'
import { PROJECT_STATUSES } from '../../types/project'
import type { ProjectStatus } from '../../types/project'

const EMPTY_FORM = {
  name: '',
  description: '',
  location: '',
  contractValue: '',
  startDate: '',
  expectedEndDate: '',
  clientId: '',
  status: 'Planning' as ProjectStatus,
}

/**
 * Handles BOTH create (/projects/new) and edit (/projects/:id/edit).
 * The two forms would otherwise be near-identical copies that drift apart.
 */
export function ProjectFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { currencyCode } = useCurrency()

  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  // The client dropdown needs the client list.
  const { data: clients, isPending: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: ({ signal }) => clientsApi.list(signal),
  })

  // Only fetched when editing.
  const { data: existing, isPending: projectLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: ({ signal }) => projectsApi.getById(id!, signal),
    enabled: isEditing,
  })

  useEffect(() => {
    if (!existing) return
    setForm({
      name: existing.name,
      description: existing.description ?? '',
      location: existing.location ?? '',
      contractValue: String(existing.contractValue),
      startDate: existing.startDate ?? '',
      expectedEndDate: existing.expectedEndDate ?? '',
      clientId: existing.clientId,
      status: existing.status,
    })
  }, [existing])

  const mutation = useMutation({
    mutationFn: (values: typeof form) => {
      const payload = {
        name: values.name,
        description: values.description.trim() || null,
        location: values.location.trim() || null,
        // The input is a string; the API expects a number.
        contractValue: Number(values.contractValue || 0),
        startDate: values.startDate || null,
        expectedEndDate: values.expectedEndDate || null,
        clientId: values.clientId,
        status: values.status,
      }
      return isEditing ? projectsApi.update(id!, payload) : projectsApi.create(payload)
    },
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate(`/projects/${project.id}`, { replace: true })
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

  const update =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setFieldErrors({})
    setFormError(null)
    mutation.mutate(form)
  }

  if (isEditing && projectLoading) return <Spinner label="Loading project" />

  const hasClients = clients !== undefined && clients.length > 0

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={isEditing ? 'Edit project' : 'New project'} />

      {!clientsLoading && !hasClients && (
        <div className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You need a client before creating a project.{' '}
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="font-medium underline underline-offset-2"
          >
            Add a client first
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        {formError && <ErrorMessage message={formError} />}

        <Input
          label="Project name"
          required
          value={form.name}
          onChange={update('name')}
          error={fieldErrors.name}
          placeholder="Khalda Villa - Finishing"
        />

        <Select
          label="Client"
          required
          value={form.clientId}
          onChange={update('clientId')}
          error={fieldErrors.clientid}
          placeholder={clientsLoading ? 'Loading clients...' : 'Select a client'}
          options={(clients ?? []).map((client) => ({ value: client.id, label: client.name }))}
        />

        <Input
          label={`Contract value (${currencyCode})`}
          type="number"
          // step allows fils precision; inputMode gives phones a numeric keypad.
          step="0.001"
          min="0"
          inputMode="decimal"
          required
          value={form.contractValue}
          onChange={update('contractValue')}
          error={fieldErrors.contractvalue}
          placeholder="185750.500"
        />

        <Input
          label="Location"
          value={form.location}
          onChange={update('location')}
          error={fieldErrors.location}
          placeholder="Khalda, Amman"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={update('startDate')}
            error={fieldErrors.startdate}
          />
          <Input
            label="Expected end date"
            type="date"
            value={form.expectedEndDate}
            onChange={update('expectedEndDate')}
            error={fieldErrors.expectedenddate}
          />
        </div>

        <Select
          label="Status"
          value={form.status}
          onChange={update('status')}
          error={fieldErrors.status}
          options={PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        />

        <Textarea
          label="Description"
          value={form.description}
          onChange={update('description')}
          error={fieldErrors.description}
          placeholder="Scope of work, key notes..."
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending} disabled={!hasClients}>
            {isEditing ? 'Save changes' : 'Create project'}
          </Button>
        </div>
      </form>
    </div>
  )
}
