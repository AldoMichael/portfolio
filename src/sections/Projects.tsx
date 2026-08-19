import { motion } from 'framer-motion'
import { ArrowUpRight, CalendarDays, MapPin, PlayCircle, Sparkles } from 'lucide-react'
import { Section } from '../components/Section'
import { TiltCard } from '../components/TiltCard'
import { useContent } from '../context/ContentContext'
import { EXTERNAL_LINK_PROPS, safeUrl } from '../lib/links'
import { fadeUp, staggerContainer, viewportOnce } from '../lib/motion'

export function Projects() {
  // Applications métier gérées depuis le CMS
  const { projects } = useContent()

  return (
    <Section
      id="projets"
      eyebrow="04 — Projets freelance"
      title="Des applications métier livrées de bout en bout"
      description={
        'Analyse du besoin, conception, développement et mise en service\u00A0: trois projets récents réalisés en freelance.'
      }
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.12)}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((project) => {
          // Liens facultatifs saisis dans l'administration
          const link = safeUrl(project.url)
          const demo = safeUrl(project.demoUrl)

          return (
            <motion.div key={project.title} variants={fadeUp} className="h-full">
              <TiltCard
                className="flex h-full flex-col p-6"
                href={link}
                linkLabel={`Ouvrir le projet ${project.title}`}
              >
              {/* En-tête : date + icône (flèche si la carte mène quelque part) */}
              <div className="mb-5 flex items-start justify-between gap-4">
                <span className="inline-flex items-center gap-2 font-mono text-xs text-accent">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {project.date}
                </span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border bg-ink/[0.04] text-accent transition-colors duration-300 ${
                    link ? 'border-accent/30 group-hover/tilt:bg-accent/15' : 'border-ink/10'
                  }`}
                >
                  {link ? (
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/tilt:-translate-y-0.5 group-hover/tilt:translate-x-0.5" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </span>
              </div>

              <h3 className="font-display text-lg font-semibold leading-snug text-ink">
                {project.title}
              </h3>

              <p className="mt-2 inline-flex items-center gap-2 text-sm text-ink/45">
                <MapPin className="h-3.5 w-3.5" />
                {project.client} — {project.location}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-ink/60">{project.summary}</p>

              <ul className="mt-5 flex-1 space-y-2">
                {project.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3 text-sm leading-relaxed text-ink/55">
                    <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/80" />
                    {highlight}
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-ink/5 pt-5">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-ink/[0.05] px-2.5 py-1 text-[11px] uppercase tracking-wider text-ink/45"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* « relative z-20 » fait passer le bouton devant le lien de carte */}
                {demo && (
                  <a
                    href={demo}
                    {...EXTERNAL_LINK_PROPS}
                    className="relative z-20 mt-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent transition-colors duration-300 hover:bg-accent/20"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    Voir la démo
                  </a>
                )}
              </div>
              </TiltCard>
            </motion.div>
          )
        })}
      </motion.div>
    </Section>
  )
}
