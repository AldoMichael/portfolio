import { useContent } from '../context/ContentContext'
import { profile } from '../data/portfolio'
import { cvDownloadUrl } from '../lib/api'

/** Lien de téléchargement : CV uploadé en admin, sinon le PDF statique. */
export function useCvUrl() {
  const { cvVersion } = useContent()
  return cvDownloadUrl(cvVersion) ?? profile.cvUrl
}
