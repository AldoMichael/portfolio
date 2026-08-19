import { motion, useInView, useReducedMotion } from 'framer-motion'
import { GraduationCap, Languages as LanguagesIcon } from 'lucide-react'
import { useRef } from 'react'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { useContent } from '../context/ContentContext'
import { EASE } from '../lib/motion'

/**
 * Section « Parcours » : regroupe la formation et les langues,
 * avec des barres de progression animées à l'entrée dans le viewport.
 */
export function Journey() {
  // Formation et langues gérées depuis le CMS
  const { education, languages } = useContent()

  return (
    <Section
      id="parcours"
      eyebrow="05 — Parcours"
      title="Formation & langues"
      description="Une base académique en informatique, complétée par une pratique quotidienne en environnement international."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formation */}
        <Reveal x={-24} y={0}>
          <div className="glass-card h-full p-6 sm:p-8">
            <header className="mb-7 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                <GraduationCap className="h-5 w-5" />
              </span>
              <h3 className="font-display text-xl font-semibold text-ink">Formation</h3>
            </header>

            <ul className="space-y-6">
              {education.map((item) => (
                <li key={item.degree} className="relative border-l border-ink/10 pl-6">
                  <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                  <span className="font-mono text-xs uppercase tracking-widest text-accent">
                    {item.year}
                  </span>
                  <h4 className="mt-2 font-display text-lg font-semibold text-ink">
                    {item.degree}
                  </h4>
                  <p className="mt-1 text-sm text-ink/50">{item.school}</p>
                  {item.detail && (
                    <p className="mt-2 text-sm leading-relaxed text-ink/45">{item.detail}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Langues */}
        <Reveal x={24} y={0} delay={0.1}>
          <div className="glass-card h-full p-6 sm:p-8">
            <header className="mb-7 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                <LanguagesIcon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-xl font-semibold text-ink">Langues</h3>
            </header>

            <ul className="space-y-7">
              {languages.map((language, index) => (
                <LanguageBar
                  key={language.name}
                  name={language.name}
                  level={language.level}
                  value={language.value}
                  delay={index * 0.15}
                />
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

type LanguageBarProps = {
  name: string
  level: string
  value: number
  delay: number
}

/** Barre de progression animée représentant le niveau de langue. */
function LanguageBar({ name, level, value, delay }: LanguageBarProps) {
  const ref = useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduceMotion = useReducedMotion()

  return (
    <li ref={ref}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-display text-base font-semibold text-ink">{name}</span>
        <span className="text-sm text-ink/45">{level}</span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-ink/[0.06]"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Niveau de ${name} : ${level}`}
      >
        <motion.div
          initial={reduceMotion ? undefined : { width: 0 }}
          animate={inView ? { width: `${value}%` } : undefined}
          transition={{ duration: 1.2, delay, ease: EASE }}
          className="h-full rounded-full bg-accent-gradient shadow-glow-sm"
          style={reduceMotion ? { width: `${value}%` } : undefined}
        />
      </div>
    </li>
  )
}
