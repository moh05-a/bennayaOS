import { api } from './api'
import type { AuthSession, LoginRequest, RegisterRequest } from '../types/auth'

export const authApi = {
  login: (request: LoginRequest) => api.post<AuthSession>('/api/auth/login', request),
  register: (request: RegisterRequest) => api.post<AuthSession>('/api/auth/register', request),
}
