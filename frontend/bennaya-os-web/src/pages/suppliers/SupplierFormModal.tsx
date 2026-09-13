import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { suppliersApi } from '../../services/suppliersApi'
import { ApiError } from '../../services/api'
import type { Supplier } from '../../types/supplier'

interface SupplierFormModalProps {
  isOpen: boolean
  supplier: Supplier | null
  onClose: () => void
}

const EMPTY_FORM = { name: '', phone: '', email: '' }

export function SupplierFormModal({ isOpen, supplier, onClose }: SupplierFormModalProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setForm(
      supplier
        ? { name: supplier.name, phone: supplier.phone ?? '', email: supplier.email ?? '' }
        : EMPTY_FORM,
    )
    setFieldErrors({})
    setFormError(null)
  }, [isOpen, supplier])

  const mutation = useMutation({
    mutationFn: (values: typeof form) => {
      const payload = {
        name: values.name,
        phone: values.phone.trim() || null,
        email: values.email.trim() || null,
      }
      return supplier ? suppliersApi.update(supplier.id, payload) : suppliersApi.create(payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['suppliers'] })
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
    <Modal isOpen={isOpen} title={supplier ? 'Edit supplier' : 'Add supplier'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <ErrorMessage message={formError} />}

        <Input
          label="Name"
          required
          autoFocus
          value={form.name}
          onChange={update('name')}
          error={fieldErrors.name}
          placeholder="Amman Cement Co"
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
          placeholder="sales@supplier.jo"
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {supplier ? 'Save changes' : 'Add supplier'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
