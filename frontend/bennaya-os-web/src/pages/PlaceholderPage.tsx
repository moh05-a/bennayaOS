import { PageHeader } from '../components/ui/PageHeader'

/** Used for nav sections we have not built yet, so links never dead-end. */
export function PlaceholderPage({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={title} />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <p className="text-sm text-slate-500">{title} arrives in {phase}.</p>
      </div>
    </div>
  )
}
