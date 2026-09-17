import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowDown, Download, Mail, MapPin, Sparkles } from 'lucide-react'
import { useRef } from 'react'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { Magnetic } from '../components/Magnetic'
import { Typewriter } from '../components/Typewriter'
import { useContent } from '../context/ContentContext'
import { profile } from '../data/portfolio'
import { useCvUrl } from '../hooks/useCvUrl'
import { useProfilePhoto } from '../hooks/useProfilePhoto'
import { useCutoutPhoto } from '../hooks/useCutoutPhoto'
import { EASE } from '../lib/motion'

/**
 * Découpe le nom en lignes → mots → lettres.
 * Le découpage par mot évite toute césure au milieu du nom,
 * et l'index global permet une cascade régulière lettre par lettre.
 */
let letterCounter = 0
const NAME_LINES = [profile.firstName, profile.lastName].map((line) =>
  line.split(' ').map((word) => ({
    word,
    letters: word.split('').map((char) => ({ char, index: letterCounter++ })),
  })),
)

export function Hero() {
  const reduceMotion = useReducedMotion()

  // Accroche et statut de disponibilité gérés depuis le CMS
  const { settings } = useContent()
  const { src: photoSrc, show: showPhoto, onError } = useProfilePhoto()
  const { src: cutoutSrc, show: showCutout, onError: onCutoutError } = useCutoutPhoto(
    showPhoto ? photoSrc : null,
  )
  const cvUrl = useCvUrl()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const photoX = useTransform(scrollYProgress, [0, 1], ['12%', '-55%'])
  const photoXSmooth = useSpring(photoX, { stiffness: 80, damping: 26, restDelta: 0.001 })

  return (
    <section
      id="accueil"
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-8 pt-28 sm:pb-12 sm:pt-32"
    >
      <AnimatedBackground />

      <div className="container-page relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,28rem)] lg:gap-12 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,30rem)]">
        <div className="relative z-20 min-w-0">
          {/* Badge de disponibilité */}
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="chip mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {settings.availability}
          </motion.div>

          {/* Nom : révélation lettre par lettre, sans césure au milieu des mots */}
          <h1 className="text-gradient-light">
            {/* Version lisible par les lecteurs d'écran (le rendu animé est décoratif) */}
            <span className="sr-only">{profile.fullName}</span>

            {NAME_LINES.map((line, lineIndex) => (
              <span
                key={lineIndex}
                aria-hidden
                className={`block ${
                  lineIndex === 0
                    ? 'text-display-xl'
                    : 'text-[clamp(1.55rem,3.4vw,2.85rem)] leading-[1.12] tracking-tight'
                }`}
              >
                {line.map(({ word, letters }, wordIndex) => (
                  <span key={word}>
                    {/* Espace réel entre les mots : autorise le retour à la ligne */}
                    {wordIndex > 0 && ' '}
                    <span className="inline-block whitespace-nowrap">
                      {letters.map(({ char, index }) => (
                        <motion.span
                          key={index}
                          className="inline-block"
                          initial={
                            reduceMotion ? undefined : { opacity: 0, y: '0.45em', rotateX: -60 }
                          }
                          animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
                          transition={{ duration: 0.7, delay: 0.25 + index * 0.025, ease: EASE }}
                        >
                          {char}
                        </motion.span>
                      ))}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          {/* Titre animé (machine à écrire) */}
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
            className="mt-6 flex items-center gap-3"
          >
            <Sparkles className="h-5 w-5 shrink-0 text-accent" />
            <p className="font-display text-xl font-semibold text-ink/90 sm:text-3xl">
              <Typewriter words={profile.titles} />
            </p>
          </motion.div>

          {/* Accroche */}
          <motion.p
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.05, ease: EASE }}
            className="mt-7 max-w-2xl text-base leading-relaxed text-ink/55 sm:text-lg"
          >
            {settings.tagline}
          </motion.p>

          {/* Localisation */}
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.15, ease: EASE }}
            className="mt-5 inline-flex items-center gap-2 text-sm text-ink/45"
          >
            <MapPin className="h-4 w-4 text-accent" />
            {profile.location}
          </motion.div>

          {/* Appels à l'action */}
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.3, ease: EASE }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <a href="#projets" className="btn-primary">
                Voir mes projets
                <ArrowDown className="h-4 w-4" />
              </a>
            </Magnetic>

            <Magnetic>
              <a href="#contact" className="btn-ghost">
                <Mail className="h-4 w-4" />
                Me contacter
              </a>
            </Magnetic>

            <Magnetic>
              <a
                href={cvUrl}
                download
                className="group inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-ink/60 transition-colors hover:text-accent"
              >
                <Download className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                <span className="link-underline">Télécharger le CV</span>
              </a>
            </Magnetic>
          </motion.div>
        </div>

          {showCutout && (
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 48, scale: 0.92 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.95, delay: 0.35, ease: EASE }}
              className="relative z-10 mx-auto w-full max-w-sm max-lg:order-first lg:max-w-none"
            >
              <motion.img
                src={cutoutSrc!}
                alt={`Portrait de ${profile.fullName}`}
                onError={(event) => {
                  onCutoutError()
                  onError()
                  event.currentTarget.style.visibility = 'hidden'
                }}
                style={reduceMotion ? undefined : { x: photoXSmooth }}
                className="relative mx-auto h-auto max-h-[min(38rem,72vh)] w-full origin-bottom object-contain object-bottom drop-shadow-[0_28px_50px_rgb(0_0_0_/_0.5)] lg:max-h-[min(44rem,78vh)]"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Indicateur de défilement */}
      <motion.a
        href="#a-propos"
        aria-label="Défiler vers la section suivante"
        initial={reduceMotion ? undefined : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-ink/35 transition-colors hover:text-accent sm:flex"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Défiler</span>
        <span className="flex h-10 w-6 justify-center rounded-full border border-ink/20 p-1">
          <motion.span
            animate={reduceMotion ? undefined : { y: [0, 12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="h-1.5 w-1 rounded-full bg-accent"
          />
        </span>
      </motion.a>
    </section>
  )
}
