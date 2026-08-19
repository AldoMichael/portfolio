/**
 * Sécurisation des liens venant du CMS.
 *
 * L'API refuse déjà tout ce qui n'est pas http(s) ou un chemin interne ;
 * ce second filtre côté client protège l'affichage si une ancienne ligne
 * en base contenait autre chose (ex. « javascript: »).
 */
export function safeUrl(value?: string): string | undefined {
  const url = value?.trim()
  if (!url) return undefined

  const isExternal = /^https?:\/\//i.test(url)
  const isInternal = url.startsWith('/')

  return isExternal || isInternal ? url : undefined
}

/** Attributs à appliquer à un lien externe ouvert dans un nouvel onglet. */
export const EXTERNAL_LINK_PROPS = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const
