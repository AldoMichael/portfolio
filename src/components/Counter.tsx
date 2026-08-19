import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type CounterProps = {
  value: number
  suffix?: string
  duration?: number
  className?: string
}

/** Compteur qui s'incrémente lorsqu'il entre dans le champ de vision. */
export function Counter({ value, suffix = '', duration = 1.4, className = '' }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduceMotion) {
      setDisplay(value)
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })
    return () => controls.stop()
  }, [inView, value, duration, reduceMotion])

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  )
}
