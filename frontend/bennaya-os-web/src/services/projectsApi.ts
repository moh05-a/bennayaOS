import { api } from './api'
import type { Project, ProjectDetail, ProjectInput } from '../types/project'

export const projectsApi = {
  list: (signal?: AbortSignal) => api.get<Project[]>('/api/projects', signal),
  getById: (id: string, signal?: AbortSignal) => api.get<ProjectDetail>(`/api/projects/${id}`, signal),
  create: (input: ProjectInput) => api.post<ProjectDetail>('/api/projects', input),
  update: (id: string, input: ProjectInput) => api.put<ProjectDetail>(`/api/projects/${id}`, input),
  remove: (id: string) => api.delete(`/api/projects/${id}`),
}
