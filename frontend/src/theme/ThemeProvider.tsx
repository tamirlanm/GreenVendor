import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = 'gv_theme' // GreenVendor theme key

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return (raw as Theme) || 'system'
    } catch {
      return 'system'
    }
  })

  // resolvedTheme is the actual applied theme (light/dark)
  const getSystemTheme = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme

  useEffect(() => {
    // apply to documentElement for CSS selectors
    const root = document.documentElement
    if (resolvedTheme === 'dark') root.setAttribute('data-theme', 'dark')
    else root.removeAttribute('data-theme')

    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore storage errors
    }
  }, [resolvedTheme, theme])

  // keep in sync if user changes OS preference while theme === 'system'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') {
        const root = document.documentElement
        if (mq.matches) root.setAttribute('data-theme', 'dark')
        else root.removeAttribute('data-theme')
      }
    }
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: resolvedTheme as 'light' | 'dark', setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
