/**
 * ============================================================================
 *  ÉDITEUR DE RESSOURCE
 * ----------------------------------------------------------------------------
 *  Composant générique : la liste et le formulaire sont entièrement construits
 *  à partir du schéma renvoyé par l'API. Ajouter un champ côté serveur suffit
 *  donc à le voir apparaître ici, sans modifier ce fichier.
 * ============================================================================
 */

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { apiRequest, apiUpload, clientLogoUrl } from '../lib/api'
import type { FieldDef, FormValues, ResourceDef, ResourceRow } from './types'
import { rowSubtitle, rowTitle, toFormValues, toPayload, validate } from './types'

/** Identifiant fictif utilisé lorsqu'on rédige une nouvelle entrée. */
const NEW = '__new__'

export function ResourceEditor({ resource }: { resource: ResourceDef }) {
  const [rows, setRows] = useState<ResourceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [values, setValues] = useState<FormValues>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  /* ------------------------------- Chargement ------------------------------- */

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRows(await apiRequest<ResourceRow[]>(`/api/admin/${resource.key}`, { auth: true }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible.')
    } finally {
      setLoading(false)
    }
  }, [resource.key])

  // Recharge et remet le formulaire à zéro à chaque changement de ressource.
  useEffect(() => {
    setSelectedId(null)
    setValues({})
    setLogoFile(null)
    setLogoPreview(null)
    setError(null)
    setSuccess(null)
    void load()
  }, [load])

  // Le message de succès s'efface tout seul.
  useEffect(() => {
    if (!success) return
    const timer = window.setTimeout(() => setSuccess(null), 2600)
    return () => window.clearTimeout(timer)
  }, [success])

  /* -------------------------------- Actions --------------------------------- */

  function openRow(row: ResourceRow) {
    setSelectedId(row.id)
    setValues(toFormValues(resource.fields, row))
    setLogoFile(null)
    setLogoPreview(
      row.hasLogo && row.id
        ? clientLogoUrl(String(row.id), new Date(String(row.updatedAt ?? Date.now())).getTime())
        : null,
    )
    setError(null)
  }

  function openCreate() {
    setSelectedId(NEW)
    setValues(toFormValues(resource.fields, null))
    setLogoFile(null)
    setLogoPreview(null)
    setError(null)
  }

  function closeForm() {
    setSelectedId(null)
    setValues({})
    setLogoFile(null)
    setLogoPreview(null)
    setError(null)
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()

    const message = validate(resource.fields, values)
    if (message) {
      setError(message)
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = toPayload(resource.fields, values)

      let savedId = selectedId

      if (selectedId === NEW) {
        const created = await apiRequest<{ id: string }>(`/api/admin/${resource.key}`, {
          method: 'POST',
          body: payload,
          auth: true,
        })
        savedId = created.id
        setSuccess('Élément créé.')
      } else {
        await apiRequest(`/api/admin/${resource.key}/${selectedId}`, {
          method: 'PATCH',
          body: payload,
          auth: true,
        })
        setSuccess('Modifications enregistrées.')
      }

      if (logoFile && savedId && savedId !== NEW) {
        await apiUpload(`/api/clients/${savedId}/logo`, logoFile)
      }

      await load()
      closeForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(row: ResourceRow) {
    if (!window.confirm(`Supprimer « ${rowTitle(resource, row)} » ? Cette action est définitive.`)) {
      return
    }

    try {
      await apiRequest(`/api/admin/${resource.key}/${row.id}`, { method: 'DELETE', auth: true })
      if (selectedId === row.id) closeForm()
      setSuccess('Élément supprimé.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible.')
    }
  }

  /** Déplace une entrée dans la liste et persiste le nouvel ordre. */
  async function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= rows.length) return

    const reordered = [...rows]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    setRows(reordered) // mise à jour optimiste, l'API confirme juste après

    try {
      await apiRequest(`/api/admin/${resource.key}/reorder`, {
        method: 'PUT',
        body: { ids: reordered.map((row) => row.id) },
        auth: true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Réordonnancement impossible.')
      await load()
    }
  }

  /* --------------------------------- Rendu ---------------------------------- */

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">{resource.label}</h2>
          <p className="mt-1 text-sm text-ink/45">{resource.description}</p>
        </div>

        {!resource.fixedRows && (
          <button type="button" onClick={openCreate} className="btn-primary !px-5 !py-2.5">
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        )}
      </header>

      {/* Bandeaux de retour */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-5 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
          >
            <Check className="h-4 w-4 shrink-0" />
            {success}
          </motion.p>
        )}
      </AnimatePresence>

      {loading ? (
        <p className="flex items-center gap-2 py-10 text-sm text-ink/45">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement…
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          {/* Liste des entrées */}
          <ul className="space-y-2.5">
            {rows.length === 0 && (
              <li className="glass-card p-6 text-sm text-ink/45">
                Aucune entrée pour le moment.
              </li>
            )}

            {rows.map((row, index) => (
              <li key={row.id}>
                <div
                  className={`glass-card flex items-center gap-3 p-4 transition-colors ${
                    selectedId === row.id ? 'border-accent/60 bg-accent/[0.07]' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openRow(row)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate font-medium text-ink">{rowTitle(resource, row)}</p>
                    {rowSubtitle(resource, row) && (
                      <p className="truncate text-xs text-ink/45">{rowSubtitle(resource, row)}</p>
                    )}
                  </button>

                  {/* Réordonnancement */}
                  <div className="flex shrink-0 flex-col">
                    <IconButton
                      label="Monter"
                      disabled={index === 0}
                      onClick={() => void move(index, -1)}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton
                      label="Descendre"
                      disabled={index === rows.length - 1}
                      onClick={() => void move(index, 1)}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>

                  {!resource.fixedRows && (
                    <IconButton label="Supprimer" danger onClick={() => void handleDelete(row)}>
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Formulaire d'édition */}
          <AnimatePresence mode="wait">
            {selectedId ? (
              <motion.form
                key={selectedId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSave}
                className="glass-card h-fit p-6"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {selectedId === NEW ? 'Nouvelle entrée' : 'Modifier'}
                  </h3>
                  <IconButton label="Fermer" onClick={closeForm}>
                    <X className="h-4 w-4" />
                  </IconButton>
                </div>

                <div className="space-y-4">
                  {resource.fields.map((field) =>
                    field.type === 'image' ? (
                      <LogoField
                        key={field.name}
                        field={field}
                        preview={
                          logoPreview ??
                          (logoFile ? URL.createObjectURL(logoFile) : null)
                        }
                        onFile={(file) => {
                          setLogoFile(file)
                          setLogoPreview(file ? URL.createObjectURL(file) : null)
                        }}
                      />
                    ) : (
                      <Field
                        key={field.name}
                        field={field}
                        value={values[field.name]}
                        onChange={(value) =>
                          setValues((current) => ({ ...current, [field.name]: value }))
                        }
                      />
                    ),
                  )}
                </div>

                <button type="submit" disabled={saving} className="btn-primary mt-6 w-full">
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </motion.form>
            ) : (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card h-fit p-8 text-sm text-ink/40"
              >
                Sélectionnez une entrée dans la liste pour la modifier
                {!resource.fixedRows && ', ou ajoutez-en une nouvelle'}.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

/* -------------------------------- Sous-composants -------------------------- */

/** Champ de formulaire rendu selon son type déclaré dans le schéma. */
function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: string | boolean | undefined
  onChange: (value: string | boolean) => void
}) {
  const inputClass =
    'w-full rounded-xl border border-ink/10 bg-page-2/60 px-3.5 py-2.5 text-sm text-ink placeholder-ink/25 outline-none transition-colors focus:border-accent/60'

  if (field.type === 'boolean') {
    return (
      <label className="flex cursor-pointer items-center gap-3 text-sm text-ink/75">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-blue-500"
        />
        {field.label}
      </label>
    )
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink/45">
        {field.label}
        {field.required && <span className="ml-1 text-accent">*</span>}
      </span>

      {field.type === 'select' ? (
        <select
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        >
          {field.options?.map((option) => (
            <option key={option} value={option} className="bg-page-2">
              {option}
            </option>
          ))}
        </select>
      ) : field.type === 'list' || field.type === 'textarea' ? (
        <textarea
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          rows={field.type === 'list' ? 4 : 3}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
          value={String(value ?? '')}
          min={field.min}
          max={field.max}
          placeholder={field.type === 'url' ? 'https://…' : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}

      {field.help && <span className="mt-1.5 block text-xs text-ink/35">{field.help}</span>}
    </label>
  )
}

function LogoField({
  field,
  preview,
  onFile,
}: {
  field: FieldDef
  preview: string | null
  onFile: (file: File | null) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink/45">
        {field.label}
      </span>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-xl border border-ink/10 bg-page-2/60">
          {preview ? (
            <img src={preview} alt="" className="max-h-14 max-w-[5.5rem] object-contain" />
          ) : (
            <ImagePlus className="h-5 w-5 text-ink/30" />
          )}
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml,.svg"
          className="text-sm text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-accent/15 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent"
          onChange={(event) => {
            onFile(event.target.files?.[0] ?? null)
            event.target.value = ''
          }}
        />
      </div>
      {field.help && <span className="mt-1.5 block text-xs text-ink/35">{field.help}</span>}
    </label>
  )
}

/** Petit bouton icône avec libellé accessible. */
function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-lg text-ink/40 transition-colors disabled:opacity-25 ${
        danger ? 'hover:bg-rose-500/15 hover:text-rose-300' : 'hover:bg-ink/10 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
