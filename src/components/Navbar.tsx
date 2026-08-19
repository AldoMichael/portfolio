import { AnimatePresence, motion } from 'framer-motion'
import { Download, Palette, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { navItems, profile } from '../data/portfolio'
import { useActiveSection } from '../hooks/useActiveSection'
import { useScrolled } from '../hooks/useScrolled'
import { useAccent } from '../hooks/useAccent'
import { useCvUrl } from '../hooks/useCvUrl'
import { useProfilePhoto } from '../hooks/useProfilePhoto'
import { EASE } from '../lib/motion'
import { ThemeToggle } from './ThemeToggle'

// Liste stable des ancres observées (évite de recréer le tableau à chaque rendu)
const SECTION_IDS = navItems.map((item) => item.id)

export function Navbar() {
  const scrolled = useScrolled(60)
  const active = useActiveSection(SECTION_IDS)
  const [menuOpen, setMenuOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { accentIndex, setAccent, presets } = useAccent()
  const { src: photoSrc, show: showPhoto, onError } = useProfilePhoto()
  const cvUrl = useCvUrl()

  // Empêche le défilement de l'arrière-plan quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-ink/10 bg-page/80 py-3 backdrop-blur-xl'
            : 'border-b border-transparent py-5'
        }`}
      >
        <nav className="container-page flex items-center justify-between gap-4">
          {/* Logo / monogramme */}
          <a
            href="#accueil"
            className="group flex items-center gap-3"
            aria-label="Retour à l'accueil"
          >
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-accent/40 bg-accent/10 font-display text-sm font-bold text-accent transition-transform duration-300 group-hover:scale-110 group-hover:shadow-glow-sm">
              {showPhoto ? (
                <img
                  src={photoSrc!}
                  alt=""
                  onError={onError}
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.initials
              )}
            </span>
            <span className="hidden font-display text-sm font-semibold tracking-tight text-ink sm:block">
              {profile.firstName.split(' ')[0]}{' '}
              <span className="text-ink/40">{profile.lastName}</span>
            </span>
          </a>

          {/* Navigation bureau */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`relative block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    active === item.id ? 'text-ink' : 'text-ink/55 hover:text-ink'
                  }`}
                >
                  {/* Pastille de section active partagée entre les liens */}
                  {active === item.id && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full border border-accent/30 bg-accent/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Sélecteur de couleur d'accent */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPaletteOpen((open) => !open)}
                aria-label="Changer la couleur d'accent"
                aria-expanded={paletteOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/70 transition-colors hover:border-accent/50 hover:text-accent"
              >
                <Palette className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {paletteOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="absolute right-0 top-12 z-50 flex gap-2 rounded-2xl border border-ink/10 bg-page-3/95 p-3 backdrop-blur-xl"
                  >
                    {presets.map((preset, index) => (
                      <button
                        key={preset.name}
                        type="button"
                        title={preset.name}
                        aria-label={`Accent ${preset.name}`}
                        onClick={() => {
                          setAccent(index)
                          setPaletteOpen(false)
                        }}
                        style={{ backgroundColor: `rgb(${preset.value})` }}
                        className={`h-6 w-6 rounded-full transition-transform duration-200 hover:scale-125 ${
                          accentIndex === index ? 'ring-2 ring-ink/80 ring-offset-2 ring-offset-page-3' : ''
                        }`}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CV : visible à partir du format tablette */}
            <a
              href={cvUrl}
              download
              className="hidden items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/85 transition-all duration-300 hover:border-accent/60 hover:text-accent sm:inline-flex"
            >
              <Download className="h-4 w-4" />
              CV
            </a>

            {/* Bouton burger animé (mobile) */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-ink/10 transition-colors hover:border-accent/50 lg:hidden"
            >
              <span className="block h-px w-4 bg-ink/80" />
              <span className="block h-px w-4 bg-ink/80" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Menu plein écran (mobile) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[70] bg-page/95 backdrop-blur-xl lg:hidden"
          >
            <div className="container-page flex h-20 items-center justify-end">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer le menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/80 transition-colors hover:border-accent/60 hover:text-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
              className="container-page flex flex-col gap-2 pt-8"
            >
              {navItems.map((item, index) => (
                <motion.li
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, x: -24 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
                  }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-baseline gap-4 border-b border-ink/5 py-4 font-display text-3xl font-bold text-ink/85 transition-colors hover:text-accent"
                  >
                    <span className="font-mono text-xs text-accent/70">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>

            <div className="container-page mt-10">
              <a href={cvUrl} download className="btn-primary w-full sm:w-auto">
                <Download className="h-4 w-4" />
                Télécharger le CV
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
