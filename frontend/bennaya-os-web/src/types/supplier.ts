export interface Supplier {
  id: string
  name: string
  phone: string | null
  email: string | null
  /** How many expenses reference this supplier. */
  expenseCount: number
  /** Total spent with this supplier - useful when negotiating. */
  totalSpent: number
  createdAt: string
}

export interface SupplierInput {
  name: string
  phone?: string | null
  email?: string | null
}
