/**
 * ============================================================================
 *  ADMINISTRATION DU CONTENU
 * ----------------------------------------------------------------------------
 *  Accessible sur /admin. Écran de connexion, puis tableau de bord listant
 *  les ressources éditables (parcours, technologies, statistiques, projets,
 *  formation, langues, réglages).
 * ============================================================================
 */

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, LayoutGrid, Loader2, LockKeyhole, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiRequest, getToken, setToken } from '../lib/api'
import { ThemeToggle } from '../components/ThemeToggle'
import { PhotoEditor } from './PhotoEditor'
import { ResourceEditor } from './ResourceEditor'
import type { ResourceDef } from './types'

export default function AdminApp() {
  const [email, setEmail] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  // Au chargement, on vérifie si le jeton mémorisé est encore valable.
  useEffect(() => {
    if (!getToken()) {
      setChecking(false)
      return
    }

    apiRequest<{ email: string }>('/api/auth/me', { auth: true })
      .then((user) => setEmail(user.email))
      .catch(() => setToken(null))
      .finally(() => setChecking(false))
  }, [])

  function handleLogout() {
    setToken(null)
    setEmail(null)
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  return email ? (
    <Dashboard email={email} onLogout={handleLogout} />
  ) : (
    <Login onSuccess={setEmail} />
  )
}

/* --------------------------------- Connexion -------------------------------- */

function Login({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await apiRequest<{ accessToken: string; email: string }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      setToken(result.accessToken)
      onSuccess(result.email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-page px-5">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-sm p-8"
      >
        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
          <LockKeyhole className="h-5 w-5" />
        </span>

        <h1 className="font-display text-2xl font-bold text-ink">Administration</h1>
        <p className="mt-1.5 text-sm text-ink/45">
          Connectez-vous pour gérer le contenu du portfolio.
        </p>

        <div className="mt-7 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink/45">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-page-2/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent/60"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink/45">
              Mot de passe
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-page-2/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent/60"
            />
          </label>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-start gap-2 text-sm text-rose-300"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>

        <a href="/" className="link-underline mt-6 inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour au site
        </a>
      </motion.form>
    </div>
  )
}

/* ------------------------------- Tableau de bord ---------------------------- */

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [resources, setResources] = useState<ResourceDef[]>([])
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiRequest<ResourceDef[]>('/api/schema')
      .then((list) => {
        setResources(list)
        setActiveKey((current) => current ?? '_photo')
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Schéma indisponible.'))
  }, [])

  const navItems = [{ key: '_photo', label: 'Photo de profil' }, ...resources]
  const active = resources.find((resource) => resource.key === activeKey)

  return (
    <div className="min-h-screen bg-page">
      {/* Barre supérieure */}
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-page/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-4 sm:px-8">
          <span className="flex items-center gap-2.5 font-display font-bold text-ink">
            <LayoutGrid className="h-5 w-5 text-accent" />
            Contenu du portfolio
          </span>

          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <span className="hidden text-sm text-ink/40 sm:inline">{email}</span>
            <a href="/" className="link-underline text-sm">
              Voir le site
            </a>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm text-ink/70 transition-colors hover:border-rose-400/50 hover:text-rose-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:flex">
        {/* Navigation entre les ressources */}
        <nav className="mb-8 lg:mb-0 lg:w-56 lg:shrink-0">
          <ul className="flex gap-2 overflow-x-auto pb-2 no-scrollbar lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((resource) => (
              <li key={resource.key} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => setActiveKey(resource.key)}
                  className={`w-full whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    resource.key === activeKey
                      ? 'bg-accent/10 text-accent'
                      : 'text-ink/50 hover:bg-ink/5 hover:text-ink'
                  }`}
                >
                  {resource.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">
          {error && (
            <p className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          {activeKey === '_photo' ? (
            <PhotoEditor />
          ) : (
            active && <ResourceEditor key={active.key} resource={active} />
          )}
        </main>
      </div>
    </div>
  )
}
