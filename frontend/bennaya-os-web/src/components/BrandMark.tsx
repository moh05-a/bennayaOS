import logoFull from '../assets/logo-full.png'
import logoMark from '../assets/logo-mark.png'

interface BrandMarkProps {
  size?: number
  /**
   * 'mark': the Arabic wordmark and orange bar - for small spots, where the
   * name is written next to it. 'full': adds "BennayaOS" underneath.
   */
  variant?: 'mark' | 'full'
}

/**
 * The BennayaOS logo on a dark rounded tile. The logo itself is off-white and
 * orange on transparent, so it always needs the dark backdrop.
 */
export function BrandMark({ size = 30, variant = 'mark' }: BrandMarkProps) {
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center bg-slate-900"
      // Corner radius and padding scale with the tile, so it looks the same
      // at 34px in the sidebar and 96px on the sign-in page.
      style={{ width: size, height: size, padding: size * 0.14, borderRadius: size * 0.24 }}
    >
      <img src={variant === 'full' ? logoFull : logoMark} alt="" className="size-full" />
    </div>
  )
}

/** Logo mark plus the product name. */
export function BrandLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark size={34} />
      <span className="text-base font-semibold tracking-tight text-slate-900">BennayaOS</span>
    </div>
  )
}
