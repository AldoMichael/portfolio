import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import type { ReactNode } from 'react'
import { useRef } from 'react'

type TiltCardProps = {
  children: ReactNode
  className?: string
  /** Angle maximal d'inclinaison en degrés */
  max?: number
  /** Si fourni, toute la surface de la carte devient cliquable */
  href?: string
  /** Texte lu par les lecteurs d'écran pour le lien couvrant la carte */
  linkLabel?: string
}

/**
 * Carte avec inclinaison 3D légère au survol + halo lumineux
 * qui suit le curseur. Désactivé si « animations réduites ».
 */
export function TiltCard({ children, className = '', max = 8, href, linkLabel }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const rotateX = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })

  // Position du halo (en pourcentage de la carte)
  const glowX = useMotionValue(50)
  const glowY = useMotionValue(50)
  const glowBackground = useMotionTemplate`radial-gradient(320px circle at ${glowX}% ${glowY}%, rgb(var(--accent) / 0.16), transparent 70%)`

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height

    rotateY.set((px - 0.5) * max * 2)
    rotateX.set((0.5 - py) * max * 2)
    glowX.set(px * 100)
    glowY.set(py * 100)
  }

  const reset = () => {
    rotateX.set(0)
    rotateY.set(0)
    glowX.set(50)
    glowY.set(50)
  }

  /**
   * Lien invisible recouvrant la carte entière (« stretched link ») : il rend
   * la carte cliquable sans imbriquer de balise <a>, ce qui serait invalide.
   * Les éléments interactifs du contenu repassent devant avec « relative z-20 ».
   */
  const overlayLink = href && (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute inset-0 z-10 rounded-2xl"
    >
      <span className="sr-only">{linkLabel ?? 'Ouvrir le lien'}</span>
    </a>
  )

  if (reduceMotion) {
    return (
      <div className={`glass-card ${className}`}>
        {overlayLink}
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={`glass-card group/tilt [transform-style:preserve-3d] ${className}`}
    >
      {/* Halo qui suit le curseur */}
      <motion.span
        aria-hidden
        style={{ background: glowBackground }}
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
      />
      {/* Le contenu hérite de la hauteur pour permettre les mises en page en colonne.
          Le lien couvrant est placé dans ce même calque : la translation 3D crée un
          contexte d'empilement dont les enfants ne peuvent pas sortir. */}
      <div className="relative flex h-full flex-col [transform:translateZ(30px)]">
        {overlayLink}
        {children}
      </div>
    </motion.div>
  )
}
