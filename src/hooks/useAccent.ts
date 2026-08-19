import { useCallback, useEffect, useState } from 'react'
import { accentPresets } from '../data/portfolio'

const STORAGE_KEY = 'portfolio-accent'

/**
 * Gère la couleur d'accent du site.
 * La couleur est écrite dans les variables CSS `--accent` / `--accent-soft`
 * (consommées par Tailwind via `rgb(var(--accent) / <alpha-value>)`),
 * puis mémorisée dans le localStorage.
 */
export function useAccent() {
  const [index, setIndex] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    const stored = Number(window.localStorage.getItem(STORAGE_KEY))
    return Number.isInteger(stored) && stored >= 0 && stored < accentPresets.length ? stored : 0
  })

  useEffect(() => {
    const preset = accentPresets[index]
    const root = document.documentElement
    root.style.setProperty('--accent', preset.value)
    root.style.setProperty('--accent-soft', preset.soft)
    window.localStorage.setItem(STORAGE_KEY, String(index))
  }, [index])

  const setAccent = useCallback((next: number) => setIndex(next), [])

  return { accentIndex: index, setAccent, presets: accentPresets }
}
