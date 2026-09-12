export interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  projectCount: number
  createdAt: string
}

export interface ClientInput {
  name: string
  phone?: string | null
  email?: string | null
}
