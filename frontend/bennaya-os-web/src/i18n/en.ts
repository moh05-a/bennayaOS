/**
 * English UI text. This file is the source of truth for the SHAPE of the
 * dictionary: ar.ts is type-checked against it, so a key missing from Arabic
 * is a compile error rather than a blank label in production.
 *
 * - {name} placeholders are filled from the params passed to t().
 * - An object with `one` / `other` (and, for Arabic, `zero`/`two`/`few`/`many`)
 *   is a plural: t(key, { count }) picks the right form for the language.
 * - Enum-backed groups (projectStatus, expenseCategory, ...) are keyed by the
 *   exact value the API sends, so t(`projectStatus.${status}`) just works.
 */
export const en = {
  common: {
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    remove: 'Remove',
    saveChanges: 'Save changes',
    loading: 'Loading',
    close: 'Close',
    openMenu: 'Open menu',
    total: 'Total',
    actions: 'Actions',
    confirmDelete: 'Delete "{name}"? This cannot be undone.',
    arrivesIn: '{title} arrives in {phase}.',
  },

  fields: {
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    date: 'Date',
    amount: 'Amount',
    category: 'Category',
    description: 'Description',
    supplier: 'Supplier',
    status: 'Status',
  },

  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Cannot reach the server. Is the API running?',
    sessionExpired: 'Your session has expired. Please sign in again.',
    requestFailed: 'Request failed ({status})',
  },

  language: {
    switch: 'Switch language',
  },

  nav: {
    dashboard: 'Dashboard',
    projects: 'Projects',
    clients: 'Clients',
    suppliers: 'Suppliers',
    signOut: 'Sign out',
  },

  auth: {
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    signInSubtitle: 'Sign in to your account',
    noAccount: "Don't have an account?",
    createOne: 'Create one',
    registerTitle: 'Create your account',
    registerSubtitle: 'Set up your contracting company',
    fullName: 'Your full name',
    fullNamePlaceholder: 'Mohammad Ali',
    companyName: 'Company name',
    companyNamePlaceholder: 'Bennaya Contracting',
    passwordHint: 'At least 8 characters',
    createAccount: 'Create account',
    haveAccount: 'Already have an account?',
  },

  /** Money labels shared by the dashboard, project list and project tabs. */
  money: {
    contractValue: 'Contract value',
    received: 'Received',
    spent: 'Spent',
    outstanding: 'Outstanding',
    overpaidBy: 'Overpaid by',
    totalSpent: 'Total spent',
    netCashPosition: 'Net cash position',
    clientPayment: 'Client payment',
  },

  projectStatus: {
    Planning: 'Planning',
    Active: 'Active',
    OnHold: 'On hold',
    Completed: 'Completed',
    Cancelled: 'Cancelled',
  },

  taskStatus: {
    Todo: 'To do',
    InProgress: 'In progress',
    Completed: 'Completed',
  },

  expenseCategory: {
    Materials: 'Materials',
    Labor: 'Labor',
    Equipment: 'Equipment',
    Transportation: 'Transportation',
    Subcontractor: 'Subcontractor',
    Other: 'Other',
  },

  materialUnit: {
    Bag: 'Bag',
    Kg: 'Kilogram',
    Ton: 'Ton',
    Meter: 'Meter',
    SquareMeter: 'Square meter',
    CubicMeter: 'Cubic meter',
    Piece: 'Piece',
    Liter: 'Liter',
  },

  materialUnitShort: {
    Bag: 'bag',
    Kg: 'kg',
    Ton: 'ton',
    Meter: 'm',
    SquareMeter: 'm²',
    CubicMeter: 'm³',
    Piece: 'pc',
    Liter: 'L',
  },

  /** Quick-pick specialties in the subcontractor form. */
  trades: {
    electrician: 'Electrician',
    plumber: 'Plumber',
    painter: 'Painter',
    carpenter: 'Carpenter',
    tiler: 'Tiler',
    hvac: 'HVAC',
    steelFixer: 'Steel fixer',
    mason: 'Mason',
  },

  /** Quick-pick descriptions in the client payment form. */
  paymentLabels: {
    deposit: 'Deposit',
    foundation: 'Foundation payment',
    structure: 'Structure payment',
    finishing: 'Finishing payment',
    final: 'Final payment',
  },

  dashboard: {
    loading: 'Loading dashboard',
    loadError: 'Could not load your dashboard.',
    welcome: 'Welcome, {name}',
    emptyTitle: 'Nothing to show yet',
    emptyDescription:
      'Add a client, then create your first project. Your financial summary appears here once money starts moving.',
    addClient: 'Add a client',
    projectsOverBudget: {
      one: '{count} project over budget',
      other: '{count} projects over budget',
    },
    overBudgetDetail: '— direct costs have exceeded the contract value. View projects →',
    tasksOverdue: {
      one: '{count} task overdue',
      other: '{count} tasks overdue',
    },
    overdueDetail: '— past the due date and not finished.',
    activeProjects: 'Active projects',
    totalProjects: '{count} total',
    netCashHint: 'Received minus spent across every project. Cash, not profit.',
    recentExpenses: 'Recent expenses',
    noExpenses: 'No expenses yet.',
    recentPayments: 'Recent payments',
    noPayments: 'No payments recorded yet.',
    upcomingTasks: 'Upcoming tasks',
    overdueOn: 'Overdue · {date}',
    noDueDate: 'No due date',
    footnote: 'Money totals and tasks exclude cancelled projects.',
  },

  clients: {
    title: 'Clients',
    description: 'The people and companies you build for.',
    add: 'Add client',
    edit: 'Edit client',
    loading: 'Loading clients',
    loadError: 'Could not load clients.',
    emptyTitle: 'No clients yet',
    emptyDescription: 'Add your first client to start creating projects for them.',
    projectsColumn: 'Projects',
    projectCount: {
      one: '{count} project',
      other: '{count} projects',
    },
    deleteTitle: 'Delete client',
    deleteError: 'Could not delete this client.',
    namePlaceholder: 'Abu Ahmad',
  },

  suppliers: {
    title: 'Suppliers',
    description: 'The businesses you buy materials and services from.',
    add: 'Add supplier',
    edit: 'Edit supplier',
    loading: 'Loading suppliers',
    loadError: 'Could not load suppliers.',
    emptyTitle: 'No suppliers yet',
    emptyDescription:
      'Add your suppliers so you can tag expenses and see how much you spend with each one.',
    expensesColumn: 'Expenses',
    expenseCount: {
      one: '{count} expense',
      other: '{count} expenses',
    },
    deleteTitle: 'Delete supplier',
    deleteError: 'Could not delete this supplier.',
    deleteWithExpenses:
      'Delete "{name}"? Its {count} expense(s) worth {amount} will be kept, but will no longer show a supplier.',
    namePlaceholder: 'Amman Cement Co',
  },

  projects: {
    title: 'Projects',
    description: 'Every job you are running.',
    new: 'New project',
    loading: 'Loading projects',
    loadError: 'Could not load projects.',
    emptyTitle: 'No projects yet',
    emptyDescription:
      'Create your first project to start tracking its contract value, expenses and payments.',
    projectColumn: 'Project',
    clientColumn: 'Client',

    // Form
    editTitle: 'Edit project',
    loadingProject: 'Loading project',
    needClient: 'You need a client before creating a project.',
    addClientFirst: 'Add a client first',
    name: 'Project name',
    namePlaceholder: 'Khalda Villa - Finishing',
    client: 'Client',
    loadingClients: 'Loading clients...',
    selectClient: 'Select a client',
    contractValueWithCurrency: 'Contract value ({currency})',
    location: 'Location',
    locationPlaceholder: 'Khalda, Amman',
    startDate: 'Start date',
    expectedEndDate: 'Expected end date',
    descriptionPlaceholder: 'Scope of work, key notes...',
    create: 'Create project',

    // Detail page
    loadErrorOne: 'Could not load this project.',
    backToProjects: 'Back to projects',
    backLink: '← Projects',
    start: 'Start',
    expectedEnd: 'Expected end',
    deleteTitle: 'Delete project',
    deleteError: 'Could not delete this project.',
    deleteWithChildren:
      'Delete "{name}"? This also deletes {expenses} expense(s), {payments} payment(s) and {subcontractors} subcontractor(s). This cannot be undone.',
    tabs: {
      overview: 'Overview',
      expenses: 'Expenses',
      payments: 'Payments',
      subcontractors: 'Subcontractors',
      materials: 'Materials',
      tasks: 'Tasks',
    },
  },

  overview: {
    inclSubcontractors: 'incl. {amount} to subcontractors',
    netCashHint:
      'Received minus spent. This is cash, not profit — it excludes work you have done but not yet invoiced, and costs you have committed but not yet paid.',
    spentMoreThanCollected:
      'You have spent more than you have collected on this project. Consider invoicing the next milestone.',
    stillOwedToSubcontractors: 'Still owed to subcontractors:',
    projectedMargin: 'Projected margin after that commitment:',
    projectedMarginNote: '— a ceiling, since further materials and labour are not yet recorded.',
    collectedFromClient: 'Collected from client',
    spentAgainstContract: 'Spent against contract value',
    overBudget:
      'Costs have exceeded the contract value by {amount}. This project is losing money on costs alone.',
    recentActivity: 'Recent activity',
    noActivity: 'No expenses or payments recorded yet.',
    paymentReceived: 'Payment received',
  },

  expenses: {
    add: 'Add expense',
    edit: 'Edit expense',
    loading: 'Loading expenses',
    loadError: 'Could not load expenses.',
    emptyTitle: 'No expenses yet',
    emptyDescription: 'Record what you spend on this project to track where the money goes.',
    deleteTitle: 'Delete expense',
    deleteError: 'Could not delete this expense.',
    deleteConfirm: 'Delete this {amount} expense? This cannot be undone.',
    amountWithCurrency: 'Amount ({currency})',
    supplierOptional: 'Supplier (optional)',
    noSupplier: 'No supplier',
    descriptionPlaceholder: 'Cement - 250 bags',
  },

  payments: {
    record: 'Record payment',
    edit: 'Edit payment',
    loading: 'Loading payments',
    loadError: 'Could not load payments.',
    overpaidHint: 'Client has paid more than the contract',
    collected: 'Collected',
    emptyTitle: 'No payments recorded',
    emptyDescription: 'Record what the client has paid so you always know what is still owed.',
    totalReceived: 'Total received',
    deleteTitle: 'Delete payment',
    deleteError: 'Could not delete this payment.',
    deleteConfirm: 'Delete this {amount} payment? This cannot be undone.',
    amountReceived: 'Amount received ({currency})',
    dateReceived: 'Date received',
  },

  subcontractors: {
    add: 'Add subcontractor',
    edit: 'Edit subcontractor',
    loading: 'Loading subcontractors',
    loadError: 'Could not load subcontractors.',
    committed: 'Committed',
    paid: 'Paid',
    stillOwed: 'Still owed',
    doubleCountWarning:
      "Record subcontractor money here, not as an expense — otherwise the same payment is counted twice in this project's totals.",
    emptyTitle: 'No subcontractors yet',
    emptyDescription:
      'Add the electricians, plumbers and other trades on this project to track what you owe them.',
    tradeNotSet: 'Trade not set',
    remaining: 'Remaining',
    ofAmount: 'of {amount}',
    paymentsButton: 'Payments ({count})',
    deleteTitle: 'Delete subcontractor',
    deleteError: 'Could not delete this subcontractor.',
    deleteWithPayments:
      'Delete "{name}"? This also deletes {count} payment(s) totalling {amount}. This cannot be undone.',
    namePlaceholder: 'Ahmad Al-Khatib',
    specialty: 'Specialty',
    contractAmountWithCurrency: 'Contract amount ({currency})',
    contractAmountHint: 'Leave as 0 if the amount is not agreed yet',

    // Payments dialog
    paymentsTitle: 'Payments - {name}',
    contract: 'Contract',
    overpaid: 'Overpaid',
    note: 'Note',
    notePlaceholder: 'First instalment',
    recordPayment: 'Record payment',
    history: 'Payment history',
    loadingPayments: 'Loading payments',
    noPayments: 'No payments yet.',
  },

  materials: {
    add: 'Add material',
    edit: 'Edit material',
    loading: 'Loading materials',
    loadError: 'Could not load materials.',
    estimatedBudget: 'Estimated budget',
    purchasedSoFar: 'Purchased so far',
    stillToBuy: 'Still to buy',
    ofMaterials: {
      one: 'of {count} material',
      other: 'of {count} materials',
    },
    emptyTitle: 'No materials yet',
    emptyDescription:
      'Track what each project needs, what you have bought and what has been used on site.',
    costPerUnitLine: '{cost} per {unit} · budget {budget}',
    availableOnSite: 'Available on site',
    required: 'Required',
    purchased: 'Purchased',
    used: 'Used',
    overOrdered: 'Over-ordered',
    toBuy: 'To buy',
    overUsedWarning:
      'More has been used ({used}) than purchased ({purchased}). Either stock came from elsewhere, or one of these numbers is wrong.',
    overSuppliedWarning:
      '{quantity} more was bought than this job needs — roughly {amount} tied up in surplus stock.',
    material: 'Material',
    namePlaceholder: 'Cement',
    unit: 'Unit',
    costPerUnit: 'Cost per unit',
    costPerUnitHint: 'Per unit, not the total - the budget is calculated for you',
    deleteTitle: 'Delete material',
  },

  tasks: {
    add: 'Add task',
    edit: 'Edit task',
    loading: 'Loading tasks',
    loadError: 'Could not load tasks.',
    todoCount: 'To do {count}',
    inProgressCount: 'In progress {count}',
    doneCount: 'Done {count}',
    overdueCount: 'Overdue {count}',
    emptyTitle: 'No tasks yet',
    emptyDescription: 'Track what still needs doing on this project.',
    overdueOn: 'Overdue · {date}',
    dueOn: 'Due {date}',
    noDueDate: 'No due date',
    tapToChangeStatus: 'Tap to change status',
    showCompleted: {
      one: 'Show {count} completed task',
      other: 'Show {count} completed tasks',
    },
    hideCompleted: {
      one: 'Hide {count} completed task',
      other: 'Hide {count} completed tasks',
    },
    title: 'Title',
    titlePlaceholder: 'Order bathroom tiles',
    dueDateOptional: 'Due date (optional)',
    notes: 'Notes',
    notesPlaceholder: 'Any detail worth remembering',
    deleteTitle: 'Delete task',
  },
}
