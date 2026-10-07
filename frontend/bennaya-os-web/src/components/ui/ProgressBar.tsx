interface ProgressBarProps {
  /** Shown above the bar; omit for a bare bar. */
  label?: string
  /** The true percentage. The bar is clamped to 0-100, the label is not. */
  percent: number
  /** Colour of the filled part, e.g. "bg-emerald-500". */
  colorClass: string
  /** Colour of the empty track. */
  trackClass?: string
  /** Bar height, e.g. "h-1.5". */
  heightClass?: string
}

export function ProgressBar({
  label,
  percent,
  colorClass,
  trackClass = 'bg-slate-100',
  heightClass = 'h-2',
}: ProgressBarProps) {
  const width = Math.min(100, Math.max(0, percent))

  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-[13px]">
          <span className="text-slate-600">{label}</span>
          <span className="font-semibold tabular-nums text-slate-900">{percent.toFixed(0)}%</span>
        </div>
      )}
      <div className={`overflow-hidden rounded-full ${heightClass} ${trackClass}`}>
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
