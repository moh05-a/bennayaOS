import { PageHeader } from '../components/ui/PageHeader'
import { useAuth } from '../hooks/useAuth'

/**
 * Placeholder until Phase 9. Deliberately shows no fake numbers - inventing
 * data that is not real is how people stop trusting a financial tool.
 */
export function DashboardPage() {
  const { session } = useAuth()

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={`Welcome, ${session?.user.fullName.split(' ')[0]}`}
        description={session?.company.name}
      />

      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <h3 className="text-sm font-semibold text-slate-900">Dashboard coming in Phase 9</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          Once projects, expenses and payments exist, this becomes your financial summary.
        </p>
      </div>
    </div>
  )
}
