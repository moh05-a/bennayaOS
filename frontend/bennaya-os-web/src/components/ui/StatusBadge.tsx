import { useLanguage } from '../../hooks/useLanguage'
import type { ProjectStatus } from '../../types/project'

const STYLES: Record<ProjectStatus, string> = {
  Planning: 'bg-slate-100 text-slate-700',
  Active: 'bg-emerald-50 text-emerald-700',
  OnHold: 'bg-amber-50 text-amber-700',
  Completed: 'bg-blue-50 text-blue-700',
  Cancelled: 'bg-red-50 text-red-700',
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { t } = useLanguage()

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}>
      {t(`projectStatus.${status}`)}
    </span>
  )
}
