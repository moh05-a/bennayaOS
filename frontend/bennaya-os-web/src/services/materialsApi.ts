import { api } from './api'
import type { Material, MaterialInput, MaterialList } from '../types/material'

export const materialsApi = {
  listForProject: (projectId: string, signal?: AbortSignal) =>
    api.get<MaterialList>(`/api/projects/${projectId}/materials`, signal),

  create: (projectId: string, input: MaterialInput) =>
    api.post<Material>(`/api/projects/${projectId}/materials`, input),

  update: (id: string, input: MaterialInput) => api.put<Material>(`/api/materials/${id}`, input),

  remove: (id: string) => api.delete(`/api/materials/${id}`),
}
