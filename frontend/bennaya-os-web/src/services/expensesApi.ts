import { api } from './api'
import type { Expense, ExpenseInput, ExpenseList } from '../types/expense'

export const expensesApi = {
  listForProject: (projectId: string, signal?: AbortSignal) =>
    api.get<ExpenseList>(`/api/projects/${projectId}/expenses`, signal),

  create: (projectId: string, input: ExpenseInput) =>
    api.post<Expense>(`/api/projects/${projectId}/expenses`, input),

  update: (id: string, input: ExpenseInput) => api.put<Expense>(`/api/expenses/${id}`, input),

  remove: (id: string) => api.delete(`/api/expenses/${id}`),
}
