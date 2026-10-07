import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { MoneyFigure } from '../components/ui/MoneyFigure'
import { MoneyRow } from '../components/ui/MoneyRow'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Spinner } from '../components/ui/Spinner'
import { StatCard } from '../components/ui/StatCard'
import { STATUS_STYLES } from '../components/ui/statusStyles'
import { dashboardApi } from '../services/dashboardApi'
import { tasksApi } from '../services/tasksApi'
import { ApiError } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useCurrency } from '../hooks/useCurrency'
import { useLanguage } from '../hooks/useLanguage'
import { LANGUAGES } from '../i18n'
import { invalidateProjectFinancials } from '../utils/invalidate'
import type { UpcomingTask } from '../types/dashboard'
import { ExpenseFormModal } from './projects/ExpenseFormModal'
import { PaymentFormModal } from './projects/PaymentFormModal'

const CARD = 'rounded-xl border border-slate-200 bg-white shadow-sm'

export function DashboardPage() {
  const { session } = useAuth()
  const { format } = useCurrency()
  const { t, formatDate, language } = useLanguage()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [quickAdd, setQuickAdd] = useState<'expense' | 'payment' | null>(null)
  // Ticked tasks show as done straight away; the refetch then drops them.
  const [tickedIds, setTickedIds] = useState<ReadonlySet<string>>(new Set())
  const [taskError, setTaskError] = useState<string | null>(null)

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ signal }) => dashboardApi.get(signal),
  })

  // PUT replaces the whole task, so everything except the status is sent back
  // unchanged.
  const completeTask = useMutation({
    mutationFn: (task: UpcomingTask) =>
      tasksApi.update(task.id, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        status: 'Completed',
      }),
    onSuccess: (_, task) => invalidateProjectFinancials(queryClient, task.projectId),
    onError: (caught: unknown, task) => {
      setTickedIds((current) => {
        const next = new Set(current)
        next.delete(task.id)
        return next
      })
      setTaskError(caught instanceof ApiError ? caught.message : t('dashboard.taskUpdateError'))
    },
  })

  const tickTask = (task: UpcomingTask) => {
    if (tickedIds.has(task.id)) return
    setTaskError(null)
    setTickedIds((current) => new Set(current).add(task.id))
    completeTask.mutate(task)
  }

  // "Mohammad Ali" -> "Mohammad". Warmer than the full name on every visit.
  const firstName = session?.user.fullName.split(' ')[0] ?? ''

  // "Tuesday, 6 October · Bennaya Contracting"
  const today = new Date().toLocaleDateString(LANGUAGES[language].dateLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const eyebrow = [today, session?.company.name].filter(Boolean).join(' · ')

  if (isPending) return <Spinner label={t('dashboard.loading')} />

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-6xl">
        <ErrorMessage
          message={error instanceof ApiError ? error.message : t('dashboard.loadError')}
        />
      </div>
    )
  }

  const hasProjects = data.totalProjects > 0
  const cashIsNegative = data.netCashPosition < 0
  const collectedPercent =
    data.totalContractValue > 0 ? (data.totalReceived / data.totalContractValue) * 100 : 0

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={t('dashboard.welcome', { name: firstName })}
        eyebrow={eyebrow}
        action={
          hasProjects && (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setQuickAdd('expense')}>
                {t('dashboard.quickExpense')}
              </Button>
              <Button variant="secondary" onClick={() => setQuickAdd('payment')}>
                {t('dashboard.quickPayment')}
              </Button>
              <Button onClick={() => navigate('/projects/new')}>{t('projects.new')}</Button>
            </div>
          )
        }
      />

      {!hasProjects ? (
        <EmptyState
          title={t('dashboard.emptyTitle')}
          description={t('dashboard.emptyDescription')}
          action={<Button onClick={() => navigate('/clients')}>{t('dashboard.addClient')}</Button>}
        />
      ) : (
        <div className="space-y-5">
          {/* Anything that needs attention goes ABOVE the numbers. */}
          {data.projectsOverBudget > 0 && (
            <Link
              to="/projects"
              className="block rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 hover:bg-red-100"
            >
              <span className="font-semibold">
                {t('dashboard.projectsOverBudget', { count: data.projectsOverBudget })}
              </span>{' '}
              {t('dashboard.overBudgetDetail')}
            </Link>
          )}

          {data.overdueTaskCount > 0 && (
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="font-semibold">
                {t('dashboard.tasksOverdue', { count: data.overdueTaskCount })}
              </span>{' '}
              {t('dashboard.overdueDetail')}
            </div>
          )}

          {/* THE MONEY BAND: the four totals a contractor opens the app for. */}
          <div className="flex flex-col gap-5 rounded-2xl bg-slate-900 px-6 py-6 text-white sm:px-7">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <p className="text-[13px] text-[#aeb5c2]">{t('money.contractValue')}</p>
                <MoneyFigure value={format(data.totalContractValue)} className="text-2xl sm:text-[28px]" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[13px] text-[#aeb5c2]">{t('money.received')}</p>
                <MoneyFigure
                  value={format(data.totalReceived)}
                  className="text-2xl text-[#5fd3a3] sm:text-[28px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[13px] text-[#aeb5c2]">{t('money.outstanding')}</p>
                <MoneyFigure
                  value={format(data.totalOutstanding)}
                  className="text-2xl text-[#f2b36b] sm:text-[28px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[13px] text-[#aeb5c2]">{t('money.netCashPosition')}</p>
                <MoneyFigure
                  value={format(data.netCashPosition)}
                  className={`text-2xl sm:text-[28px] ${cashIsNegative ? 'text-[#f19a8a]' : ''}`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-[13px] text-[#aeb5c2]">
                <span>
                  {t('dashboard.collectedOfContract', { percent: `${collectedPercent.toFixed(0)}%` })}
                </span>
                <span>{t('dashboard.netCashHint')}</span>
              </div>
              <ProgressBar
                percent={collectedPercent}
                colorClass="bg-[#5fd3a3]"
                trackClass="bg-[#2c3342]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label={t('dashboard.activeProjects')}
              value={String(data.activeProjects)}
              hint={t('dashboard.totalProjects', { count: data.totalProjects })}
            />

            <div className={`flex flex-col gap-2 px-5 py-4 ${CARD}`}>
              <p className="text-[13px] text-slate-500">{t('money.totalSpent')}</p>
              <MoneyFigure value={format(data.totalExpenses)} className="text-2xl text-slate-900" />
              <div className="flex flex-wrap gap-1.5">
                {data.projectsByStatus.map((entry) => (
                  <span
                    key={entry.status}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[entry.status] ?? STATUS_STYLES.Planning
                    }`}
                  >
                    {t(`projectStatus.${entry.status}`)} {entry.count}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-2">
            {/* RECENT EXPENSES */}
            <section className={CARD}>
              <h2 className="px-5 py-4 text-base font-semibold text-slate-900">
                {t('dashboard.recentExpenses')}
              </h2>

              {data.recentExpenses.length === 0 ? (
                <p className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">
                  {t('dashboard.noExpenses')}
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 border-t border-slate-100">
                  {data.recentExpenses.map((expense) => (
                    <li key={expense.id}>
                      <MoneyRow
                        direction="out"
                        to={`/projects/${expense.projectId}`}
                        title={expense.description ?? t(`expenseCategory.${expense.category}`)}
                        subtitle={`${formatDate(expense.date)} · ${expense.projectName}`}
                        amount={format(expense.amount)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* RECENT PAYMENTS */}
            <section className={CARD}>
              <h2 className="px-5 py-4 text-base font-semibold text-slate-900">
                {t('dashboard.recentPayments')}
              </h2>

              {data.recentPayments.length === 0 ? (
                <p className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">
                  {t('dashboard.noPayments')}
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 border-t border-slate-100">
                  {data.recentPayments.map((payment) => (
                    <li key={payment.id}>
                      <MoneyRow
                        direction="in"
                        to={`/projects/${payment.projectId}`}
                        title={payment.description ?? t('money.clientPayment')}
                        subtitle={`${formatDate(payment.date)} · ${payment.projectName}`}
                        amount={format(payment.amount)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {data.upcomingTasks.length > 0 && (
            <section className={CARD}>
              <h2 className="px-5 py-4 text-base font-semibold text-slate-900">
                {t('dashboard.upcomingTasks')}
              </h2>
              {taskError && (
                <p className="border-t border-slate-100 px-5 py-3 text-sm text-red-700">
                  {taskError}
                </p>
              )}
              <ul className="divide-y divide-slate-100 border-t border-slate-100">
                {data.upcomingTasks.map((task) => {
                  const isTicked = tickedIds.has(task.id)

                  return (
                    <li key={task.id} className="flex items-start gap-3 ps-5 hover:bg-slate-50">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isTicked}
                        aria-label={t('dashboard.markDone', { title: task.title })}
                        onClick={() => tickTask(task)}
                        className={`mt-3.5 flex size-4.5 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition ${
                          isTicked
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : task.isOverdue
                              ? 'border-red-400 bg-white hover:border-red-500'
                              : 'border-slate-300 bg-white hover:border-slate-500'
                        }`}
                      >
                        {isTicked && (
                          <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                            <path
                              d="M2.5 6.2 5 8.5l4.5-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                      <Link
                        to={`/projects/${task.projectId}`}
                        className="flex min-w-0 flex-1 items-start gap-3 py-3 pe-5"
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm font-medium ${
                              isTicked ? 'text-slate-400 line-through' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="truncate text-xs text-slate-500">{task.projectName}</p>
                        </div>
                      <p
                        className={`shrink-0 whitespace-nowrap text-xs font-semibold ${
                          task.isOverdue ? 'text-red-500' : 'text-slate-500'
                        }`}
                      >
                        {task.dueDate
                          ? task.isOverdue
                            ? t('dashboard.overdueOn', { date: formatDate(task.dueDate) })
                            : formatDate(task.dueDate)
                          : t('dashboard.noDueDate')}
                      </p>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          <p className="text-xs text-slate-400">{t('dashboard.footnote')}</p>
        </div>
      )}

      {/* Quick add: the same forms as the project tabs, with a project picker. */}
      <ExpenseFormModal
        isOpen={quickAdd === 'expense'}
        projectId={null}
        expense={null}
        onClose={() => setQuickAdd(null)}
      />
      <PaymentFormModal
        isOpen={quickAdd === 'payment'}
        projectId={null}
        payment={null}
        onClose={() => setQuickAdd(null)}
      />
    </div>
  )
}
