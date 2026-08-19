import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

/**
 * Fond animé en Canvas 2D : nuage de particules reliées entre elles,
 * légèrement attirées par la souris. Léger (aucune dépendance 3D),
 * mis en pause lorsque l'onglet est masqué et remplacé par un fond
 * statique si l'utilisateur préfère les animations réduites.
 */
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let frame = 0
    let running = true
    const mouse = { x: -9999, y: -9999 }

    /** Lit la couleur d'accent courante depuis les variables CSS */
    const readAccent = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '59 130 246'
    const readFg = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '255 255 255'
    let accent = readAccent()
    let fg = readFg()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const parent = canvas.parentElement
      width = parent?.clientWidth ?? window.innerWidth
      height = parent?.clientHeight ?? window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Densité adaptée à la taille de l'écran (moins de particules sur mobile)
      const count = Math.min(90, Math.floor((width * height) / 16000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.6,
      }))
    }

    const draw = () => {
      if (!running) return
      ctx.clearRect(0, 0, width, height)

      // Rafraîchit l'accent toutes les 60 frames (au cas où il change)
      if (frame % 60 === 0) {
        accent = readAccent()
        fg = readFg()
      }
      frame += 1

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        // Rebond sur les bords
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        // Légère attraction vers la souris
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.hypot(dx, dy)
        if (dist < 160 && dist > 0) {
          p.x += (dx / dist) * 0.35
          p.y += (dy / dist) * 0.35
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${accent.replace(/\s+/g, ',')}, 0.55)`
        ctx.fill()
      }

      // Liaisons entre particules proches
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(${fg.replace(/\s+/g, ',')}, ${0.12 * (1 - dist / 120)})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = event.clientX - rect.left
      mouse.y = event.clientY - rect.top
    }

    const onVisibility = () => {
      running = document.visibilityState === 'visible'
      if (running) animationId = requestAnimationFrame(draw)
    }

    let animationId = 0
    resize()
    animationId = requestAnimationFrame(draw)

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduceMotion])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Grille en fond */}
      <div className="absolute inset-0 bg-grid-fade bg-grid opacity-70" />

      {/* Halos colorés animés */}
      <div className="absolute -left-32 top-0 h-[38rem] w-[38rem] animate-blob rounded-full bg-accent/10 blur-[120px]" />
      <div
        className="absolute -right-24 top-40 h-[30rem] w-[30rem] animate-blob rounded-full bg-indigo-500/10 blur-[120px]"
        style={{ animationDelay: '-6s' }}
      />

      {/* Particules */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full mask-radial" />

      {/* Dégradé de raccord vers la section suivante */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-page" />
    </div>
  )
}
