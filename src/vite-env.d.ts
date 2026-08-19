/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL de base de l'API CMS, ex. http://localhost:3001 */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
