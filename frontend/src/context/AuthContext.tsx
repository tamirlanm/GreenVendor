import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../api/auth'
import { tokenStorage } from '../api/client'
import type { LoginRequest, RegisterRequest, UserRole } from '../types'

interface AuthContextValue {
  role: UserRole | null
  isAuthenticated: boolean
  login: (payload: LoginRequest) => Promise<UserRole>
  register: (payload: RegisterRequest) => Promise<UserRole>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(() => tokenStorage.getRole())

  const login = useCallback(async (payload: LoginRequest) => {
    const auth = await authApi.login(payload)
    tokenStorage.set(auth)
    setRole(auth.role)
    return auth.role
  }, [])

  const register = useCallback(async (payload: RegisterRequest) => {
    const auth = await authApi.register(payload)
    tokenStorage.set(auth)
    setRole(auth.role)
    return auth.role
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setRole(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ role, isAuthenticated: role !== null, login, register, logout }),
    [role, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

/** Default landing page for a freshly-authenticated user of a given role. */
export function homeRouteForRole(role: UserRole): string {
  switch (role) {
    case 'Supplier':
      return '/supplier'
    case 'Buyer':
      return '/buyer'
    case 'Admin':
      return '/admin'
  }
}
