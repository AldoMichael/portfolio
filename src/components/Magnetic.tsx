import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import type { ReactNode } from 'react'
import { useRef } from 'react'

type MagneticProps = {
  children: ReactNode
  className?: string
  /** Intensité de l'attraction (0 = aucun effet, 1 = suit le curseur) */
  strength?: number
}

/**
 * Effet « magnétique » : l'élément est légèrement attiré par le curseur.
 * Appliqué aux boutons principaux pour renforcer les micro-interactions.
 */
export function Magnetic({ children, className = '', strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 250, damping: 18, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 250, damping: 18, mass: 0.4 })

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    // Distance entre le curseur et le centre de l'élément
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  if (reduceMotion) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  )
}
