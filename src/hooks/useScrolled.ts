import { useEffect, useState } from 'react'

/**
 * Renvoie `true` dès que la page a défilé au-delà du seuil indiqué.
 * Sert à « solidifier » la navbar et à afficher le bouton retour en haut.
 */
export function useScrolled(threshold = 40): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}
