import { api } from './api'
import type { Dashboard } from '../types/dashboard'

export const dashboardApi = {
  get: (signal?: AbortSignal) => api.get<Dashboard>('/api/dashboard', signal),
}
