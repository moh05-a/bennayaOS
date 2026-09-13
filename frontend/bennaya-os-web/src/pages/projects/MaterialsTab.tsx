import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Spinner } from '../../components/ui/Spinner'
import { StatCard } from '../../components/ui/StatCard'
import { materialsApi } from '../../services/materialsApi'
import { ApiError } from '../../services/api'
import { invalidateProjectFinancials } from '../../utils/invalidate'
import { useCurrency } from '../../hooks/useCurrency'
import { MATERIAL_UNITS, unitShort } from '../../types/material'
import type { Material, MaterialUnit } from '../../types/material'

const EMPTY_FORM = {
  name: '',
  unit: 'Bag' as MaterialUnit,
  requiredQuantity: '',
  purchasedQuantity: '',
  usedQuantity: '',
  estimatedUnitCost: '',
}

/** Quantities are decimals but usually whole - trim pointless trailing zeros. */
function qty(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value)
}

export function MaterialsTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()
  const { format } = useCurrency()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Material | null>(null)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['materials', projectId],
    queryFn: ({ signal }) => materialsApi.listForProject(projectId, signal),
  })

  const saveMutation = useMutation({
    mutationFn: (values: typeof form) => {
      const payload = {
        name: values.name,
        unit: values.unit,
        requiredQuantity: Number(values.requiredQuantity || 0),
        purchasedQuantity: Number(values.purchasedQuantity || 0),
        usedQuantity: Number(values.usedQuantity || 0),
        estimatedUnitCost: Number(values.estimatedUnitCost || 0),
      }
      return editing
        ? materialsApi.update(editing.id, payload)
        : materialsApi.create(projectId, payload)
    },
    onSuccess: () => {
      invalidateProjectFinancials(queryClient, projectId)
      setIsFormOpen(false)
    },
    onError: (caught: unknown) => {
      if (caught instanceof ApiError) {
        const errors = caught.fieldErrors
        if (Object.keys(errors).length > 0) setFieldErrors(errors)
        else setFormError(caught.message)
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => materialsApi.remove(id),
    onSuccess: () => {
      invalidateProjectFinancials(queryClient, projectId)
      setDeleting(null)
    },
  })

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFieldErrors({})
    setFormError(null)
    setIsFormOpen(true)
  }

  const openEdit = (material: Material) => {
    setEditing(material)
    setForm({
      name: material.name,
      unit: material.unit,
      requiredQuantity: String(material.requiredQuantity),
      purchasedQuantity: String(material.purchasedQuantity),
      usedQuantity: String(material.usedQuantity),
      estimatedUnitCost: String(material.estimatedUnitCost),
    })
    setFieldErrors({})
    setFormError(null)
    setIsFormOpen(true)
  }

  const update =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }))

  if (isPending) return <Spinner label="Loading materials" />

  if (isError) {
    return (
      <ErrorMessage
        message={error instanceof ApiError ? error.message : 'Could not load materials.'}
      />
    )
  }

  const { items, totalEstimatedCost, totalPurchasedCost, itemsNeedingPurchase } = data

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>Add material</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Estimated budget" value={format(totalEstimatedCost)} />
        <StatCard label="Purchased so far" value={format(totalPurchasedCost)} />
        <StatCard
          label="Still to buy"
          value={String(itemsNeedingPurchase)}
          hint={`of ${items.length} material${items.length === 1 ? '' : 's'}`}
          tone={itemsNeedingPurchase > 0 ? 'warning' : 'default'}
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No materials yet"
          description="Track what each project needs, what you have bought and what has been used on site."
          action={<Button onClick={openCreate}>Add material</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {items.map((material) => {
            const unit = unitShort(material.unit)
            const purchasedPercent =
              material.requiredQuantity > 0
                ? Math.min(100, (material.purchasedQuantity / material.requiredQuantity) * 100)
                : material.purchasedQuantity > 0
                  ? 100
                  : 0

            return (
              <li
                key={material.id}
                className={`rounded-xl border bg-white p-4 shadow-sm ${
                  material.isOverUsed ? 'border-red-200' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{material.name}</p>
                    <p className="text-xs text-slate-500">
                      {format(material.estimatedUnitCost)} per {unit} &middot; budget{' '}
                      {format(material.estimatedTotalCost)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">Available on site</p>
                    <p
                      className={`text-lg font-semibold tabular-nums ${
                        material.availableQuantity < 0 ? 'text-red-700' : 'text-slate-900'
                      }`}
                    >
                      {qty(material.availableQuantity)} {unit}
                    </p>
                  </div>
                </div>

                {/* The four quantities, laid out so they read left to right in
                    the order a contractor thinks about them. */}
                <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                    <dt className="text-xs text-slate-500">Required</dt>
                    <dd className="text-sm font-medium tabular-nums text-slate-900">
                      {qty(material.requiredQuantity)} {unit}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                    <dt className="text-xs text-slate-500">Purchased</dt>
                    <dd className="text-sm font-medium tabular-nums text-slate-900">
                      {qty(material.purchasedQuantity)} {unit}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                    <dt className="text-xs text-slate-500">Used</dt>
                    <dd className="text-sm font-medium tabular-nums text-slate-900">
                      {qty(material.usedQuantity)} {unit}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                    <dt className="text-xs text-slate-500">
                      {material.isOverSupplied ? 'Over-ordered' : 'To buy'}
                    </dt>
                    <dd
                      className={`text-sm font-medium tabular-nums ${
                        material.isOverSupplied ? 'text-amber-700' : 'text-slate-900'
                      }`}
                    >
                      {qty(Math.abs(material.remainingToPurchase))} {unit}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        material.isOverSupplied ? 'bg-amber-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${purchasedPercent}%` }}
                    />
                  </div>
                </div>

                {material.isOverUsed && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    More has been used ({qty(material.usedQuantity)} {unit}) than purchased (
                    {qty(material.purchasedQuantity)} {unit}). Either stock came from elsewhere, or
                    one of these numbers is wrong.
                  </p>
                )}

                {material.isOverSupplied && (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {qty(Math.abs(material.remainingToPurchase))} {unit} more was bought than this
                    job needs &mdash; roughly{' '}
                    {format(
                      Math.abs(material.remainingToPurchase) * material.estimatedUnitCost,
                    )}{' '}
                    tied up in surplus stock.
                  </p>
                )}

                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <Button variant="secondary" onClick={() => openEdit(material)}>
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleting(material)}>
                    Delete
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Modal
        isOpen={isFormOpen}
        title={editing ? 'Edit material' : 'Add material'}
        onClose={() => setIsFormOpen(false)}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setFieldErrors({})
            setFormError(null)
            saveMutation.mutate(form)
          }}
          className="space-y-4"
        >
          {formError && <ErrorMessage message={formError} />}

          <Input
            label="Material"
            required
            autoFocus
            value={form.name}
            onChange={update('name')}
            error={fieldErrors.name}
            placeholder="Cement"
          />

          <Select
            label="Unit"
            required
            value={form.unit}
            onChange={update('unit')}
            error={fieldErrors.unit}
            options={MATERIAL_UNITS.map((u) => ({ value: u.value, label: u.label }))}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              label="Required"
              type="number"
              step="0.001"
              min="0"
              inputMode="decimal"
              value={form.requiredQuantity}
              onChange={update('requiredQuantity')}
              error={fieldErrors.requiredquantity}
              placeholder="1000"
            />
            <Input
              label="Purchased"
              type="number"
              step="0.001"
              min="0"
              inputMode="decimal"
              value={form.purchasedQuantity}
              onChange={update('purchasedQuantity')}
              error={fieldErrors.purchasedquantity}
              placeholder="700"
            />
            <Input
              label="Used"
              type="number"
              step="0.001"
              min="0"
              inputMode="decimal"
              value={form.usedQuantity}
              onChange={update('usedQuantity')}
              error={fieldErrors.usedquantity}
              placeholder="620"
            />
          </div>

          <Input
            label="Cost per unit"
            type="number"
            step="0.001"
            min="0"
            inputMode="decimal"
            value={form.estimatedUnitCost}
            onChange={update('estimatedUnitCost')}
            error={fieldErrors.estimatedunitcost}
            hint="Per unit, not the total - the budget is calculated for you"
            placeholder="4.500"
          />

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFormOpen(false)}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saveMutation.isPending}>
              {editing ? 'Save changes' : 'Add material'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete material"
        message={`Delete "${deleting?.name}"? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
