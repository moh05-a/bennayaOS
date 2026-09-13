import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { PageHeader } from '../components/ui/PageHeader'
import { Spinner } from '../components/ui/Spinner'
import { StatCard } from '../components/ui/StatCard'
import { dashboardApi } from '../services/dashboardApi'
import { ApiError } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useCurrency } from '../hooks/useCurrency'
import { formatDate } from '../utils/format'

const STATUS_STYLES: Record<string, string> = {
  Planning: 'bg-slate-100 text-slate-700',
  Active: 'bg-emerald-50 text-emerald-700',
  OnHold: 'bg-amber-50 text-amber-700',
  Completed: 'bg-blue-50 text-blue-700',
  Cancelled: 'bg-red-50 text-red-700',
}

export function DashboardPage() {
  const { session } = useAuth()
  const { format } = useCurrency()
  const navigate = useNavigate()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: ({ signal }) => dashboardApi.get(signal),
  })

  // "Mohammad Ali" -> "Mohammad". Warmer than the full name on every visit.
  const firstName = session?.user.fullName.split(' ')[0] ?? ''

  if (isPending) return <Spinner label="Loading dashboard" />

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-6xl">
        <ErrorMessage
          message={error instanceof ApiError ? error.message : 'Could not load your dashboard.'}
        />
      </div>
    )
  }

  const hasProjects = data.totalProjects > 0
  const cashIsNegative = data.netCashPosition < 0

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={`Welcome, ${firstName}`} description={session?.company.name} />

      {!hasProjects ? (
        <EmptyState
          title="Nothing to show yet"
          description="Add a client, then create your first project. Your financial summary appears here once money starts moving."
          action={<Button onClick={() => navigate('/clients')}>Add a client</Button>}
        />
      ) : (
        <div className="space-y-5">
          {/* Anything that needs attention goes ABOVE the numbers. */}
          {data.projectsOverBudget > 0 && (
            <Link
              to="/projects"
              className="block rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 hover:bg-red-100"
            >
              <span className="font-medium">
                {data.projectsOverBudget} project
                {data.projectsOverBudget === 1 ? '' : 's'} over budget
              </span>{' '}
              &mdash; direct costs have exceeded the contract value. View projects &rarr;
            </Link>
          )}

          {data.overdueTaskCount > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="font-medium">
                {data.overdueTaskCount} task{data.overdueTaskCount === 1 ? '' : 's'} overdue
              </span>{' '}
              &mdash; past the due date and not finished.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Active projects"
              value={String(data.activeProjects)}
              hint={`${data.totalProjects} total`}
            />
            <StatCard label="Contract value" value={format(data.totalContractValue)} />
            <StatCard label="Received" value={format(data.totalReceived)} tone="positive" />
            <StatCard label="Outstanding" value={format(data.totalOutstanding)} tone="warning" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Net cash position
              </p>
              <p
                className={`mt-1 text-2xl font-semibold tabular-nums ${
                  cashIsNegative ? 'text-red-700' : 'text-emerald-700'
                }`}
              >
                {format(data.netCashPosition)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Received minus spent across every project. Cash, not profit.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total spent
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {format(data.totalExpenses)}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {data.projectsByStatus.map((entry) => (
                  <span
                    key={entry.status}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      STATUS_STYLES[entry.status] ?? STATUS_STYLES.Planning
                    }`}
                  >
                    {entry.status} {entry.count}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* RECENT EXPENSES */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">Recent expenses</h2>
              </div>

              {data.recentExpenses.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-500">No expenses yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.recentExpenses.map((expense) => (
                    <li key={expense.id}>
                      <Link
                        to={`/projects/${expense.projectId}`}
                        className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {expense.description ?? expense.category}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {expense.projectName} &middot; {formatDate(expense.date)}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
                          {format(expense.amount)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* RECENT PAYMENTS */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">Recent payments</h2>
              </div>

              {data.recentPayments.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-500">
                  No payments recorded yet.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.recentPayments.map((payment) => (
                    <li key={payment.id}>
                      <Link
                        to={`/projects/${payment.projectId}`}
                        className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {payment.description ?? 'Client payment'}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {payment.projectName} &middot; {formatDate(payment.date)}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-emerald-700">
                          {format(payment.amount)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {data.upcomingTasks.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">Upcoming tasks</h2>
              </div>
              <ul className="divide-y divide-slate-100">
                {data.upcomingTasks.map((task) => (
                  <li key={task.id}>
                    <Link
                      to={`/projects/${task.projectId}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{task.title}</p>
                        <p className="truncate text-xs text-slate-500">{task.projectName}</p>
                      </div>
                      <p
                        className={`shrink-0 text-xs font-medium ${
                          task.isOverdue ? 'text-red-700' : 'text-slate-500'
                        }`}
                      >
                        {task.dueDate
                          ? `${task.isOverdue ? 'Overdue · ' : ''}${formatDate(task.dueDate)}`
                          : 'No due date'}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-slate-400">
            Money totals and tasks exclude cancelled projects.
          </p>
        </div>
      )}
    </div>
  )
}
