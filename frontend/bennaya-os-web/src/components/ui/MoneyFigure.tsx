interface MoneyFigureProps {
  /** Already formatted, e.g. "JOD 1,250.500". */
  value: string
  /** Sets the size and colour of the whole figure. */
  className?: string
}

// Left-to-right, right-to-left and Arabic letter marks the Arabic locale adds.
const BIDI_MARKS = /[‎‏؜]/g

const stripMarks = (text: string) => text.replace(BIDI_MARKS, '').trim()

/**
 * Large money figures: the whole part is prominent, the currency and the
 * fils (decimals) are smaller and lighter so the eye lands on the amount.
 * Plain counts (no decimal point) are shown as they are.
 */
export function MoneyFigure({ value, className = '' }: MoneyFigureProps) {
  const match = /^(.*?)(-?[\d,]+)(\.\d+)(.*)$/.exec(value)

  if (!match) {
    return <p className={`font-semibold tabular-nums ${className}`}>{value}</p>
  }

  const [, rawBefore = '', whole = '', decimals = '', after = ''] = match
  // "-JOD 1,250.500": the minus belongs with the big number, not the code.
  const isNegative = /^\s*[-−]/.test(stripMarks(rawBefore))
  const before = stripMarks(stripMarks(rawBefore).replace(/^[-−]/, ''))
  const unit = stripMarks(after)

  return (
    <p className={`font-semibold tabular-nums ${className}`}>
      {isNegative && <span>−</span>}
      {before && <span className="me-1 text-[0.5em] font-medium opacity-70">{before}</span>}
      <span>{whole}</span>
      <span className="text-[0.6em] opacity-60">{decimals}</span>
      {unit && <span className="ms-1 text-[0.5em] font-medium opacity-70">{unit}</span>}
    </p>
  )
}
