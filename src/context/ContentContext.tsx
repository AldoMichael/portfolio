/**
 * ============================================================================
 *  CONTEXTE DE CONTENU
 * ----------------------------------------------------------------------------
 *  Fournit à toutes les sections le contenu dynamique servi par l'API CMS.
 *
 *  Principe de repli : le site s'affiche immédiatement avec le contenu statique
 *  de data/portfolio.ts, puis se met à jour dès que l'API répond. Si l'API est
 *  éteinte ou déployée sans backend, le portfolio reste parfaitement fonctionnel.
 * ============================================================================
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  about,
  education as staticEducation,
  experiences as staticExperiences,
  languages as staticLanguages,
  profile,
  projects as staticProjects,
  skillGroups as staticSkillGroups,
  socials as staticSocials,
} from '../data/portfolio'
import type {
  EducationItem,
  ExperienceItem,
  LanguageItem,
  ProjectItem,
  SkillGroup,
  SocialLink,
  StatItem,
} from '../data/portfolio'
import { apiRequest } from '../lib/api'

export type PortfolioContent = {
  experiences: ExperienceItem[]
  skillGroups: SkillGroup[]
  stats: StatItem[]
  projects: ProjectItem[]
  education: EducationItem[]
  languages: LanguageItem[]
  socials: SocialLink[]
  /** Valeurs globales (années d'expérience, disponibilité, accroche...) */
  settings: Record<string, string>
}

type ContentState = PortfolioContent & {
  /** Indique d'où provient le contenu affiché. */
  source: 'static' | 'api'
  loading: boolean
}

/* ---------------------------- Contenu de repli ----------------------------- */

const fallbackContent: PortfolioContent = {
  experiences: staticExperiences,
  skillGroups: staticSkillGroups,
  stats: about.stats,
  projects: staticProjects,
  education: staticEducation,
  languages: staticLanguages,
  socials: staticSocials,
  settings: {
    yearsOfExperience: String(profile.yearsOfExperience),
    availability: profile.availability,
    tagline: profile.tagline,
  },
}

const ContentContext = createContext<ContentState>({
  ...fallbackContent,
  source: 'static',
  loading: true,
})

/* -------------------------------- Normalisation ---------------------------- */

const ICONS = ['code', 'server', 'database', 'shield'] as const
const SOCIAL_ICONS = ['linkedin', 'github', 'mail', 'phone'] as const

/**
 * Ne remplace une liste que si l'API en renvoie une non vide : une table vide
 * en base ne doit jamais faire disparaître une section entière du site.
 */
function pick<T>(fromApi: unknown, fallback: T[]): T[] {
  return Array.isArray(fromApi) && fromApi.length > 0 ? (fromApi as T[]) : fallback
}

function normalize(payload: Partial<PortfolioContent> | null): PortfolioContent {
  if (!payload) return fallbackContent

  return {
    experiences: pick<ExperienceItem>(payload.experiences, fallbackContent.experiences),
    skillGroups: pick<SkillGroup>(payload.skillGroups, fallbackContent.skillGroups).map((group) => ({
      ...group,
      // L'icône vient d'un champ texte en base : on la ramène aux valeurs connues.
      icon: ICONS.includes(group.icon) ? group.icon : 'code',
    })),
    stats: pick<StatItem>(payload.stats, fallbackContent.stats),
    projects: pick<ProjectItem>(payload.projects, fallbackContent.projects),
    education: pick<EducationItem>(payload.education, fallbackContent.education),
    languages: pick<LanguageItem>(payload.languages, fallbackContent.languages),
    socials: pick<SocialLink>(payload.socials, fallbackContent.socials).map((social) => ({
      ...social,
      icon: SOCIAL_ICONS.includes(social.icon as (typeof SOCIAL_ICONS)[number])
        ? (social.icon as SocialLink['icon'])
        : 'linkedin',
    })),
    settings: { ...fallbackContent.settings, ...(payload.settings ?? {}) },
  }
}

/* --------------------------------- Provider -------------------------------- */

export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContentState>({
    ...fallbackContent,
    source: 'static',
    loading: true,
  })

  useEffect(() => {
    const controller = new AbortController()

    apiRequest<Partial<PortfolioContent>>('/api/content', { signal: controller.signal })
      .then((payload) => {
        setState({ ...normalize(payload), source: 'api', loading: false })
      })
      .catch(() => {
        // API injoignable : on conserve le contenu statique déjà affiché.
        setState((current) => ({ ...current, loading: false }))
      })

    return () => controller.abort()
  }, [])

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>
}

/* ---------------------------------- Hooks ---------------------------------- */

/** Accès au contenu du portfolio (API si disponible, statique sinon). */
export function useContent() {
  return useContext(ContentContext)
}

/** Lit un réglage global et le convertit en nombre. */
export function useNumericSetting(key: string, fallback: number) {
  const { settings } = useContent()
  return useMemo(() => {
    const parsed = Number(settings[key])
    return Number.isFinite(parsed) ? parsed : fallback
  }, [settings, key, fallback])
}
