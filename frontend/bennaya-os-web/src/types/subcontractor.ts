export interface Subcontractor {
  id: string
  name: string
  phone: string | null
  specialty: string | null
  contractAmount: number
  totalPaid: number
  /** contractAmount - totalPaid. Negative means overpaid. */
  remaining: number
  paymentCount: number
  projectId: string
  createdAt: string
}

export interface SubcontractorList {
  items: Subcontractor[]
  totalCommitted: number
  totalPaid: number
  totalRemaining: number
}

export interface SubcontractorInput {
  name: string
  phone?: string | null
  specialty?: string | null
  contractAmount: number
}

export interface SubcontractorPayment {
  id: string
  amount: number
  date: string
  description: string | null
  subcontractorId: string
  createdAt: string
}

export interface SubcontractorPaymentInput {
  amount: number
  date: string
  description?: string | null
}

/** Quick picks in the form. Specialty is free text, so this is only a shortcut. */
export const COMMON_TRADES = [
  'Electrician',
  'Plumber',
  'Painter',
  'Carpenter',
  'Tiler',
  'HVAC',
  'Steel fixer',
  'Mason',
]
