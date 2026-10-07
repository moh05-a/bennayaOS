import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { expensesApi } from '../../services/expensesApi'
import { suppliersApi } from '../../services/suppliersApi'
import { ApiError } from '../../services/api'
import { invalidateProjectFinancials } from '../../utils/invalidate'
import { useCurrency } from '../../hooks/useCurrency'
import { useLanguage } from '../../hooks/useLanguage'
import { todayIsoDate } from '../../utils/format'
import { EXPENSE_CATEGORIES } from '../../types/expense'
import type { Expense, ExpenseCategory } from '../../types/expense'
import { ProjectSelect } from './ProjectSelect'

interface ExpenseFormModalProps {
  isOpen: boolean
  /** null = the user picks the project in the form (dashboard quick add). */
  projectId: string | null
  /** null = adding a new expense, otherwise editing this one. */
  expense: Expense | null
  onClose: () => void
}

export function ExpenseFormModal({ isOpen, projectId, expense, onClose }: ExpenseFormModalProps) {
  const queryClient = useQueryClient()
  const { currencyCode } = useCurrency()
  const { t } = useLanguage()

  const [form, setForm] = useState({
    amount: '',
    category: 'Materials' as ExpenseCategory,
    // Defaults to today: the overwhelmingly common case is recording an expense
    // the day it happened, so that should take zero taps.
    date: todayIsoDate(),
    description: '',
    supplierId: '',
  })
  const [chosenProjectId, setChosenProjectId] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const targetProjectId = projectId ?? chosenProjectId

  // Shares the ['suppliers'] cache with the Suppliers page, so this dropdown
  // is usually populated instantly with no extra request.
  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: ({ signal }) => suppliersApi.list(signal),
  })

  useEffect(() => {
    if (!isOpen) return
    setForm(
      expense
        ? {
            amount: String(expense.amount),
            category: expense.category,
            date: expense.date,
            description: expense.description ?? '',
            supplierId: expense.supplierId ?? '',
          }
        : {
            amount: '',
            category: 'Materials',
            date: todayIsoDate(),
            description: '',
            supplierId: '',
          },
    )
    setChosenProjectId('')
    setFieldErrors({})
    setFormError(null)
  }, [isOpen, expense])

  const mutation = useMutation({
    mutationFn: (values: typeof form) => {
      const payload = {
        amount: Number(values.amount || 0),
        category: values.category,
        date: values.date,
        description: values.description.trim() || null,
        // "" from the empty <option> must become null, not an empty string.
        supplierId: values.supplierId || null,
      }
      return expense
        ? expensesApi.update(expense.id, payload)
        : expensesApi.create(targetProjectId, payload)
    },
    onSuccess: () => {
      invalidateProjectFinancials(queryClient, targetProjectId)
      onClose()
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        const errors = error.fieldErrors
        if (Object.keys(errors).length > 0) setFieldErrors(errors)
        else setFormError(error.message)
      } else {
        setFormError(t('errors.generic'))
      }
    },
  })

  const update =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }))

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setFieldErrors({})
    setFormError(null)
    mutation.mutate(form)
  }

  return (
    <Modal isOpen={isOpen} title={expense ? t('expenses.edit') : t('expenses.add')} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <ErrorMessage message={formError} />}

        {projectId === null && (
          <ProjectSelect value={chosenProjectId} onChange={setChosenProjectId} />
        )}

        <Input
          label={t('expenses.amountWithCurrency', { currency: currencyCode })}
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          required
          autoFocus={projectId !== null}
          value={form.amount}
          onChange={update('amount')}
          error={fieldErrors.amount}
          placeholder="1250.500"
        />

        <Select
          label={t('fields.category')}
          required
          value={form.category}
          onChange={update('category')}
          error={fieldErrors.category}
          options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: t(`expenseCategory.${c}`) }))}
        />

        <Input
          label={t('fields.date')}
          type="date"
          required
          value={form.date}
          onChange={update('date')}
          error={fieldErrors.date}
        />

        <Select
          label={t('expenses.supplierOptional')}
          value={form.supplierId}
          onChange={update('supplierId')}
          error={fieldErrors.supplierid}
          placeholder={t('expenses.noSupplier')}
          options={(suppliers ?? []).map((s) => ({ value: s.id, label: s.name }))}
        />

        <Input
          label={t('fields.description')}
          value={form.description}
          onChange={update('description')}
          error={fieldErrors.description}
          placeholder={t('expenses.descriptionPlaceholder')}
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {expense ? t('common.saveChanges') : t('expenses.add')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
