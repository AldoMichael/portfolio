import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { profile } from '../data/portfolio'
import { EASE } from '../lib/motion'

type LoaderProps = {
  /** Appelé lorsque l'animation d'entrée est terminée */
  onComplete: () => void
}

/**
 * Écran de chargement affiché au premier rendu :
 * compteur de progression puis rideau qui se lève.
 */
export function Loader({ onComplete }: LoaderProps) {
  const reduceMotion = useReducedMotion()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (reduceMotion) {
      onComplete()
      return
    }

    // Progression simulée, légèrement irrégulière pour un rendu naturel
    const interval = window.setInterval(() => {
      setProgress((previous) => {
        const next = previous + Math.random() * 18 + 6
        if (next >= 100) {
          window.clearInterval(interval)
          window.setTimeout(onComplete, 550)
          return 100
        }
        return next
      })
    }, 130)

    return () => window.clearInterval(interval)
  }, [onComplete, reduceMotion])

  if (reduceMotion) return null

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-page"
      initial={{ opacity: 1 }}
      exit={{ y: '-100%', transition: { duration: 0.8, ease: EASE } }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative flex flex-col items-center gap-6"
      >
        {/* Monogramme avec anneau pulsé */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-pulse-ring rounded-full border border-accent/50" />
          <span className="flex h-full w-full items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-display text-2xl font-bold text-accent">
            {profile.initials}
          </span>
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.4em] text-ink/40">
          Chargement du portfolio
        </p>

        {/* Barre de progression */}
        <div className="h-px w-56 overflow-hidden bg-ink/10">
          <motion.div
            className="h-full bg-accent"
            style={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <span className="font-mono text-sm text-ink/60">
          {String(Math.min(Math.round(progress), 100)).padStart(3, '0')}%
        </span>
      </motion.div>
    </motion.div>
  )
}
