import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { expensesApi } from '../../services/expensesApi'
import { ApiError } from '../../services/api'
import { invalidateProjectFinancials } from '../../utils/invalidate'
import { useCurrency } from '../../hooks/useCurrency'
import { todayIsoDate } from '../../utils/format'
import { EXPENSE_CATEGORIES } from '../../types/expense'
import type { Expense, ExpenseCategory } from '../../types/expense'

interface ExpenseFormModalProps {
  isOpen: boolean
  projectId: string
  /** null = adding a new expense, otherwise editing this one. */
  expense: Expense | null
  onClose: () => void
}

export function ExpenseFormModal({ isOpen, projectId, expense, onClose }: ExpenseFormModalProps) {
  const queryClient = useQueryClient()
  const { currencyCode } = useCurrency()

  const [form, setForm] = useState({
    amount: '',
    category: 'Materials' as ExpenseCategory,
    // Defaults to today: the overwhelmingly common case is recording an expense
    // the day it happened, so that should take zero taps.
    date: todayIsoDate(),
    description: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setForm(
      expense
        ? {
            amount: String(expense.amount),
            category: expense.category,
            date: expense.date,
            description: expense.description ?? '',
          }
        : { amount: '', category: 'Materials', date: todayIsoDate(), description: '' },
    )
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
      }
      return expense
        ? expensesApi.update(expense.id, payload)
        : expensesApi.create(projectId, payload)
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
    <Modal isOpen={isOpen} title={expense ? 'Edit expense' : 'Add expense'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && <ErrorMessage message={formError} />}

        <Input
          label={`Amount (${currencyCode})`}
          type="number"
          step="0.001"
          min="0"
          inputMode="decimal"
          required
          autoFocus
          value={form.amount}
          onChange={update('amount')}
          error={fieldErrors.amount}
          placeholder="1250.500"
        />

        <Select
          label="Category"
          required
          value={form.category}
          onChange={update('category')}
          error={fieldErrors.category}
          options={EXPENSE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
        />

        <Input
          label="Date"
          type="date"
          required
          value={form.date}
          onChange={update('date')}
          error={fieldErrors.date}
        />

        <Input
          label="Description"
          value={form.description}
          onChange={update('description')}
          error={fieldErrors.description}
          placeholder="Cement - 250 bags"
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            {expense ? 'Save changes' : 'Add expense'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
