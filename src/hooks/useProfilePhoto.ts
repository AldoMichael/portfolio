import { useEffect, useState } from 'react'
import { useContent } from '../context/ContentContext'
import { profilePhotoUrl } from '../lib/api'

/**
 * URL de la photo de profil, uniquement une fois le CMS chargé
 * et avec un paramètre de cache (`?v=`). Sans cela, une ancienne 404
 * mise en cache par le CDN masquerait l’image après un upload.
 */
export function useProfilePhoto() {
  const { profilePhotoVersion } = useContent()
  const src = profilePhotoUrl(profilePhotoVersion)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  return {
    src,
    show: Boolean(src) && !failed,
    onError: () => setFailed(true),
  }
}
