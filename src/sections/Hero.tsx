import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, Download, Mail, MapPin, Sparkles } from 'lucide-react'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { Magnetic } from '../components/Magnetic'
import { Typewriter } from '../components/Typewriter'
import { useContent } from '../context/ContentContext'
import { profile } from '../data/portfolio'
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

  return (
    <section
      id="accueil"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-20 pt-32"
    >
      <AnimatedBackground />

      <div className="container-page relative z-10">
        <div className="max-w-4xl">
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
                    : 'text-[clamp(1.5rem,5vw,4.25rem)] leading-[1.05] tracking-tight'
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
                href={profile.cvUrl}
                download
                className="group inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-ink/60 transition-colors hover:text-accent"
              >
                <Download className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                <span className="link-underline">Télécharger le CV</span>
              </a>
            </Magnetic>
          </motion.div>
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
