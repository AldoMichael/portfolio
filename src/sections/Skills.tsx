import { motion } from 'framer-motion'
import { Code2, Database, Server, ShieldCheck } from 'lucide-react'
import { Section } from '../components/Section'
import { useContent } from '../context/ContentContext'
import { popIn, staggerContainer, viewportOnce } from '../lib/motion'

// Correspondance entre le nom d'icône du fichier de données et l'icône Lucide
const iconMap = {
  code: Code2,
  server: Server,
  database: Database,
  shield: ShieldCheck,
}

export function Skills() {
  // Groupes de technologies gérés depuis le CMS
  const { skillGroups } = useContent()

  return (
    <Section
      id="competences"
      eyebrow="02 — Compétences"
      title="Les technologies que j'utilise au quotidien"
      description="Du front à la base de données, en passant par les plateformes ERP et la gestion des identités."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {skillGroups.map((group, groupIndex) => {
          const Icon = iconMap[group.icon]

          return (
            <motion.article
              key={group.title}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={staggerContainer(0.05, groupIndex * 0.08)}
              className="glass-card group relative overflow-hidden p-6 sm:p-7"
            >
              {/* Halo d'accent au survol */}
              <span className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

              <motion.div variants={popIn} className="mb-5 flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{group.title}</h3>
                  <p className="mt-1 text-sm text-ink/45">{group.description}</p>
                </div>
              </motion.div>

              {/* Badges de compétences en cascade */}
              <ul className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <motion.li key={item} variants={popIn}>
                    <span className="inline-flex cursor-default items-center rounded-lg border border-ink/10 bg-ink/[0.04] px-3 py-1.5 text-sm text-ink/75 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/10 hover:text-accent">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.article>
          )
        })}
      </div>
    </Section>
  )
}
