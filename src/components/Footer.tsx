import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react'
import { navItems, profile, socials } from '../data/portfolio'

const socialIcons = {
  linkedin: Linkedin,
  github: Github,
  mail: Mail,
  phone: Mail,
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-ink/10 bg-page-2/60">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        {/* Identité */}
        <div>
          <a href="#accueil" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 font-display text-sm font-bold text-accent">
              {profile.initials}
            </span>
            <span className="font-display text-sm font-semibold text-ink">
              {profile.fullName}
            </span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/45">
            Développeur Web Full Stack basé à {profile.location}. Applications web sur mesure,
            ERP et bases de données.
          </p>
        </div>

        {/* Navigation */}
        <nav aria-label="Navigation de pied de page">
          <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-ink/40">Navigation</h3>
          <ul className="grid grid-cols-2 gap-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="link-underline text-sm">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact rapide */}
        <div>
          <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-ink/40">Restons en contact</h3>
          <a
            href={`mailto:${profile.email}`}
            className="group inline-flex items-center gap-2 text-sm text-ink/70 transition-colors hover:text-accent"
          >
            {profile.email}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>

          <div className="mt-5 flex gap-3">
            {socials.map((social) => {
              const Icon = socialIcons[social.icon]
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:text-accent"
                >
                  <Icon className="h-4 w-4" />
                </a>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container-page flex flex-col items-center justify-between gap-3 border-t border-ink/5 py-6 text-xs text-ink/35 sm:flex-row">
        <p>
          © {year} {profile.fullName}. Tous droits réservés.
        </p>
        <p>
          Conçu et développé avec React, Tailwind CSS et Framer Motion.
        </p>
      </div>
    </footer>
  )
}
