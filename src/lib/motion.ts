import type { Variants } from 'framer-motion'

/** Courbe d'accélération « expo out » utilisée partout pour une sensation fluide. */
export const EASE = [0.22, 1, 0.36, 1] as const

/** Apparition simple : fondu + légère translation verticale. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
}

/** Apparition latérale (timeline, colonnes). */
export const fadeIn = (direction: 'left' | 'right' | 'up' = 'up', distance = 32): Variants => ({
  hidden: {
    opacity: 0,
    x: direction === 'left' ? -distance : direction === 'right' ? distance : 0,
    y: direction === 'up' ? distance : 0,
  },
  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.7, ease: EASE } },
})

/** Conteneur qui déclenche ses enfants en cascade (stagger). */
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
})

/** Élément « pop » utilisé pour les badges de compétences. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 24 },
  },
}

/** Réglage de viewport commun : on anime une seule fois, au quart visible. */
export const viewportOnce = { once: true, amount: 0.2 } as const
