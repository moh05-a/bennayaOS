import { api } from './api'
import type { Supplier, SupplierInput } from '../types/supplier'

export const suppliersApi = {
  list: (signal?: AbortSignal) => api.get<Supplier[]>('/api/suppliers', signal),
  getById: (id: string) => api.get<Supplier>(`/api/suppliers/${id}`),
  create: (input: SupplierInput) => api.post<Supplier>('/api/suppliers', input),
  update: (id: string, input: SupplierInput) => api.put<Supplier>(`/api/suppliers/${id}`, input),
  remove: (id: string) => api.delete(`/api/suppliers/${id}`),
}
