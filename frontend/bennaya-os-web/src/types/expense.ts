export type ExpenseCategory =
  | 'Materials'
  | 'Labor'
  | 'Equipment'
  | 'Transportation'
  | 'Subcontractor'
  | 'Other'

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'Materials', label: 'Materials' },
  { value: 'Labor', label: 'Labor' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Subcontractor', label: 'Subcontractor' },
  { value: 'Other', label: 'Other' },
]

export interface Expense {
  id: string
  amount: number
  description: string | null
  category: ExpenseCategory
  /** "2026-03-20" - date only, no time. */
  date: string
  projectId: string
  createdAt: string
}

export interface CategoryTotal {
  category: string
  amount: number
}

/** The API returns rows AND totals together, so the UI never sums client-side. */
export interface ExpenseList {
  items: Expense[]
  totalAmount: number
  totalsByCategory: CategoryTotal[]
}

export interface ExpenseInput {
  amount: number
  description?: string | null
  category: ExpenseCategory
  date: string
}
