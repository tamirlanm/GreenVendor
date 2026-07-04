import React from 'react'
import { useTheme } from '../theme/ThemeProvider'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  // accessible label
  const label = theme === 'system' ? `Theme: system (${resolvedTheme})` : `Theme: ${theme}`

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button
        aria-pressed={theme === 'dark'}
        aria-label={label}
        title={label}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
      >
        {resolvedTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
      </button>

      {/* optional: small selector to choose system preference */}
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as any)}
        aria-label="Theme preference"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  )
}
