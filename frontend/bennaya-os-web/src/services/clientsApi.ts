import { api } from './api'
import type { Client, ClientInput } from '../types/client'

/**
 * One module per resource. Components import these instead of knowing URLs,
 * so an endpoint rename is a single-file change.
 */
export const clientsApi = {
  list: (signal?: AbortSignal) => api.get<Client[]>('/api/clients', signal),
  getById: (id: string) => api.get<Client>(`/api/clients/${id}`),
  create: (input: ClientInput) => api.post<Client>('/api/clients', input),
  update: (id: string, input: ClientInput) => api.put<Client>(`/api/clients/${id}`, input),
  remove: (id: string) => api.delete(`/api/clients/${id}`),
}
