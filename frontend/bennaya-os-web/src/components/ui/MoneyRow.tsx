import { Link } from 'react-router-dom'

interface MoneyRowProps {
  /** Money coming in (client payment) or going out (expense). */
  direction: 'in' | 'out'
  title: string
  subtitle: string
  /** Already formatted amount, without a sign. */
  amount: string
  /** When set, the whole row links here. */
  to?: string
}

/**
 * One line in an activity list: a small +/− tile, what it was, and how much.
 * Money in is green; money out stays in ink so the page is not a wall of red.
 */
export function MoneyRow({ direction, title, subtitle, amount, to }: MoneyRowProps) {
  const isIn = direction === 'in'

  const content = (
    <>
      <span
        aria-hidden
        className={`flex size-7.5 shrink-0 items-center justify-center rounded-lg text-[15px] font-semibold ${
          isIn ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
        }`}
      >
        {isIn ? '+' : '−'}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-900">{title}</span>
        <span className="block truncate text-xs text-slate-500">{subtitle}</span>
      </span>
      <span
        className={`shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums ${
          isIn ? 'text-emerald-700' : 'text-slate-900'
        }`}
      >
        {isIn ? '+' : '−'} {amount}
      </span>
    </>
  )

  const className = 'flex items-center gap-3 px-5 py-3'

  return to ? (
    <Link to={to} className={`${className} hover:bg-slate-50`}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  )
}
