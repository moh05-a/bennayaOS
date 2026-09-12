export type ProjectStatus = 'Planning' | 'Active' | 'OnHold' | 'Completed' | 'Cancelled'

/** Kept in one place so dropdowns and badges never drift apart. */
export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'Planning', label: 'Planning' },
  { value: 'Active', label: 'Active' },
  { value: 'OnHold', label: 'On hold' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
]

export interface Project {
  id: string
  name: string
  location: string | null
  contractValue: number
  /** ISO date only, e.g. "2026-03-15". No time, no timezone. */
  startDate: string | null
  expectedEndDate: string | null
  status: ProjectStatus
  clientId: string
  clientName: string
  createdAt: string
}

export interface ProjectDetail extends Project {
  description: string | null
  clientPhone: string | null
}

export interface ProjectInput {
  name: string
  description?: string | null
  location?: string | null
  contractValue: number
  startDate?: string | null
  expectedEndDate?: string | null
  clientId: string
  status: ProjectStatus
}
