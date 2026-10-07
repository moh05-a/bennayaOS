import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { MoneyFigure } from '../../components/ui/MoneyFigure'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Spinner } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { projectsApi } from '../../services/projectsApi'
import { ApiError } from '../../services/api'
import { useCurrency } from '../../hooks/useCurrency'
import { useLanguage } from '../../hooks/useLanguage'
import { projectSchedule } from '../../utils/schedule'
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
  const schedule = projectSchedule(project.startDate, project.expectedEndDate)

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to="/projects"
        className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-900"
      >
        {t('projects.backLink')}
      </Link>

      {/* HEADER */}
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:px-7 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[26px]">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>

            <p className="mt-1.5 text-sm text-slate-600">
              {project.clientName}
              {project.clientPhone && (
                <>
                  {' · '}
                  <a
                    href={`tel:${project.clientPhone}`}
                    className="underline-offset-2 hover:underline"
                  >
                    <span dir="ltr">{project.clientPhone}</span>
                  </a>
                </>
              )}
              {project.location && <> · {project.location}</>}
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" onClick={() => navigate(`/projects/${project.id}/edit`)}>
              {t('common.edit')}
            </Button>
            <Button variant="dangerGhost" onClick={() => setIsConfirmingDelete(true)}>
              {t('common.delete')}
            </Button>
          </div>
        </div>

        <div className="grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-[auto_1fr] sm:gap-8">
          <div className="flex flex-col gap-1">
            <p className="text-[13px] text-slate-500">{t('money.contractValue')}</p>
            <MoneyFigure value={format(project.contractValue)} className="text-xl text-slate-900" />
          </div>

          {/* Timeline: start, where today falls, expected end. */}
          <div className="flex flex-col justify-end gap-2">
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-[13px] text-slate-600">
              <span>
                {t('projects.start')}{' '}
                <b className="font-semibold text-slate-900">{formatDate(project.startDate)}</b>
              </span>
              {schedule && (
                <span className="font-semibold text-slate-900">
                  {schedule.state === 'upcoming'
                    ? t('projects.startsIn', { count: schedule.daysUntilStart })
                    : schedule.state === 'overrun'
                      ? t('projects.daysPastEnd', { count: schedule.daysPastEnd })
                      : `${t('projects.dayOf', { day: schedule.day, total: schedule.totalDays })} · ${t('projects.daysLeft', { count: schedule.daysLeft })}`}
                </span>
              )}
              <span>
                {t('projects.expectedEnd')}{' '}
                <b className="font-semibold text-slate-900">
                  {formatDate(project.expectedEndDate)}
                </b>
              </span>
            </div>
            {schedule && (
              <ProgressBar
                percent={schedule.elapsedPercent}
                colorClass={schedule.state === 'overrun' ? 'bg-red-500' : 'bg-slate-900'}
              />
            )}
          </div>
        </div>
      </div>

      {/* TABS - horizontally scrollable on phones rather than wrapping badly */}
      <div className="mt-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-0.5 border-b border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-3 text-sm transition ${
                activeTab === tab.id
                  ? 'border-slate-900 font-semibold text-slate-900'
                  : 'border-transparent font-medium text-slate-500 hover:text-slate-900'
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
