import { useLanguage } from '../../hooks/useLanguage'
import type { ProjectStatus } from '../../types/project'
import { STATUS_STYLES } from './statusStyles'

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { t } = useLanguage()

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {t(`projectStatus.${status}`)}
    </span>
  )
}
