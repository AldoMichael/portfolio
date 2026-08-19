import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * Curseur personnalisé : un point plein qui suit précisément la souris
 * et un anneau élastique qui grossit au survol des éléments cliquables.
 * Automatiquement désactivé sur écrans tactiles et en mode animations réduites.
 */
export function CustomCursor() {
  const reduceMotion = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 180, damping: 18, mass: 0.5 })
  const ringY = useSpring(y, { stiffness: 180, damping: 18, mass: 0.5 })

  // Le curseur n'est activé que sur les périphériques à pointeur précis (souris)
  useEffect(() => {
    if (typeof window === 'undefined') return
    setEnabled(window.matchMedia('(pointer: fine)').matches)
  }, [])

  useEffect(() => {
    if (!enabled || reduceMotion) return

    const onMove = (event: MouseEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
      setVisible(true)

      // Détecte si l'on survole un élément interactif
      const target = event.target as HTMLElement | null
      setHovering(Boolean(target?.closest('a, button, [data-cursor="hover"], input, textarea')))
    }

    const onLeave = () => setVisible(false)

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled, reduceMotion, x, y])

  if (!enabled || reduceMotion) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden lg:block">
      {/* Point central */}
      <motion.span
        style={{ x, y }}
        animate={{ opacity: visible ? 1 : 0, scale: hovering ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="absolute -ml-1 -mt-1 block h-2 w-2 rounded-full bg-accent"
      />
      {/* Anneau élastique */}
      <motion.span
        style={{ x: ringX, y: ringY }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: hovering ? 1.9 : 1,
          borderColor: hovering ? 'rgb(var(--accent) / 0.9)' : 'rgb(var(--fg) / 0.35)',
        }}
        transition={{ duration: 0.25 }}
        className="absolute -ml-5 -mt-5 block h-10 w-10 rounded-full border"
      />
    </div>
  )
}
