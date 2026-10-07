/**
 * The BennayaOS logo: a dark rounded square with a "B" and an orange
 * foundation line along the bottom.
 */
export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <div
      aria-hidden
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-900 font-bold text-white"
      style={{ width: size, height: size, fontSize: size / 2 }}
    >
      B
      <div className="absolute inset-x-0 bottom-0 bg-accent" style={{ height: size / 7.5 }} />
    </div>
  )
}

/** Logo mark plus the product name. */
export function BrandLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark />
      <span className="text-base font-semibold tracking-tight text-slate-900">BennayaOS</span>
    </div>
  )
}
