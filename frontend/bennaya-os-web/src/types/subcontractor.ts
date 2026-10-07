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

/**
 * Quick picks in the form. Specialty is free text, so this is only a shortcut.
 * These are dictionary keys: the text filled in is t(`trades.${trade}`), so it
 * is saved in whatever language the user is working in.
 */
export const COMMON_TRADES = [
  'electrician',
  'plumber',
  'painter',
  'carpenter',
  'tiler',
  'hvac',
  'steelFixer',
  'mason',
] as const
