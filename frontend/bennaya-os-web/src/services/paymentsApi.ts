import { api } from './api'
import type { ClientPayment, ClientPaymentInput, ClientPaymentList } from '../types/payment'

export const paymentsApi = {
  listForProject: (projectId: string, signal?: AbortSignal) =>
    api.get<ClientPaymentList>(`/api/projects/${projectId}/payments`, signal),

  create: (projectId: string, input: ClientPaymentInput) =>
    api.post<ClientPayment>(`/api/projects/${projectId}/payments`, input),

  update: (id: string, input: ClientPaymentInput) =>
    api.put<ClientPayment>(`/api/payments/${id}`, input),

  remove: (id: string) => api.delete(`/api/payments/${id}`),
}
