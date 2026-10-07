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
import { useLanguage } from '../../hooks/useLanguage'
import { ExpensesTab } from './ExpensesTab'
import { OverviewTab } from './OverviewTab'
import { PaymentsTab } from './PaymentsTab'
import { SubcontractorsTab } from './SubcontractorsTab'
import { TasksTab } from './TasksTab'
import { MaterialsTab } from './MaterialsTab'

/** Tabs are declared here; each one lights up as its phase lands. */
const TABS = [
  // phase: null means the tab is built and has real content.
  // Labels are translated: t(`projects.tabs.${id}`).
  { id: 'overview', phase: null },
  { id: 'expenses', phase: null },
  { id: 'payments', phase: null },
  { id: 'subcontractors', phase: null },
  { id: 'materials', phase: null },
  { id: 'tasks', phase: null },
] as const

type TabId = (typeof TABS)[number]['id']

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { format } = useCurrency()
  const { t, formatDate } = useLanguage()

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
        caught instanceof ApiError ? caught.message : t('projects.deleteError'),
      )
    },
  })

  if (isPending) return <Spinner label={t('projects.loadingProject')} />

  if (isError || !project) {
    return (
      <div className="mx-auto max-w-4xl">
        <ErrorMessage
          message={error instanceof ApiError ? error.message : t('projects.loadErrorOne')}
        />
        <Link
          to="/projects"
          className="mt-4 inline-block text-sm font-medium text-slate-900 underline underline-offset-4"
        >
          {t('projects.backToProjects')}
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
        {t('projects.backLink')}
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
                    <span dir="ltr">{project.clientPhone}</span>
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
              {t('common.edit')}
            </Button>
            <Button variant="ghost" onClick={() => setIsConfirmingDelete(true)}>
              {t('common.delete')}
            </Button>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('money.contractValue')}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
              {format(project.contractValue)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('projects.start')}
            </dt>
            <dd className="mt-1 text-sm text-slate-900">{formatDate(project.startDate)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('projects.expectedEnd')}
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
              {t(`projects.tabs.${tab.id}`)}
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
        ) : activeTab === 'materials' ? (
          <MaterialsTab projectId={project.id} />
        ) : activeTab === 'overview' ? (
          <OverviewTab project={project} />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-sm text-slate-500">
              {activeTabMeta &&
                t('common.arrivesIn', {
                  title: t(`projects.tabs.${activeTabMeta.id}`),
                  phase: String(activeTabMeta.phase),
                })}
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmingDelete}
        title={t('projects.deleteTitle')}
        message={
          deleteError ??
          (project.expenseCount > 0 || project.paymentCount > 0 || project.subcontractorCount > 0
            ? t('projects.deleteWithChildren', {
                name: project.name,
                expenses: project.expenseCount,
                payments: project.paymentCount,
                subcontractors: project.subcontractorCount,
              })
            : t('common.confirmDelete', { name: project.name }))
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
