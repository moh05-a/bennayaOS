export type ProjectTaskStatus = 'Todo' | 'InProgress' | 'Completed'

/** Labels are translated: t(`taskStatus.${status}`). */
export const TASK_STATUSES: ProjectTaskStatus[] = ['Todo', 'InProgress', 'Completed']

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
