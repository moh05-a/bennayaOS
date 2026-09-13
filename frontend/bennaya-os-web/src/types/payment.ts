export interface ClientPayment {
  id: string
  amount: number
  /** "2026-04-01" - date only. */
  date: string
  description: string | null
  projectId: string
  createdAt: string
}

/** Rows and money figures together, all computed server-side. */
export interface ClientPaymentList {
  items: ClientPayment[]
  totalReceived: number
  contractValue: number
  /** contractValue - totalReceived. Negative means the client overpaid. */
  outstandingBalance: number
}

export interface ClientPaymentInput {
  amount: number
  date: string
  description?: string | null
}
