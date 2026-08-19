/**
 * Types miroirs du schéma exposé par l'API (`GET /api/schema`).
 * Ils décrivent les champs de chaque ressource et permettent de générer
 * les formulaires d'administration automatiquement.
 */

export type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'list' | 'select' | 'url'

export type FieldDef = {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: string[]
  min?: number
  max?: number
  help?: string
}

export type ResourceDef = {
  key: string
  label: string
  description: string
  /** Ressource à lignes fixes : ni création ni suppression. */
  fixedRows?: boolean
  fields: FieldDef[]
}

/** Une ligne renvoyée par l'API d'administration. */
export type ResourceRow = {
  id: string
  position: number
} & Record<string, unknown>

/** Valeurs d'un formulaire : tout est stocké en chaîne, sauf les booléens. */
export type FormValues = Record<string, string | boolean>

/* -------------------------- Conversions formulaire ------------------------- */

/** Convertit une ligne de l'API en valeurs de formulaire. */
export function toFormValues(fields: FieldDef[], row?: ResourceRow | null): FormValues {
  const values: FormValues = {}

  for (const field of fields) {
    const raw = row?.[field.name]

    switch (field.type) {
      case 'boolean':
        values[field.name] = raw === true
        break
      case 'list':
        // Une entrée par ligne dans la zone de texte.
        values[field.name] = Array.isArray(raw) ? raw.join('\n') : ''
        break
      case 'select':
        values[field.name] = String(raw ?? field.options?.[0] ?? '')
        break
      case 'number':
        values[field.name] = raw === undefined || raw === null ? '' : String(raw)
        break
      default:
        values[field.name] = String(raw ?? '')
    }
  }

  return values
}

/** Convertit les valeurs du formulaire en corps de requête pour l'API. */
export function toPayload(fields: FieldDef[], values: FormValues) {
  const payload: Record<string, unknown> = {}

  for (const field of fields) {
    const value = values[field.name]

    switch (field.type) {
      case 'boolean':
        payload[field.name] = value === true
        break
      case 'list':
        payload[field.name] = String(value ?? '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
        break
      case 'number':
        payload[field.name] = Number(value)
        break
      default:
        payload[field.name] = String(value ?? '').trim()
    }
  }

  return payload
}

/** Libellé d'une ligne dans la liste : premier champ texte renseigné. */
export function rowTitle(resource: ResourceDef, row: ResourceRow): string {
  const field = resource.fields.find((item) => item.type === 'text' && row[item.name])
  return field ? String(row[field.name]) : 'Sans titre'
}

/** Sous-titre d'une ligne : deuxième information utile, si elle existe. */
export function rowSubtitle(resource: ResourceDef, row: ResourceRow): string {
  const textFields = resource.fields.filter((item) => item.type === 'text' && row[item.name])
  return textFields[1] ? String(row[textFields[1].name]) : ''
}

/** Vérifie les champs requis avant l'envoi et renvoie le premier message d'erreur. */
export function validate(fields: FieldDef[], values: FormValues): string | null {
  for (const field of fields) {
    if (!field.required) continue

    const value = values[field.name]
    if (field.type === 'number') {
      const parsed = Number(value)
      if (value === '' || !Number.isFinite(parsed)) {
        return `Le champ « ${field.label} » doit être un nombre.`
      }
      if (field.min !== undefined && parsed < field.min) {
        return `« ${field.label} » doit être supérieur ou égal à ${field.min}.`
      }
      if (field.max !== undefined && parsed > field.max) {
        return `« ${field.label} » doit être inférieur ou égal à ${field.max}.`
      }
      continue
    }

    if (typeof value === 'string' && !value.trim()) {
      return `Le champ « ${field.label} » est requis.`
    }
  }

  return null
}
