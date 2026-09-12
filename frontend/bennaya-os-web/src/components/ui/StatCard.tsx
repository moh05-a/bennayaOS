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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1.5 text-xl font-semibold tabular-nums ${TONE_CLASSES[tone]}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
