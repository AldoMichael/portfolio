import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE } from '../lib/motion'

type RevealProps = {
  children: ReactNode
  className?: string
  /** Délai avant le déclenchement (utile pour créer un effet de cascade manuel) */
  delay?: number
  /** Amplitude de la translation d'entrée */
  y?: number
  /** Direction de l'entrée */
  x?: number
  duration?: number
  as?: 'div' | 'li' | 'span'
}

/**
 * Enveloppe universelle d'apparition au scroll.
 * Si l'utilisateur a activé « réduire les animations », le contenu
 * s'affiche instantanément sans transformation.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  x = 0,
  duration = 0.7,
  as = 'div',
}: RevealProps) {
  const reduceMotion = useReducedMotion()
  const MotionTag = motion[as]

  if (reduceMotion) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  )
}
