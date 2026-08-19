import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

/** Bascule sombre / clair, mémorisée dans le localStorage. */
export function ThemeToggle() {
  const { isLight, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Activer le thème sombre' : 'Activer le thème clair'}
      title={isLight ? 'Thème sombre' : 'Thème clair'}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/70 transition-colors hover:border-accent/50 hover:text-accent"
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  )
}
