import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Modal } from '../../components/ui/Modal'
import { clientsApi } from '../../services/clientsApi'
import { ApiError } from '../../services/api'
import type { Client } from '../../types/client'

interface ClientFormModalProps {
  isOpen: boolean
  /** null = creating a new client, otherwise editing this one. */
  client: Client | null
  onClose: () => void
}

const EMPTY_FORM = { name: '', phone: '', email: '' }

export function ClientFormModal({ isOpen, client, onClose }: ClientFormModalProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  // Refill the form whenever we switch between create and edit.
  useEffect(() => {
    if (!isOpen) return
    setForm(
      client
        ? { name: client.name, phone: client.phone ?? '', email: client.email ?? '' }
        : EMPTY_FORM,
    )
    setFieldErrors({})
    setFormError(null)
  }, [isOpen, client])

  const mutation = useMutation({
    mutationFn: (values: typeof form) => {
      const payload = {
        name: values.name,
        // Send null rather than "" so the API stores one representation of
        // "not provided" and validation does not reject an empty string.
        phone: values.phone.trim() || null,
        email: values.email.trim() || null,
      }
      return client ? clientsApi.update(client.id, payload) : clientsApi.create(payload)
    },
    onSuccess: () => {
      // Marks the cached list as stale, so TanStack refetches it automatically.
      // This is the boilerplate we would otherwise hand-write on every page.
      void queryClient.invalidateQueries({ queryKey: ['clients'] })
      onClose()
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

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setFieldErrors({})
    setFormError(null)
    mutation.mutate(form)
  }

  return (
    <Modal isOpen={isOpen} title={client ? 'Edit client' : 'Add client'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <ErrorMessage message={formError} />}

        <Input
          label="Name"
          required
          autoFocus
          value={form.name}
          onChange={update('name')}
          error={fieldErrors.name}
          placeholder="Abu Ahmad"
        />

        <Input
          label="Phone"
          type="tel"
          inputMode="tel"
          value={form.phone}
          onChange={update('phone')}
          error={fieldErrors.phone}
          placeholder="+962 79 000 0000"
        />

        <Input
          label="Email"
          type="email"
          inputMode="email"
          value={form.email}
          onChange={update('email')}
          error={fieldErrors.email}
          placeholder="client@example.jo"
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {client ? 'Save changes' : 'Add client'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
