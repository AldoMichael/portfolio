import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { profile } from '../data/portfolio'
import { useContent } from '../context/ContentContext'
import { useProfilePhoto } from '../hooks/useProfilePhoto'
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
  const { loading: contentLoading } = useContent()
  const { src: photoSrc, show: showPhoto, onError } = useProfilePhoto()

  useEffect(() => {
    if (reduceMotion) {
      onComplete()
      return
    }

    // On attend le CMS pour afficher la photo plutôt que les initiales AR.
    if (contentLoading) return

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
  }, [onComplete, reduceMotion, contentLoading])

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
        {/* Photo de profil (ou initiales en repli), plus grande qu'un monogramme */}
        <div className="relative flex h-52 w-52 items-center justify-center sm:h-64 sm:w-64">
          <span className="absolute inset-0 animate-pulse-ring rounded-full border border-accent/50" />
          {showPhoto ? (
            <img
              src={photoSrc!}
              alt=""
              onError={onError}
              className="relative h-full w-full rounded-full border-2 border-accent/40 object-cover shadow-glow-sm"
            />
          ) : (
            <span className="relative flex h-full w-full items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-display text-4xl font-bold text-accent sm:text-5xl">
              {profile.initials}
            </span>
          )}
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
