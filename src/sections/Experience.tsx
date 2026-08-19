import { motion, useInView, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { ArrowUpRight, Building2, MapPin, PlayCircle } from 'lucide-react'
import { useRef } from 'react'
import { Section } from '../components/Section'
import { useContent } from '../context/ContentContext'
import type { ExperienceItem } from '../data/portfolio'
import { EXTERNAL_LINK_PROPS, safeUrl } from '../lib/links'
import { EASE } from '../lib/motion'

export function Experience() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  // Parcours professionnel géré depuis le CMS
  const { experiences } = useContent()

  // La ligne verticale se « dessine » au fur et à mesure du défilement
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 75%', 'end 60%'],
  })
  const lineScale = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 })

  return (
    <Section
      id="experience"
      eyebrow="03 — Expérience"
      title="Un parcours entre ERP, web et design"
      description={
        'Cinq postes, trois pays et une constante\u00A0: livrer des applications qui répondent à un vrai besoin métier.'
      }
    >
      <div ref={containerRef} className="relative pl-8 sm:pl-12">
        {/* Rail de la timeline */}
        <div className="absolute bottom-0 left-[7px] top-2 w-px bg-white/10 sm:left-[15px]" />
        <motion.div
          aria-hidden
          style={{ scaleY: reduceMotion ? 1 : lineScale }}
          className="absolute bottom-0 left-[7px] top-2 w-px origin-top bg-gradient-to-b from-accent via-accent/70 to-transparent sm:left-[15px]"
        />

        <ol className="space-y-10">
          {experiences.map((item, index) => (
            <TimelineItem key={`${item.company}-${item.period}`} item={item} index={index} />
          ))}
        </ol>
      </div>
    </Section>
  )
}

/** Une entrée de la timeline : point lumineux + carte de contenu. */
function TimelineItem({ item, index }: { item: ExperienceItem; index: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const reduceMotion = useReducedMotion()

  // Liens facultatifs saisis dans l'administration
  const link = safeUrl(item.url)
  const demo = safeUrl(item.demoUrl)

  return (
    <li ref={ref} className="relative">
      {/* Point de la timeline, qui s'illumine à l'arrivée dans le viewport */}
      <motion.span
        aria-hidden
        initial={reduceMotion ? undefined : { scale: 0.4, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.5, ease: EASE }}
        className={`absolute -left-8 top-2 flex h-4 w-4 items-center justify-center rounded-full border sm:-left-12 ${
          inView ? 'border-accent bg-accent/20' : 'border-white/20 bg-night-800'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
            inView ? 'bg-accent shadow-glow-sm' : 'bg-white/30'
          }`}
        />
        {item.current && inView && (
          <span className="absolute inset-0 animate-pulse-ring rounded-full border border-accent/60" />
        )}
      </motion.span>

      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 28 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, delay: index * 0.05, ease: EASE }}
        className="glass-card group p-5 sm:p-7"
      >
        {/* Lien couvrant toute la carte, si une URL a été renseignée */}
        {link && (
          <a
            href={link}
            {...EXTERNAL_LINK_PROPS}
            className="absolute inset-0 z-10 rounded-2xl"
          >
            <span className="sr-only">
              Ouvrir le lien de {item.role} chez {item.company}
            </span>
          </a>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            {item.period}
          </span>
          {item.current && (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              Poste le plus récent
            </span>
          )}
        </div>

        <h3 className="mt-3 flex items-center gap-2 font-display text-xl font-semibold text-white sm:text-2xl">
          {item.role}
          {link && (
            <ArrowUpRight className="h-5 w-5 shrink-0 text-accent transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          )}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/50">
          <span className="inline-flex items-center gap-2">
            <Building2 className="h-4 w-4 text-white/30" />
            {item.company}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-white/30" />
            {item.location}
          </span>
        </div>

        <ul className="mt-5 space-y-2.5">
          {item.tasks.map((task) => (
            <li key={task} className="flex gap-3 text-sm leading-relaxed text-white/60">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/70" />
              {task}
            </li>
          ))}
        </ul>

        {item.tags && (
          <div className="mt-5 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-white/50 transition-colors hover:border-accent/40 hover:text-accent"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* « relative z-20 » fait passer le bouton devant le lien de carte */}
        {demo && (
          <a
            href={demo}
            {...EXTERNAL_LINK_PROPS}
            className="relative z-20 mt-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent transition-colors duration-300 hover:bg-accent/20"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Voir la démo
          </a>
        )}
      </motion.div>
    </li>
  )
}
