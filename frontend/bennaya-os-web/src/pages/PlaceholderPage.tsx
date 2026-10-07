import { PageHeader } from '../components/ui/PageHeader'
import { useLanguage } from '../hooks/useLanguage'

/** Used for nav sections we have not built yet, so links never dead-end. */
export function PlaceholderPage({ title, phase }: { title: string; phase: string }) {
  const { t } = useLanguage()

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={title} />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <p className="text-sm text-slate-500">{t('common.arrivesIn', { title, phase })}</p>
      </div>
    </div>
  )
}
