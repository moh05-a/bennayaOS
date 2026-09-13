import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { subcontractorsApi } from '../../services/subcontractorsApi'
import { ApiError } from '../../services/api'
import { invalidateProjectFinancials } from '../../utils/invalidate'
import { useCurrency } from '../../hooks/useCurrency'
import { COMMON_TRADES } from '../../types/subcontractor'
import type { Subcontractor } from '../../types/subcontractor'

interface SubcontractorFormModalProps {
  isOpen: boolean
  projectId: string
  subcontractor: Subcontractor | null
  onClose: () => void
}

const EMPTY_FORM = { name: '', specialty: '', phone: '', contractAmount: '' }

export function SubcontractorFormModal({
  isOpen,
  projectId,
  subcontractor,
  onClose,
}: SubcontractorFormModalProps) {
  const queryClient = useQueryClient()
  const { currencyCode } = useCurrency()

  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setForm(
      subcontractor
        ? {
            name: subcontractor.name,
            specialty: subcontractor.specialty ?? '',
            phone: subcontractor.phone ?? '',
            contractAmount: String(subcontractor.contractAmount),
          }
        : EMPTY_FORM,
    )
    setFieldErrors({})
    setFormError(null)
  }, [isOpen, subcontractor])

  const mutation = useMutation({
    mutationFn: (values: typeof form) => {
      const payload = {
        name: values.name,
        specialty: values.specialty.trim() || null,
        phone: values.phone.trim() || null,
        contractAmount: Number(values.contractAmount || 0),
      }
      return subcontractor
        ? subcontractorsApi.update(subcontractor.id, payload)
        : subcontractorsApi.create(projectId, payload)
    },
    onSuccess: () => {
      invalidateProjectFinancials(queryClient, projectId)
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
    <Modal
      isOpen={isOpen}
      title={subcontractor ? 'Edit subcontractor' : 'Add subcontractor'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <ErrorMessage message={formError} />}

        <Input
          label="Name"
          required
          autoFocus
          value={form.name}
          onChange={update('name')}
          error={fieldErrors.name}
          placeholder="Ahmad Al-Khatib"
        />

        <div className="space-y-2">
          <Input
            label="Specialty"
            value={form.specialty}
            onChange={update('specialty')}
            error={fieldErrors.specialty}
            placeholder="Electrician"
          />

          {/* Free text with shortcuts: trades vary by market, so a fixed list
              would push real work into "Other". */}
          <div className="flex flex-wrap gap-1.5">
            {COMMON_TRADES.map((trade) => (
              <button
                key={trade}
                type="button"
                onClick={() => setForm((current) => ({ ...current, specialty: trade }))}
                className="rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
              >
                {trade}
              </button>
            ))}
          </div>
        </div>

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
          label={`Contract amount (${currencyCode})`}
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          required
          value={form.contractAmount}
          onChange={update('contractAmount')}
          error={fieldErrors.contractamount}
          hint="Leave as 0 if the amount is not agreed yet"
          placeholder="8500.000"
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {subcontractor ? 'Save changes' : 'Add subcontractor'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
