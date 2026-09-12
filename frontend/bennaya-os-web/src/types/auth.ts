export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: 'Owner' | 'Employee'
}

export interface AuthCompany {
  id: string
  name: string
  currencyCode: string
}

/** Exactly the shape of AuthResponse from the backend. */
export interface AuthSession {
  token: string
  expiresAt: string
  user: AuthUser
  company: AuthCompany
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  companyName: string
  email: string
  password: string
  currencyCode: string
}
