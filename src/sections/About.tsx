import { motion, useReducedMotion } from 'framer-motion'
import { Braces, Building2, Database, Users } from 'lucide-react'
import { Counter } from '../components/Counter'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { useContent, useNumericSetting } from '../context/ContentContext'
import { about, profile } from '../data/portfolio'
import { EASE } from '../lib/motion'

// Icônes associées aux chiffres clés (attribuées dans l'ordre d'affichage)
const statIcons = [Braces, Building2, Database, Users]

export function About() {
  const reduceMotion = useReducedMotion()

  // Statistiques et années d'expérience proviennent du CMS
  const { stats } = useContent()
  const yearsOfExperience = useNumericSetting('yearsOfExperience', profile.yearsOfExperience)

  return (
    <Section
      id="a-propos"
      eyebrow="01 — À propos"
      title={about.heading}
      description="Un profil hybride entre analyse métier, développement applicatif et sens du détail visuel."
    >
      <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        {/* Texte de présentation */}
        <div className="space-y-6">
          {about.paragraphs.map((paragraph, index) => (
            <Reveal key={index} delay={index * 0.12}>
              <p className="text-base leading-relaxed text-white/60 sm:text-lg">{paragraph}</p>
            </Reveal>
          ))}

          {/* Chiffres clés */}
          <div className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = statIcons[index % statIcons.length]
              return (
                <Reveal key={stat.label} delay={0.1 + index * 0.08}>
                  <div className="glass-card h-full p-4">
                    <Icon className="mb-3 h-4 w-4 text-accent" />
                    <p className="font-display text-3xl font-bold text-white">
                      <Counter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="mt-1 text-xs leading-snug text-white/45">{stat.label}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>

        {/* Carte de visite « code » */}
        <Reveal x={40} y={0} delay={0.15}>
          <motion.div
            whileHover={reduceMotion ? undefined : { y: -6 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="glass-card overflow-hidden"
          >
            {/* Barre de fenêtre */}
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-2 font-mono text-xs text-white/35">profil.ts</span>
            </div>

            {/* Extrait de code décoratif */}
            <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-white/60 no-scrollbar">
              <code>
                <span className="text-accent">const</span> profil = {'{'}
                {'\n'} nom: <span className="text-emerald-300/80">'{profile.lastName}'</span>,
                {'\n'} role: <span className="text-emerald-300/80">'Full Stack Developer'</span>,
                {'\n'} pays: <span className="text-emerald-300/80">'{profile.location}'</span>,
                {'\n'} experience: <span className="text-sky-300/80">{yearsOfExperience}</span>,
                {'\n'} stack: [<span className="text-emerald-300/80">'Laravel'</span>,{' '}
                <span className="text-emerald-300/80">'NestJS'</span>,{'\n'}          {' '}
                <span className="text-emerald-300/80">'Angular'</span>,{' '}
                <span className="text-emerald-300/80">'Oracle'</span>],
                {'\n'} disponible: <span className="text-sky-300/80">true</span>,
                {'\n'}
                {'}'}
              </code>
            </pre>
          </motion.div>
        </Reveal>
      </div>
    </Section>
  )
}
