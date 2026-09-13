export type ProjectStatus = 'Planning' | 'Active' | 'OnHold' | 'Completed' | 'Cancelled'

/** Kept in one place so dropdowns and badges never drift apart. */
export const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'Planning', label: 'Planning' },
  { value: 'Active', label: 'Active' },
  { value: 'OnHold', label: 'On hold' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
]

export interface Project {
  id: string
  name: string
  location: string | null
  contractValue: number
  /** ISO date only, e.g. "2026-03-15". No time, no timezone. */
  startDate: string | null
  expectedEndDate: string | null
  status: ProjectStatus
  clientId: string
  clientName: string
  /** Money figures on list rows, so health is visible without opening a project. */
  totalExpenses: number
  totalReceived: number
  outstandingBalance: number
  createdAt: string
}

export interface ProjectDetail extends Project {
  description: string | null
  clientPhone: string | null
  /** Sum of all subcontract amounts agreed. */
  totalSubcontractorCommitted: number
  /** Sum actually paid out to subcontractors. */
  totalSubcontractorPaid: number
  /** Committed minus paid: a real liability a cash balance alone would hide. */
  totalSubcontractorRemaining: number
  /** totalExpenses + totalSubcontractorPaid: everything that left the business. */
  totalSpent: number
  /** contractValue - totalSpent. Deliberately NOT called profit. */
  remainingContractValue: number
  /** contractValue - totalSpent - subcontractorRemaining. A ceiling, not a promise. */
  projectedMargin: number
  /** totalReceived - totalSpent. Real cash, not profit. */
  netCashPosition: number
  /** Used to warn how much a project deletion will take with it. */
  expenseCount: number
  paymentCount: number
  subcontractorCount: number
}

export interface ProjectInput {
  name: string
  description?: string | null
  location?: string | null
  contractValue: number
  startDate?: string | null
  expectedEndDate?: string | null
  clientId: string
  status: ProjectStatus
}
