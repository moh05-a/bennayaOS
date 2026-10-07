import type { ProjectStatus } from '../../types/project'

/** Each project status has its own hue so a long list can be scanned by colour. */
export const STATUS_STYLES: Record<ProjectStatus, string> = {
  Planning: 'bg-blue-50 text-blue-700',
  Active: 'bg-emerald-50 text-emerald-700',
  OnHold: 'bg-amber-50 text-amber-700',
  Completed: 'bg-slate-100 text-slate-600',
  Cancelled: 'bg-red-50 text-red-700',
}
