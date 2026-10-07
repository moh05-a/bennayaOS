import { useQuery } from '@tanstack/react-query'
import { MoneyFigure } from '../../components/ui/MoneyFigure'
import { MoneyRow } from '../../components/ui/MoneyRow'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { expensesApi } from '../../services/expensesApi'
import { paymentsApi } from '../../services/paymentsApi'
import { useCurrency } from '../../hooks/useCurrency'
import { useLanguage } from '../../hooks/useLanguage'
import type { ProjectDetail } from '../../types/project'
import { projectSchedule } from '../../utils/schedule'

const CARD = 'rounded-xl border border-slate-200 bg-white shadow-sm'

interface StatCellProps {
  label: string
  value: string
  hint?: string
  colorClass?: string
}

/** One cell of the joined stat strip at the top of the overview. */
function StatCell({ label, value, hint, colorClass = 'text-slate-900' }: StatCellProps) {
  return (
    <div className="flex flex-col gap-2 bg-white px-5 py-4">
      <p className="text-[13px] text-slate-500">{label}</p>
      <MoneyFigure value={value} className={`text-2xl ${colorClass}`} />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
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
  const schedule = projectSchedule(project.startDate, project.expectedEndDate)

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
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <StatCell label={t('money.contractValue')} value={format(project.contractValue)} />
        <StatCell
          label={t('money.received')}
          value={format(project.totalReceived)}
          colorClass="text-emerald-700"
        />
        <StatCell
          label={t('money.spent')}
          value={format(project.totalSpent)}
          hint={
            project.totalSubcontractorPaid > 0
              ? t('overview.inclSubcontractors', {
                  amount: format(project.totalSubcontractorPaid),
                })
              : undefined
          }
          colorClass={isOverBudget ? 'text-amber-700' : 'text-slate-900'}
        />
        <StatCell
          label={isOverpaid ? t('money.overpaidBy') : t('money.outstanding')}
          value={format(Math.abs(project.outstandingBalance))}
          colorClass={isOverpaid ? 'text-emerald-700' : 'text-amber-700'}
        />
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        {/* Net cash position - the one honest health signal we can compute. */}
        <div className={`flex flex-col gap-5 px-6 py-5 ${CARD}`}>
          <div className="flex flex-col gap-1.5">
            <p className="text-[13px] text-slate-500">{t('money.netCashPosition')}</p>
            <MoneyFigure
              value={format(project.netCashPosition)}
              className={`text-3xl ${cashIsNegative ? 'text-red-500' : 'text-emerald-700'}`}
            />
            <p className="text-[13px] leading-relaxed text-slate-500">
              {t('overview.netCashHint')}
            </p>
          </div>

          {cashIsNegative && (
            <p className="rounded-[10px] bg-amber-50 px-3.5 py-3 text-[13px] leading-relaxed text-amber-800">
              {t('overview.spentMoreThanCollected')}
            </p>
          )}

          <div className="flex flex-col gap-3.5 border-t border-slate-100 pt-4">
            {schedule && (
              <ProgressBar
                label={t('overview.scheduleElapsed')}
                percent={schedule.elapsedPercent}
                colorClass="bg-slate-900"
              />
            )}
            <ProgressBar
              label={t('overview.spentAgainstContract')}
              percent={spentPercent}
              colorClass={isOverBudget ? 'bg-red-500' : 'bg-slate-500'}
            />
            <ProgressBar
              label={t('overview.collectedFromClient')}
              percent={collectedPercent}
              colorClass="bg-emerald-500"
            />
          </div>

          {isOverBudget && (
            <p className="rounded-[10px] bg-red-50 px-3.5 py-3 text-[13px] leading-relaxed text-red-700">
              {t('overview.overBudget', {
                amount: format(project.totalSpent - project.contractValue),
              })}
            </p>
          )}

          {project.totalSubcontractorRemaining > 0 && (
            <div className="flex flex-col gap-1 rounded-[10px] bg-slate-50 px-4 py-3.5 text-[13px]">
              <p className="text-slate-600">
                {t('overview.stillOwedToSubcontractors')}{' '}
                <span className="font-semibold tabular-nums text-slate-900">
                  {format(project.totalSubcontractorRemaining)}
                </span>
              </p>
              <p className="text-slate-500">
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
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          {/* Description */}
          {project.description && (
            <div className={`px-5 py-4 ${CARD}`}>
              <h2 className="text-[15px] font-semibold text-slate-900">
                {t('fields.description')}
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {project.description}
              </p>
            </div>
          )}

          {/* Recent activity across both money streams */}
          <section className={CARD}>
            <h2 className="px-5 py-4 text-[15px] font-semibold text-slate-900">
              {t('overview.recentActivity')}
            </h2>

            {recentActivity.length === 0 ? (
              <p className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">
                {t('overview.noActivity')}
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 border-t border-slate-100">
                {recentActivity.map((entry) => (
                  <li key={entry.id}>
                    <MoneyRow
                      direction={entry.kind === 'payment' ? 'in' : 'out'}
                      title={entry.label}
                      subtitle={`${formatDate(entry.date)} · ${entry.detail}`}
                      amount={format(entry.amount)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
