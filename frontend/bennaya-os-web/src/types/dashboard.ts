export interface StatusCount {
  status: string
  count: number
}

export interface RecentExpense {
  id: string
  amount: number
  category: string
  date: string
  description: string | null
  projectId: string
  projectName: string
}

export interface RecentPayment {
  id: string
  amount: number
  date: string
  description: string | null
  projectId: string
  projectName: string
}

/** Business-wide totals. Cancelled projects are excluded from the money figures. */
export interface UpcomingTask {
  id: string
  title: string
  dueDate: string | null
  status: string
  /** Decided by the SERVER, so every device agrees on what is late. */
  isOverdue: boolean
  projectId: string
  projectName: string
}

export interface Dashboard {
  activeProjects: number
  totalProjects: number
  totalContractValue: number
  totalReceived: number
  totalExpenses: number
  totalOutstanding: number
  netCashPosition: number
  projectsOverBudget: number
  projectsByStatus: StatusCount[]
  recentExpenses: RecentExpense[]
  recentPayments: RecentPayment[]
  upcomingTasks: UpcomingTask[]
  overdueTaskCount: number
}
