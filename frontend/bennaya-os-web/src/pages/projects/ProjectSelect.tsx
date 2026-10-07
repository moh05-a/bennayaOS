import { useQuery } from '@tanstack/react-query'
import { Select } from '../../components/ui/Select'
import { projectsApi } from '../../services/projectsApi'
import { useLanguage } from '../../hooks/useLanguage'

interface ProjectSelectProps {
  value: string
  onChange: (projectId: string) => void
}

/**
 * Project dropdown for forms opened outside a project (the dashboard's quick
 * "+ Expense" / "+ Payment"). Shares the ['projects'] cache with the Projects
 * page. Cancelled projects are left out, as they are on the dashboard.
 */
export function ProjectSelect({ value, onChange }: ProjectSelectProps) {
  const { t } = useLanguage()

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: ({ signal }) => projectsApi.list(signal),
  })

  return (
    <Select
      label={t('fields.project')}
      required
      autoFocus
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={t('fields.selectProject')}
      options={(projects ?? [])
        .filter((project) => project.status !== 'Cancelled')
        .map((project) => ({ value: project.id, label: project.name }))}
    />
  )
}
