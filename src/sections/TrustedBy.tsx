import { useState } from 'react'
import { motion } from 'framer-motion'
import { Section } from '../components/Section'
import { useContent } from '../context/ContentContext'
import type { ClientItem } from '../data/portfolio'
import { EXTERNAL_LINK_PROPS, safeUrl } from '../lib/links'
import { fadeUp, staggerContainer, viewportOnce } from '../lib/motion'

export function TrustedBy() {
  const { clients } = useContent()

  if (clients.length === 0) return null

  return (
    <Section
      id="confiance"
      eyebrow="05 — Confiance"
      title="Ils nous ont fait confiance"
      description="Des organisations avec lesquelles j’ai collaboré, en mission, en freelance ou en équipe."
    >
      <motion.ul
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.08)}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {clients.map((client) => (
          <motion.li key={client.name} variants={fadeUp}>
            <ClientCard client={client} />
          </motion.li>
        ))}
      </motion.ul>
    </Section>
  )
}

function ClientCard({ client }: { client: ClientItem }) {
  const [logoFailed, setLogoFailed] = useState(false)
  const logo = safeUrl(client.logoUrl)
  const href = safeUrl(client.href)
  const showLogo = Boolean(logo) && !logoFailed

  const inner = (
    <div className="glass-card group flex h-full min-h-[7.5rem] flex-col items-center justify-center gap-3 p-6 text-center transition-colors duration-300 hover:border-accent/40">
      {showLogo ? (
        <img
          src={logo}
          alt=""
          onError={() => setLogoFailed(true)}
          className="max-h-12 max-w-[10rem] object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
        />
      ) : null}
      <span className="font-display text-sm font-semibold tracking-tight text-ink/80 group-hover:text-ink">
        {client.name}
      </span>
    </div>
  )

  if (!href) return inner

  return (
    <a href={href} {...EXTERNAL_LINK_PROPS} aria-label={client.name} className="block h-full">
      {inner}
    </a>
  )
}
