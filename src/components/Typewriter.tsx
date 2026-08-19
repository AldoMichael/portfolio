import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

type TypewriterProps = {
  /** Liste des mots/expressions qui s'écrivent puis s'effacent en boucle */
  words: string[]
  className?: string
  typingSpeed?: number
  deletingSpeed?: number
  /** Pause une fois le mot entièrement écrit */
  pause?: number
}

/**
 * Effet « machine à écrire » avec curseur clignotant.
 * En mode animations réduites, les mots sont simplement affichés.
 */
export function Typewriter({
  words,
  className = '',
  typingSpeed = 75,
  deletingSpeed = 40,
  pause = 1800,
}: TypewriterProps) {
  const reduceMotion = useReducedMotion()
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (reduceMotion) return
    const current = words[wordIndex % words.length]

    // Mot complet : on marque une pause avant d'effacer
    if (!deleting && text === current) {
      const timeout = window.setTimeout(() => setDeleting(true), pause)
      return () => window.clearTimeout(timeout)
    }

    // Mot effacé : on passe au suivant
    if (deleting && text === '') {
      setDeleting(false)
      setWordIndex((index) => (index + 1) % words.length)
      return
    }

    const timeout = window.setTimeout(
      () => {
        setText((previous) =>
          deleting ? current.slice(0, previous.length - 1) : current.slice(0, previous.length + 1),
        )
      },
      deleting ? deletingSpeed : typingSpeed,
    )

    return () => window.clearTimeout(timeout)
  }, [text, deleting, wordIndex, words, typingSpeed, deletingSpeed, pause, reduceMotion])

  if (reduceMotion) {
    return <span className={className}>{words.join(' / ')}</span>
  }

  return (
    <span className={className}>
      <span>{text}</span>
      {/* Curseur clignotant */}
      <span className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.08em] animate-pulse bg-accent align-middle" />
    </span>
  )
}
