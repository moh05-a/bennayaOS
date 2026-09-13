export type ProjectTaskStatus = 'Todo' | 'InProgress' | 'Completed'

export const TASK_STATUSES: { value: ProjectTaskStatus; label: string }[] = [
  { value: 'Todo', label: 'To do' },
  { value: 'InProgress', label: 'In progress' },
  { value: 'Completed', label: 'Completed' },
]

export interface ProjectTask {
  id: string
  title: string
  description: string | null
  /** "2026-09-20" or null. */
  dueDate: string | null
  status: ProjectTaskStatus
  completedAt: string | null
  projectId: string
  createdAt: string
}

export interface ProjectTaskList {
  items: ProjectTask[]
  todoCount: number
  inProgressCount: number
  completedCount: number
  /** Computed by the SERVER against the server's date. */
  overdueCount: number
}

export interface ProjectTaskInput {
  title: string
  description?: string | null
  dueDate?: string | null
  status: ProjectTaskStatus
}
