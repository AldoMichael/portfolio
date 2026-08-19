/**
 * ============================================================================
 *  PHOTO DE PROFIL (admin)
 * ----------------------------------------------------------------------------
 *  Upload JPEG / PNG / WebP (2 Mo max), stocké en base et servi par GET /api/photo.
 * ============================================================================
 */

import { AlertCircle, Check, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { apiRequest, apiUpload, profilePhotoUrl } from '../lib/api'

export function PhotoEditor() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [version, setVersion] = useState<number>(() => Date.now())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [broken, setBroken] = useState(false)

  const preview = profilePhotoUrl(version)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await apiUpload<{ updatedAt: number }>('/api/photo', file)
      setVersion(result.updatedAt)
      setBroken(false)
      setSuccess('Photo enregistrée. Elle apparaît sur le loader et le Hero.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload impossible.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    if (!window.confirm('Supprimer la photo de profil ?')) return
    setSaving(true)
    setError(null)
    try {
      await apiRequest('/api/photo', { method: 'DELETE', auth: true })
      setVersion(Date.now())
      setBroken(true)
      setSuccess('Photo supprimée.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <header className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink">Photo de profil</h2>
        <p className="mt-1 text-sm text-ink/45">
          Affichée sur l’écran d’ouverture et à droite du nom, sur la page d’accueil. JPEG, PNG ou
          WebP, 2&nbsp;Mo maximum.
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
        <div className="relative h-40 w-40 overflow-hidden rounded-2xl border border-accent/30 bg-accent/10">
          {preview && !broken ? (
            <img
              src={preview}
              alt="Aperçu de la photo de profil"
              className="h-full w-full object-cover"
              onError={() => setBroken(true)}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm text-ink/40">
              Aucune photo
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
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
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {saving ? 'Envoi…' : 'Choisir une photo'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleRemove()}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm text-ink/70 transition-colors hover:border-rose-400/50 hover:text-rose-300"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
