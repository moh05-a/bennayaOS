import { useQuery } from '@tanstack/react-query'
import { StatCard } from '../../components/ui/StatCard'
import { expensesApi } from '../../services/expensesApi'
import { paymentsApi } from '../../services/paymentsApi'
import { useCurrency } from '../../hooks/useCurrency'
import { formatDate } from '../../utils/format'
import type { ProjectDetail } from '../../types/project'

interface ProgressBarProps {
  label: string
  percent: number
  colorClass: string
}

function ProgressBar({ label, percent, colorClass }: ProgressBarProps) {
  // Clamped for the bar width only; the caller still shows the true percentage.
  const width = Math.min(100, Math.max(0, percent))

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium tabular-nums text-slate-900">{percent.toFixed(0)}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full transition-all ${colorClass}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

export function OverviewTab({ project }: { project: ProjectDetail }) {
  const { format } = useCurrency()

  // These reuse the same query keys as the Expenses and Payments tabs, so
  // TanStack serves them from cache if those tabs were already opened - and
  // warms the cache if not. No new backend endpoint needed.
  const { data: expenses } = useQuery({
    queryKey: ['expenses', project.id],
    queryFn: ({ signal }) => expensesApi.listForProject(project.id, signal),
  })

  const { data: payments } = useQuery({
    queryKey: ['payments', project.id],
    queryFn: ({ signal }) => paymentsApi.listForProject(project.id, signal),
  })

  const isOverpaid = project.outstandingBalance < 0
  const isOverBudget = project.totalSpent > project.contractValue
  const cashIsNegative = project.netCashPosition < 0

  const collectedPercent =
    project.contractValue > 0 ? (project.totalReceived / project.contractValue) * 100 : 0
  const spentPercent =
    project.contractValue > 0 ? (project.totalSpent / project.contractValue) * 100 : 0

  // Merge both money streams into one dated timeline, newest first.
  const recentActivity = [
    ...(expenses?.items ?? []).map((e) => ({
      id: e.id,
      kind: 'expense' as const,
      date: e.date,
      amount: e.amount,
      label: e.description ?? e.category,
      detail: e.category,
    })),
    ...(payments?.items ?? []).map((p) => ({
      id: p.id,
      kind: 'payment' as const,
      date: p.date,
      amount: p.amount,
      label: p.description ?? 'Client payment',
      detail: 'Payment received',
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)

  return (
    <div className="space-y-5">
      {/* THE FOUR NUMBERS a contractor opens the app to see. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Contract value" value={format(project.contractValue)} />
        <StatCard label="Received" value={format(project.totalReceived)} tone="positive" />
        <StatCard
          label="Spent"
          value={format(project.totalSpent)}
          hint={
            project.totalSubcontractorPaid > 0
              ? `incl. ${format(project.totalSubcontractorPaid)} to subcontractors`
              : undefined
          }
          tone={isOverBudget ? 'warning' : 'default'}
        />
        <StatCard
          label={isOverpaid ? 'Overpaid by' : 'Outstanding'}
          value={format(Math.abs(project.outstandingBalance))}
          tone={isOverpaid ? 'positive' : 'warning'}
        />
      </div>

      {/* Net cash position - the one honest health signal we can compute. */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Net cash position
            </p>
            <p
              className={`mt-1 text-2xl font-semibold tabular-nums ${
                cashIsNegative ? 'text-red-700' : 'text-emerald-700'
              }`}
            >
              {format(project.netCashPosition)}
            </p>
            <p className="mt-1 max-w-md text-xs text-slate-500">
              Received minus spent. This is cash, not profit &mdash; it excludes work you have
              done but not yet invoiced, and costs you have committed but not yet paid.
            </p>
          </div>

          {cashIsNegative && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:max-w-56">
              You have spent more than you have collected on this project. Consider invoicing
              the next milestone.
            </p>
          )}
        </div>

        {project.totalSubcontractorRemaining > 0 && (
          <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-xs text-slate-600">
              Still owed to subcontractors:{' '}
              <span className="font-semibold tabular-nums text-slate-900">
                {format(project.totalSubcontractorRemaining)}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Projected margin after that commitment:{' '}
              <span
                className={`font-semibold tabular-nums ${
                  project.projectedMargin < 0 ? 'text-red-700' : 'text-slate-900'
                }`}
              >
                {format(project.projectedMargin)}
              </span>{' '}
              &mdash; a ceiling, since further materials and labour are not yet recorded.
            </p>
          </div>
        )}

        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
          <ProgressBar
            label="Collected from client"
            percent={collectedPercent}
            colorClass="bg-emerald-500"
          />
          <ProgressBar
            label="Spent against contract value"
            percent={spentPercent}
            colorClass={isOverBudget ? 'bg-red-500' : 'bg-slate-700'}
          />
        </div>

        {isOverBudget && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            Costs have exceeded the contract value by{' '}
            {format(project.totalSpent - project.contractValue)}. This project is losing money
            on costs alone.
          </p>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{project.description}</p>
        </div>
      )}

      {/* Recent activity across both money streams */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
        </div>

        {recentActivity.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No expenses or payments recorded yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentActivity.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{entry.label}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(entry.date)} &middot; {entry.detail}
                  </p>
                </div>
                <p
                  className={`shrink-0 text-sm font-semibold tabular-nums ${
                    entry.kind === 'payment' ? 'text-emerald-700' : 'text-slate-900'
                  }`}
                >
                  {entry.kind === 'payment' ? '+' : '−'} {format(entry.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
