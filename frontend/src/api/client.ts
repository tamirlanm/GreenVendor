import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { normalizeUserRole } from './enumMap'
import type { AuthResponse } from '../types'

// In dev, Vite proxies /api -> the ASP.NET Core API (see vite.config.ts).
// In prod, nginx does the same proxying (see nginx/nginx.conf in the plan).
export const api = axios.create({
  baseURL: '/api',
})

const ACCESS_KEY = 'gv_access_token'
const REFRESH_KEY = 'gv_refresh_token'
const ROLE_KEY = 'gv_role'

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  getRole: () => localStorage.getItem(ROLE_KEY) as AuthResponse['role'] | null,
  set: (auth: AuthResponse) => {
    localStorage.setItem(ACCESS_KEY, auth.accessToken)
    localStorage.setItem(REFRESH_KEY, auth.refreshToken)
    localStorage.setItem(ROLE_KEY, auth.role)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(ROLE_KEY)
  },
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// Queue concurrent 401s while a single refresh call is in flight.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh()
  if (!refreshToken) return null

  try {
    const { data } = await axios.post<AuthResponse>('/api/auth/refresh', { refreshToken })
    tokenStorage.set({ ...data, role: normalizeUserRole(data.role) })
    return data.accessToken
  } catch {
    tokenStorage.clear()
    return null
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }

      const newToken = await refreshPromise
      if (newToken) {
        original.headers.set('Authorization', `Bearer ${newToken}`)
        return api(original)
      }

      // No valid session left — force back to login.
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)

/** Extracts a human-readable message from a failed API call. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    // GreenVendor.Api's GlobalExceptionMiddleware returns `{ error: "..." }` for
    // any BaseException-derived exception (NotFound, BadRequest, etc). ASP.NET's
    // built-in model validation (malformed/missing fields) instead returns a
    // ProblemDetails body with `title`/`errors`, so both shapes are checked.
    const data = err.response?.data as
      | { error?: string; message?: string; title?: string; errors?: Record<string, string[]> }
      | undefined
    if (data?.error) return data.error
    if (data?.message) return data.message
    if (data?.errors) {
      const first = Object.values(data.errors)[0]
      if (first?.[0]) return first[0]
    }
    if (data?.title) return data.title
    if (err.response?.status === 404) return 'This feature is not available yet.'
    if (err.message === 'Network Error') return 'Cannot reach the server. Is the API running?'
  }
  return fallback
}
