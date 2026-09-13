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
import { Textarea } from '../../components/ui/Textarea'
import { tasksApi } from '../../services/tasksApi'
import { ApiError } from '../../services/api'
import { invalidateProjectFinancials } from '../../utils/invalidate'
import { formatDate } from '../../utils/format'
import { TASK_STATUSES } from '../../types/task'
import type { ProjectTask, ProjectTaskStatus } from '../../types/task'

const STATUS_STYLES: Record<ProjectTaskStatus, string> = {
  Todo: 'bg-slate-100 text-slate-700',
  InProgress: 'bg-blue-50 text-blue-700',
  Completed: 'bg-emerald-50 text-emerald-700',
}

const STATUS_LABELS: Record<ProjectTaskStatus, string> = {
  Todo: 'To do',
  InProgress: 'In progress',
  Completed: 'Completed',
}

/** Tapping the status cycles forward - the fastest path for the common case. */
const NEXT_STATUS: Record<ProjectTaskStatus, ProjectTaskStatus> = {
  Todo: 'InProgress',
  InProgress: 'Completed',
  Completed: 'Todo',
}

const EMPTY_FORM = {
  title: '',
  description: '',
  dueDate: '',
  status: 'Todo' as ProjectTaskStatus,
}

export function TasksTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProjectTask | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<ProjectTask | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: ({ signal }) => tasksApi.listForProject(projectId, signal),
  })

  const saveMutation = useMutation({
    mutationFn: (values: typeof form) => {
      const payload = {
        title: values.title,
        description: values.description.trim() || null,
        dueDate: values.dueDate || null,
        status: values.status,
      }
      return editing ? tasksApi.update(editing.id, payload) : tasksApi.create(projectId, payload)
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

  // Separate mutation so cycling status does not disturb the open form.
  const statusMutation = useMutation({
    mutationFn: ({ task, status }: { task: ProjectTask; status: ProjectTaskStatus }) =>
      tasksApi.update(task.id, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status,
      }),
    onSuccess: () => invalidateProjectFinancials(queryClient, projectId),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
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

  const openEdit = (task: ProjectTask) => {
    setEditing(task)
    setForm({
      title: task.title,
      description: task.description ?? '',
      dueDate: task.dueDate ?? '',
      status: task.status,
    })
    setFieldErrors({})
    setFormError(null)
    setIsFormOpen(true)
  }

  const update =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }))

  if (isPending) return <Spinner label="Loading tasks" />

  if (isError) {
    return (
      <ErrorMessage
        message={error instanceof ApiError ? error.message : 'Could not load tasks.'}
      />
    )
  }

  const { items, todoCount, inProgressCount, completedCount, overdueCount } = data

  // Overdue is decided by the server; we only read the flag it implies.
  const todayIso = new Date().toISOString().slice(0, 10)
  const isOverdue = (task: ProjectTask) =>
    task.status !== 'Completed' && task.dueDate !== null && task.dueDate < todayIso

  const visible = showCompleted ? items : items.filter((task) => task.status !== 'Completed')

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            To do {todoCount}
          </span>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            In progress {inProgressCount}
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            Done {completedCount}
          </span>
          {overdueCount > 0 && (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
              Overdue {overdueCount}
            </span>
          )}
        </div>

        <Button onClick={openCreate}>Add task</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Track what still needs doing on this project."
          action={<Button onClick={openCreate}>Add task</Button>}
        />
      ) : (
        <>
          <ul className="space-y-2">
            {visible.map((task) => {
              const overdue = isOverdue(task)

              return (
                <li
                  key={task.id}
                  className={`rounded-xl border bg-white p-4 shadow-sm ${
                    overdue ? 'border-red-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={`font-medium ${
                          task.status === 'Completed'
                            ? 'text-slate-400 line-through'
                            : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </p>

                      {task.description && (
                        <p className="mt-0.5 text-sm text-slate-600">{task.description}</p>
                      )}

                      <p className="mt-1 text-xs">
                        {task.dueDate ? (
                          <span className={overdue ? 'font-medium text-red-700' : 'text-slate-500'}>
                            {overdue ? 'Overdue · ' : 'Due '}
                            {formatDate(task.dueDate)}
                          </span>
                        ) : (
                          <span className="text-slate-400">No due date</span>
                        )}
                      </p>
                    </div>

                    {/* One tap advances the status - the most common action. */}
                    <button
                      type="button"
                      onClick={() =>
                        statusMutation.mutate({ task, status: NEXT_STATUS[task.status] })
                      }
                      disabled={statusMutation.isPending}
                      title="Tap to change status"
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition hover:opacity-80 disabled:opacity-50 ${
                        STATUS_STYLES[task.status]
                      }`}
                    >
                      {STATUS_LABELS[task.status]}
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                    <Button variant="secondary" onClick={() => openEdit(task)}>
                      Edit
                    </Button>
                    <Button variant="ghost" onClick={() => setDeleting(task)}>
                      Delete
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={() => setShowCompleted((current) => !current)}
              className="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-900"
            >
              {showCompleted ? 'Hide' : 'Show'} {completedCount} completed task
              {completedCount === 1 ? '' : 's'}
            </button>
          )}
        </>
      )}

      <Modal
        isOpen={isFormOpen}
        title={editing ? 'Edit task' : 'Add task'}
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
            label="Title"
            required
            autoFocus
            value={form.title}
            onChange={update('title')}
            error={fieldErrors.title}
            placeholder="Order bathroom tiles"
          />

          <Input
            label="Due date (optional)"
            type="date"
            value={form.dueDate}
            onChange={update('dueDate')}
            error={fieldErrors.duedate}
          />

          <Select
            label="Status"
            value={form.status}
            onChange={update('status')}
            error={fieldErrors.status}
            options={TASK_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          />

          <Textarea
            label="Notes"
            value={form.description}
            onChange={update('description')}
            error={fieldErrors.description}
            placeholder="Any detail worth remembering"
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
              {editing ? 'Save changes' : 'Add task'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete task"
        message={`Delete "${deleting?.title}"? This cannot be undone.`}
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
