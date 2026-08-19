import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { EASE } from '../lib/motion'

type SectionProps = {
  /** Identifiant d'ancre utilisé par la navigation */
  id: string
  /** Petit label au-dessus du titre (ex. « 02 — À propos ») */
  eyebrow?: string
  title?: ReactNode
  /** Phrase d'introduction sous le titre */
  description?: string
  children: ReactNode
  className?: string
  /** Centre l'en-tête de section */
  centered?: boolean
}

/**
 * Conteneur de section réutilisable.
 * Gère l'espacement, l'ancre de navigation et l'animation d'apparition
 * de l'en-tête au scroll (via `whileInView` de Framer Motion).
 */
export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = '',
  centered = false,
}: SectionProps) {
  const reduceMotion = useReducedMotion()

  const headerMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 32 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.4 },
        transition: { duration: 0.7, ease: EASE },
      }

  return (
    <section id={id} className={`relative scroll-mt-24 py-24 sm:py-32 ${className}`}>
      <div className="container-page">
        {(eyebrow || title || description) && (
          <motion.header
            {...headerMotion}
            className={`mb-14 max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}
          >
            {eyebrow && (
              <span className="chip mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {eyebrow}
              </span>
            )}

            {title && (
              <h2 className="text-display-lg text-gradient-light">{title}</h2>
            )}

            {description && (
              <p className="mt-5 text-base leading-relaxed text-ink/55 sm:text-lg">
                {description}
              </p>
            )}
          </motion.header>
        )}

        {children}
      </div>
    </section>
  )
}
