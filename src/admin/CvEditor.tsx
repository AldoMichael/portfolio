/**
 * ============================================================================
 *  CV TÉLÉCHARGEABLE (admin)
 * ----------------------------------------------------------------------------
 *  Upload d’un PDF déjà rédigé. Le site ne génère jamais de CV automatiquement.
 * ============================================================================
 */

import { AlertCircle, Check, FileUp, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { apiRequest, apiUpload, cvDownloadUrl } from '../lib/api'

export function CvEditor() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [version, setVersion] = useState<number | null>(null)
  const [filename, setFilename] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    apiRequest<{ cvVersion?: number | null; cvFilename?: string | null }>('/api/content')
      .then((payload) => {
        if (typeof payload.cvVersion === 'number') setVersion(payload.cvVersion)
        if (typeof payload.cvFilename === 'string') setFilename(payload.cvFilename)
      })
      .catch(() => {
        /* L’aperçu se mettra à jour après un upload. */
      })
  }, [])

  const href = cvDownloadUrl(version)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await apiUpload<{ updatedAt: number; filename: string }>('/api/cv', file)
      setVersion(result.updatedAt)
      setFilename(result.filename)
      setSuccess('CV enregistré. Les boutons « Télécharger le CV » du site l’utilisent.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload impossible.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    if (!window.confirm('Supprimer le CV uploadé ? Le site reprendra le PDF par défaut s’il existe.')) {
      return
    }
    setSaving(true)
    setError(null)
    try {
      await apiRequest('/api/cv', { method: 'DELETE', auth: true })
      setVersion(null)
      setFilename(null)
      setSuccess('CV supprimé.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <header className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink">CV téléchargeable</h2>
        <p className="mt-1 text-sm text-ink/45">
          Envoyez votre propre fichier PDF. Le site ne génère pas de CV : il se contente de le
          proposer au téléchargement. 4&nbsp;Mo maximum.
        </p>
      </header>

      {error && (
        <p className="mb-5 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      {success && (
        <p className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <Check className="h-4 w-4 shrink-0" />
          {success}
        </p>
      )}

      <div className="glass-card flex flex-col items-start gap-6 p-6 sm:flex-row sm:items-center">
        <div className="flex h-24 w-40 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 px-3 text-center text-sm text-ink/55">
          {filename ?? (version ? 'CV.pdf' : 'Aucun PDF uploadé')}
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(event) => {
              void handleFile(event.target.files?.[0])
              event.target.value = ''
            }}
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => inputRef.current?.click()}
            className="btn-primary !px-5 !py-2.5"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            {saving ? 'Envoi…' : 'Choisir un PDF'}
          </button>
          {href && (
            <a
              href={href}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm text-ink/70 transition-colors hover:border-accent/50 hover:text-accent"
            >
              Télécharger
            </a>
          )}
          <button
            type="button"
            disabled={saving || !version}
            onClick={() => void handleRemove()}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm text-ink/70 transition-colors hover:border-rose-400/50 hover:text-rose-300 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
