import { useLanguage } from '../../hooks/useLanguage'

export function Spinner({ label }: { label?: string }) {
  const { t } = useLanguage()

  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
      <span
        aria-hidden
        className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"
      />
      <span>{label ?? t('common.loading')}...</span>
    </div>
  )
}
