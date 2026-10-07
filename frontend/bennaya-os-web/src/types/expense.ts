export type ExpenseCategory =
  | 'Materials'
  | 'Labor'
  | 'Equipment'
  | 'Transportation'
  | 'Subcontractor'
  | 'Other'

/** Labels are translated: t(`expenseCategory.${category}`). */
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Materials',
  'Labor',
  'Equipment',
  'Transportation',
  'Subcontractor',
  'Other',
]

export interface Expense {
  id: string
  amount: number
  description: string | null
  category: ExpenseCategory
  /** "2026-03-20" - date only, no time. */
  date: string
  projectId: string
  /** Null when the expense has no supplier, which is normal. */
  supplierId: string | null
  supplierName: string | null
  createdAt: string
}

export interface CategoryTotal {
  category: ExpenseCategory
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
  supplierId?: string | null
}
