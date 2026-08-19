import { useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { Section } from '../components/Section'
import { useContent } from '../context/ContentContext'
import type { ClientItem } from '../data/portfolio'
import { clientLogoUrl } from '../lib/api'
import { EXTERNAL_LINK_PROPS, safeUrl } from '../lib/links'

export function TrustedBy() {
  const { clients } = useContent()
  const reduceMotion = useReducedMotion()

  if (clients.length === 0) return null

  // Deux copies pour une boucle sans à-coup (translation de -50 %).
  const loop = reduceMotion ? clients : [...clients, ...clients]

  return (
    <Section
      id="confiance"
      eyebrow="05 — Confiance"
      title="Ils nous ont fait confiance"
      description="Des organisations avec lesquelles j’ai collaboré, en mission, en freelance ou en équipe."
    >
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-page to-transparent sm:w-20"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-page to-transparent sm:w-20"
        />

        <ul
          className={
            reduceMotion
              ? 'flex flex-wrap justify-center gap-4'
              : 'flex w-max gap-4 hover:[animation-play-state:paused] animate-marquee'
          }
        >
          {loop.map((client, index) => (
            <li key={`${client.name}-${index}`} className="w-56 shrink-0" aria-hidden={index >= clients.length}>
              <ClientCard client={client} />
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

function ClientCard({ client }: { client: ClientItem }) {
  const [logoFailed, setLogoFailed] = useState(false)
  const uploaded = clientLogoUrl(client.id, client.logoVersion)
  const linked = safeUrl(client.logoUrl)
  const logo = uploaded ?? linked
  const href = safeUrl(client.href)
  const showLogo = Boolean(logo) && !logoFailed

  const inner = (
    <div className="glass-card group flex h-full min-h-[7.5rem] flex-col items-center justify-center gap-3 p-6 text-center transition-colors duration-300 hover:border-accent/40">
      {showLogo ? (
        <img
          src={logo}
          alt=""
          onError={() => setLogoFailed(true)}
          className="max-h-12 max-w-[10rem] object-contain opacity-90 transition duration-300 group-hover:opacity-100"
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
