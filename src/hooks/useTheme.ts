import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'portfolio-theme'

function readTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return window.localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.classList.toggle('light', theme === 'light')
  root.style.colorScheme = theme

  const meta = document.querySelector('meta[name="theme-color"]')
  meta?.setAttribute('content', theme === 'light' ? '#f4f7fb' : '#05070d')
}

/**
 * Thème sombre / clair. Le sombre reste le défaut.
 * La préférence est écrite sur <html> (classes `dark` / `light`) et mémorisée.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme)

  useEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, setTheme: setThemeState, toggleTheme, isLight: theme === 'light' }
}
