import { api } from './client'
import { normalizeUserRole } from './enumMap'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types'

export const authApi = {
  login: (payload: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', payload).then((r) => ({ ...r.data, role: normalizeUserRole(r.data.role) })),

  register: (payload: RegisterRequest) =>
    api
      .post<AuthResponse>('/auth/register', payload)
      .then((r) => ({ ...r.data, role: normalizeUserRole(r.data.role) })),
}
