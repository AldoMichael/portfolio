import { useEffect, useState } from 'react'
import { cutOutPhoto } from '../lib/cutout'

const cache = new Map<string, string>()
const inflight = new Map<string, Promise<string>>()

function getCutout(src: string) {
  const cached = cache.get(src)
  if (cached) return Promise.resolve(cached)

  const pending = inflight.get(src)
  if (pending) return pending

  const task = cutOutPhoto(src)
    .then((url) => {
      cache.set(src, url)
      inflight.delete(src)
      return url
    })
    .catch((error) => {
      inflight.delete(src)
      throw error
    })

  inflight.set(src, task)
  return task
}

/** Portrait détouré (fond transparent) à partir de la photo CMS. */
export function useCutoutPhoto(src: string | null | undefined) {
  const [cutout, setCutout] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!src) {
      setCutout(null)
      setFailed(false)
      return
    }

    let cancelled = false
    setFailed(false)

    getCutout(src)
      .then((url) => {
        if (!cancelled) setCutout(url)
      })
      .catch(() => {
        if (!cancelled) {
          setCutout(src)
          setFailed(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [src])

  return {
    src: cutout,
    show: Boolean(cutout),
    cutOut: Boolean(cutout) && !failed,
    onError: () => setFailed(true),
  }
}
