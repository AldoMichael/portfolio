/**
 * ============================================================================
 *  CLIENT API
 * ----------------------------------------------------------------------------
 *  Petite couche au-dessus de fetch pour dialoguer avec l'API NestJS :
 *  construction des URLs, en-tête d'authentification et gestion des erreurs.
 * ============================================================================
 */

/**
 * Définie dans .env (VITE_API_URL).
 * À défaut : le serveur local en développement, la même origine en production
 * — jamais « localhost » sur un site déployé, ce qui produirait des appels
 * voués à l'échec au lieu d'un repli propre sur le contenu statique.
 */
export const API_URL =
  import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3001' : '')

const TOKEN_KEY = 'portfolio.admin.token'

/* ------------------------------ Jeton d'accès ------------------------------ */

export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* localStorage indisponible (navigation privée) : on ignore silencieusement */
  }
}

/* -------------------------------- Requêtes --------------------------------- */

/** Erreur d'API portant le code HTTP, pour distinguer un 401 du reste. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  /** Joint le jeton d'administration à la requête. */
  auth?: boolean
  signal?: AbortSignal
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, signal } = options
  const headers: Record<string, string> = {}

  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (auth) {
    const token = getToken()
    if (!token) throw new ApiError('Session expirée, veuillez vous reconnecter.', 401)
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError("Impossible de joindre l'API. Vérifiez qu'elle est démarrée.", 0)
  }

  if (!response.ok) {
    // Un 401 signifie que le jeton n'est plus valable : on le purge.
    if (response.status === 401) setToken(null)

    const payload = await response.json().catch(() => null)
    const message = Array.isArray(payload?.message)
      ? payload.message.join(', ')
      : (payload?.message ?? `Erreur ${response.status}`)

    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** Envoi d'un fichier (FormData) — ne pas forcer Content-Type JSON. */
export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const token = getToken()
  if (!token) throw new ApiError('Session expirée, veuillez vous reconnecter.', 401)

  const body = new FormData()
  body.append('file', file)

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body,
    })
  } catch {
    throw new ApiError("Impossible de joindre l'API. Vérifiez qu'elle est démarrée.", 0)
  }

  if (!response.ok) {
    if (response.status === 401) setToken(null)
    const payload = await response.json().catch(() => null)
    const message = Array.isArray(payload?.message)
      ? payload.message.join(', ')
      : (payload?.message ?? `Erreur ${response.status}`)
    throw new ApiError(message, response.status)
  }

  return (await response.json()) as T
}

/** URL publique de la photo, uniquement si une version est connue (évite le cache 404). */
export function profilePhotoUrl(version: number | null | undefined): string | null {
  if (!API_URL || !version) return null
  return `${API_URL}/api/photo?v=${version}`
}

/** URL du CV uploadé depuis l’admin, ou null s’il n’y en a pas. */
export function cvDownloadUrl(version: number | null | undefined): string | null {
  if (!API_URL || !version) return null
  return `${API_URL}/api/cv?v=${version}`
}
