import { api } from './api'
import type { ProjectTask, ProjectTaskInput, ProjectTaskList } from '../types/task'

export const tasksApi = {
  listForProject: (projectId: string, signal?: AbortSignal) =>
    api.get<ProjectTaskList>(`/api/projects/${projectId}/tasks`, signal),

  create: (projectId: string, input: ProjectTaskInput) =>
    api.post<ProjectTask>(`/api/projects/${projectId}/tasks`, input),

  update: (id: string, input: ProjectTaskInput) => api.put<ProjectTask>(`/api/tasks/${id}`, input),

  remove: (id: string) => api.delete(`/api/tasks/${id}`),
}
