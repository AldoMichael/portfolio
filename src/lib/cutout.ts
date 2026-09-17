/**
 * Découpe un portrait : le fond connecté aux bords devient transparent
 * pour laisser voir le site derrière la photo.
 */

const MAX_EDGE = 1400
const COLOR_THRESHOLD = 48
const FEATHER = 2

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Impossible de charger la photo.'))
    image.src = src
  })
}

async function loadSource(src: string) {
  const response = await fetch(src, { mode: 'cors' })
  if (!response.ok) throw new Error('Impossible de charger la photo.')
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  try {
    const image = await loadImage(objectUrl)
    return { image, objectUrl }
  } catch (error) {
    URL.revokeObjectURL(objectUrl)
    throw error
  }
}

function distance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  const dr = r1 - r2
  const dg = g1 - g2
  const db = b1 - b2
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

function sampleBackground(data: Uint8ClampedArray, width: number, height: number) {
  const points = [
    [4, 4],
    [width - 5, 4],
    [4, height - 5],
    [width - 5, height - 5],
    [Math.floor(width / 2), 4],
    [Math.floor(width / 2), height - 5],
    [4, Math.floor(height / 2)],
    [width - 5, Math.floor(height / 2)],
  ]

  let r = 0
  let g = 0
  let b = 0
  for (const [x, y] of points) {
    const i = (y * width + x) * 4
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
  }
  const n = points.length
  return { r: r / n, g: g / n, b: b / n }
}

function isBackground(
  data: Uint8ClampedArray,
  index: number,
  bg: { r: number; g: number; b: number },
) {
  return distance(data[index], data[index + 1], data[index + 2], bg.r, bg.g, bg.b) <= COLOR_THRESHOLD
}

function floodFromEdges(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  bg: { r: number; g: number; b: number },
) {
  const visited = new Uint8Array(width * height)
  const queue: number[] = []

  const enqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const p = y * width + x
    if (visited[p]) return
    if (!isBackground(data, p * 4, bg)) return
    visited[p] = 1
    queue.push(p)
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0)
    enqueue(x, height - 1)
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y)
    enqueue(width - 1, y)
  }

  while (queue.length) {
    const p = queue.pop()!
    const x = p % width
    const y = (p - x) / width
    enqueue(x + 1, y)
    enqueue(x - 1, y)
    enqueue(x, y + 1)
    enqueue(x, y - 1)
  }

  return visited
}

function featherMask(mask: Uint8Array, width: number, height: number) {
  const next = new Uint8Array(mask)
  for (let pass = 0; pass < FEATHER; pass += 1) {
    const copy = new Uint8Array(next)
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const p = y * width + x
        if (copy[p]) continue
        if (
          copy[p - 1] ||
          copy[p + 1] ||
          copy[p - width] ||
          copy[p + width]
        ) {
          next[p] = 1
        }
      }
    }
  }
  return next
}

function trimTransparent(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const { width, height } = canvas
  const { data } = ctx.getImageData(0, 0, width, height)
  let top = 0
  let left = 0
  let right = width - 1
  let bottom = height - 1

  const rowHasPixel = (y: number) => {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 12) return true
    }
    return false
  }
  const colHasPixel = (x: number) => {
    for (let y = 0; y < height; y += 1) {
      if (data[(y * width + x) * 4 + 3] > 12) return true
    }
    return false
  }

  while (top < bottom && !rowHasPixel(top)) top += 1
  while (bottom > top && !rowHasPixel(bottom)) bottom -= 1
  while (left < right && !colHasPixel(left)) left += 1
  while (right > left && !colHasPixel(right)) right -= 1

  const cropW = right - left + 1
  const cropH = bottom - top + 1
  if (cropW <= 0 || cropH <= 0 || (cropW === width && cropH === height)) return canvas

  const cropped = document.createElement('canvas')
  cropped.width = cropW
  cropped.height = cropH
  cropped.getContext('2d')!.drawImage(canvas, left, top, cropW, cropH, 0, 0, cropW, cropH)
  return cropped
}

export async function cutOutPhoto(src: string): Promise<string> {
  const { image, objectUrl } = await loadSource(src)
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight))
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('Canvas indisponible.')

    ctx.drawImage(image, 0, 0, width, height)
    const frame = ctx.getImageData(0, 0, width, height)
    const bg = sampleBackground(frame.data, width, height)
    const mask = floodFromEdges(frame.data, width, height, bg)
    const soft = featherMask(mask, width, height)

    for (let p = 0; p < mask.length; p += 1) {
      const i = p * 4
      if (mask[p]) {
        frame.data[i + 3] = 0
      } else if (soft[p]) {
        frame.data[i + 3] = Math.round(frame.data[i + 3] * 0.35)
      }
    }

    ctx.putImageData(frame, 0, 0)
    const trimmed = trimTransparent(canvas, ctx)

    return await new Promise((resolve, reject) => {
      trimmed.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Découpe impossible.'))
            return
          }
          resolve(URL.createObjectURL(blob))
        },
        'image/png',
      )
    })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
