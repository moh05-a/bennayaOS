import { useQuery } from '@tanstack/react-query'
import { StatCard } from '../../components/ui/StatCard'
import { expensesApi } from '../../services/expensesApi'
import { paymentsApi } from '../../services/paymentsApi'
import { useCurrency } from '../../hooks/useCurrency'
import { useLanguage } from '../../hooks/useLanguage'
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
  const { t, formatDate } = useLanguage()

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
      label: e.description ?? t(`expenseCategory.${e.category}`),
      detail: t(`expenseCategory.${e.category}`),
    })),
    ...(payments?.items ?? []).map((p) => ({
      id: p.id,
      kind: 'payment' as const,
      date: p.date,
      amount: p.amount,
      label: p.description ?? t('money.clientPayment'),
      detail: t('overview.paymentReceived'),
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)

  return (
    <div className="space-y-5">
      {/* THE FOUR NUMBERS a contractor opens the app to see. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t('money.contractValue')} value={format(project.contractValue)} />
        <StatCard
          label={t('money.received')}
          value={format(project.totalReceived)}
          tone="positive"
        />
        <StatCard
          label={t('money.spent')}
          value={format(project.totalSpent)}
          hint={
            project.totalSubcontractorPaid > 0
              ? t('overview.inclSubcontractors', {
                  amount: format(project.totalSubcontractorPaid),
                })
              : undefined
          }
          tone={isOverBudget ? 'warning' : 'default'}
        />
        <StatCard
          label={isOverpaid ? t('money.overpaidBy') : t('money.outstanding')}
          value={format(Math.abs(project.outstandingBalance))}
          tone={isOverpaid ? 'positive' : 'warning'}
        />
      </div>

      {/* Net cash position - the one honest health signal we can compute. */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('money.netCashPosition')}
            </p>
            <p
              className={`mt-1 text-2xl font-semibold tabular-nums ${
                cashIsNegative ? 'text-red-700' : 'text-emerald-700'
              }`}
            >
              {format(project.netCashPosition)}
            </p>
            <p className="mt-1 max-w-md text-xs text-slate-500">{t('overview.netCashHint')}</p>
          </div>

          {cashIsNegative && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:max-w-56">
              {t('overview.spentMoreThanCollected')}
            </p>
          )}
        </div>

        {project.totalSubcontractorRemaining > 0 && (
          <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-xs text-slate-600">
              {t('overview.stillOwedToSubcontractors')}{' '}
              <span className="font-semibold tabular-nums text-slate-900">
                {format(project.totalSubcontractorRemaining)}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {t('overview.projectedMargin')}{' '}
              <span
                className={`font-semibold tabular-nums ${
                  project.projectedMargin < 0 ? 'text-red-700' : 'text-slate-900'
                }`}
              >
                {format(project.projectedMargin)}
              </span>{' '}
              {t('overview.projectedMarginNote')}
            </p>
          </div>
        )}

        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
          <ProgressBar
            label={t('overview.collectedFromClient')}
            percent={collectedPercent}
            colorClass="bg-emerald-500"
          />
          <ProgressBar
            label={t('overview.spentAgainstContract')}
            percent={spentPercent}
            colorClass={isOverBudget ? 'bg-red-500' : 'bg-slate-700'}
          />
        </div>

        {isOverBudget && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {t('overview.overBudget', {
              amount: format(project.totalSpent - project.contractValue),
            })}
          </p>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">{t('fields.description')}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{project.description}</p>
        </div>
      )}

      {/* Recent activity across both money streams */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">{t('overview.recentActivity')}</h2>
        </div>

        {recentActivity.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            {t('overview.noActivity')}
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
