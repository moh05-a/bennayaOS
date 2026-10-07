import { MoneyFigure } from './MoneyFigure'

interface StatCardProps {
  label: string
  value: string
  /** Optional supporting line, e.g. "of 185,750 JOD". */
  hint?: string
  tone?: 'default' | 'positive' | 'warning'
}

const TONE_CLASSES = {
  default: 'text-slate-900',
  positive: 'text-emerald-700',
  warning: 'text-amber-700',
} as const

/**
 * The financial tiles. Numbers are the point, so the value is the largest
 * element and uses tabular-nums to keep digits aligned across cards.
 */
export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-[13px] text-slate-500">{label}</p>
      <MoneyFigure value={value} className={`text-2xl ${TONE_CLASSES[tone]}`} />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
