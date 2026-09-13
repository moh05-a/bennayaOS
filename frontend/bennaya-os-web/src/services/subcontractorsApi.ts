import { api } from './api'
import type {
  Subcontractor,
  SubcontractorInput,
  SubcontractorList,
  SubcontractorPayment,
  SubcontractorPaymentInput,
} from '../types/subcontractor'

export const subcontractorsApi = {
  listForProject: (projectId: string, signal?: AbortSignal) =>
    api.get<SubcontractorList>(`/api/projects/${projectId}/subcontractors`, signal),

  create: (projectId: string, input: SubcontractorInput) =>
    api.post<Subcontractor>(`/api/projects/${projectId}/subcontractors`, input),

  update: (id: string, input: SubcontractorInput) =>
    api.put<Subcontractor>(`/api/subcontractors/${id}`, input),

  remove: (id: string) => api.delete(`/api/subcontractors/${id}`),

  listPayments: (id: string, signal?: AbortSignal) =>
    api.get<SubcontractorPayment[]>(`/api/subcontractors/${id}/payments`, signal),

  addPayment: (id: string, input: SubcontractorPaymentInput) =>
    api.post<SubcontractorPayment>(`/api/subcontractors/${id}/payments`, input),

  removePayment: (paymentId: string) => api.delete(`/api/subcontractor-payments/${paymentId}`),
}
