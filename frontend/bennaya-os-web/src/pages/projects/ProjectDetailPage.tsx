import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { Spinner } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { projectsApi } from '../../services/projectsApi'
import { ApiError } from '../../services/api'
import { useCurrency } from '../../hooks/useCurrency'
import { formatDate } from '../../utils/format'
import { ExpensesTab } from './ExpensesTab'
import { OverviewTab } from './OverviewTab'
import { PaymentsTab } from './PaymentsTab'
import { SubcontractorsTab } from './SubcontractorsTab'
import { TasksTab } from './TasksTab'

/** Tabs are declared here; each one lights up as its phase lands. */
const TABS = [
  // phase: null means the tab is built and has real content.
  { id: 'overview', label: 'Overview', phase: null },
  { id: 'expenses', label: 'Expenses', phase: null },
  { id: 'payments', label: 'Payments', phase: null },
  { id: 'subcontractors', label: 'Subcontractors', phase: null },
  { id: 'materials', label: 'Materials', phase: 'Phase 13' },
  { id: 'tasks', label: 'Tasks', phase: null },
] as const

type TabId = (typeof TABS)[number]['id']

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { format } = useCurrency()

  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data: project, isPending, isError, error } = useQuery({
    queryKey: ['projects', id],
    queryFn: ({ signal }) => projectsApi.getById(id!, signal),
    enabled: Boolean(id),
  })

  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.remove(id!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      navigate('/projects', { replace: true })
    },
    onError: (caught: unknown) => {
      setDeleteError(
        caught instanceof ApiError ? caught.message : 'Could not delete this project.',
      )
    },
  })

  if (isPending) return <Spinner label="Loading project" />

  if (isError || !project) {
    return (
      <div className="mx-auto max-w-4xl">
        <ErrorMessage
          message={error instanceof ApiError ? error.message : 'Could not load this project.'}
        />
        <Link
          to="/projects"
          className="mt-4 inline-block text-sm font-medium text-slate-900 underline underline-offset-4"
        >
          Back to projects
        </Link>
      </div>
    )
  }

  const activeTabMeta = TABS.find((tab) => tab.id === activeTab)

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/projects"
        className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-900"
      >
        &larr; Projects
      </Link>

      {/* HEADER */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold text-slate-900">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>

            <p className="mt-1 text-sm text-slate-600">
              {project.clientName}
              {project.clientPhone && (
                <>
                  {' · '}
                  <a
                    href={`tel:${project.clientPhone}`}
                    className="underline underline-offset-2"
                  >
                    {project.clientPhone}
                  </a>
                </>
              )}
            </p>

            {project.location && (
              <p className="mt-0.5 text-sm text-slate-500">{project.location}</p>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" onClick={() => navigate(`/projects/${project.id}/edit`)}>
              Edit
            </Button>
            <Button variant="ghost" onClick={() => setIsConfirmingDelete(true)}>
              Delete
            </Button>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Contract value
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
              {format(project.contractValue)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Start</dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(project.startDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Expected end
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(project.expectedEndDate)}</dd>
          </div>
        </dl>
      </div>

      {/* TABS - horizontally scrollable on phones rather than wrapping badly */}
      <div className="mt-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-1 border-b border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {activeTab === 'expenses' ? (
          <ExpensesTab projectId={project.id} />
        ) : activeTab === 'payments' ? (
          <PaymentsTab projectId={project.id} />
        ) : activeTab === 'subcontractors' ? (
          <SubcontractorsTab projectId={project.id} />
        ) : activeTab === 'tasks' ? (
          <TasksTab projectId={project.id} />
        ) : activeTab === 'overview' ? (
          <OverviewTab project={project} />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-sm text-slate-500">
              {activeTabMeta?.label} arrives in {activeTabMeta?.phase}.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmingDelete}
        title="Delete project"
        message={
          deleteError ??
          (project.expenseCount > 0 || project.paymentCount > 0 || project.subcontractorCount > 0
            ? `Delete "${project.name}"? This also deletes ${project.expenseCount} expense(s), ${project.paymentCount} payment(s) and ${project.subcontractorCount} subcontractor(s). This cannot be undone.`
            : `Delete "${project.name}"? This cannot be undone.`)
        }
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => {
          setIsConfirmingDelete(false)
          setDeleteError(null)
        }}
      />
    </div>
  )
}
