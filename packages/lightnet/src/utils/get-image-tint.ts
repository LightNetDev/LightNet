import { createHash, randomUUID } from "node:crypto"
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises"

import sharp from "sharp"

// Bound the cache for long-running dev/SSR servers. Locales share the same tint.
const tints = new Map<string, Promise<string>>()
// Bump when changing the extraction or tint formula.
const TINT_VERSION = 2

function getChromaticColor(pixels: Buffer): number[] | undefined {
  // Group similar RGB colors into 16 levels per channel.
  const weights = new Float64Array(4096)
  const reds = new Float64Array(4096)
  const greens = new Float64Array(4096)
  const blues = new Float64Array(4096)
  let visibleWeight = 0
  let colorfulWeight = 0
  let largestBucket = 0

  for (let offset = 0; offset < pixels.length; offset += 4) {
    const r = pixels[offset]
    const g = pixels[offset + 1]
    const b = pixels[offset + 2]
    const weight = pixels[offset + 3] / 255
    visibleWeight += weight

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    if (
      weight === 0 ||
      max < 64 ||
      min > 230 ||
      max - min < 40 ||
      (max - min) / max < 0.15
    ) {
      continue
    }

    const bucket = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
    weights[bucket] += weight
    reds[bucket] += r * weight
    greens[bucket] += g * weight
    blues[bucket] += b * weight
    colorfulWeight += weight
    if (weights[bucket] > weights[largestBucket]) largestBucket = bucket
  }

  // Tiny colorful accents should not determine an otherwise neutral image.
  if (colorfulWeight === 0 || colorfulWeight < visibleWeight * 0.05) {
    return undefined
  }
  return [reds[largestBucket], greens[largestBucket], blues[largestBucket]].map(
    (sum) => sum / weights[largestBucket],
  )
}

export function getImageTint(image: Buffer, cacheDir?: URL): Promise<string> {
  const key = createHash("sha256")
    .update(
      JSON.stringify({ version: TINT_VERSION, dependencies: sharp.versions }),
    )
    .update(image)
    .digest("hex")
  const directory = cacheDir && new URL("lightnet/image-tints/", cacheDir)
  const tintPath = directory && new URL(`${key}.txt`, directory)
  const memoryKey = `${cacheDir?.href ?? ""}:${key}`
  const cached = tints.get(memoryKey)
  if (cached) return cached

  const tint = (async () => {
    if (tintPath) {
      try {
        const value = await readFile(tintPath, "utf8")
        const channels = /^rgb\((\d+),(\d+),(\d+)\)$/.exec(value)
        if (
          channels &&
          channels.slice(1).every((channel) => Number(channel) <= 255)
        ) {
          return value
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          console.warn("[lightnet] Cannot read image tint cache:", error)
        }
      }
    }
    const decoded = await sharp(image)
      .autoOrient()
      .resize(432, 502, { fit: "inside" })
      .toColourspace("srgb")
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    let color = getChromaticColor(decoded.data)
    if (!color) {
      // Materialize flattening before stats(), which reads input pixels directly.
      const opaque = await sharp(decoded.data, { raw: decoded.info })
        .flatten({ background: "#fafafa" })
        .raw()
        .toBuffer({ resolveWithObject: true })
      const { dominant } = await sharp(opaque.data, {
        raw: opaque.info,
      }).stats()
      color = [dominant.r, dominant.g, dominant.b]
    }
    // Keep every channel at least 170 for readable dark text on any image tint.
    const value = `rgb(${color
      .map((channel) => Math.round(250 * 0.68 + channel * 0.32))
      .join(",")})`
    if (directory && tintPath) {
      const temporaryPath = new URL(`${key}.${randomUUID()}.tmp`, directory)
      try {
        await mkdir(directory, { recursive: true })
        await writeFile(temporaryPath, value, { flag: "wx" })
        await rename(temporaryPath, tintPath)
      } catch (error) {
        console.warn("[lightnet] Cannot write image tint cache:", error)
      } finally {
        await rm(temporaryPath, { force: true }).catch(() => undefined)
      }
    }
    return value
  })()
  if (tints.size >= 128) tints.delete(tints.keys().next().value!)
  tints.set(memoryKey, tint)
  void tint.catch(() => {
    if (tints.get(memoryKey) === tint) tints.delete(memoryKey)
  })
  return tint
}
