import { createHash, randomUUID } from "node:crypto"
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises"

import sharp from "sharp"

// Bound the cache for long-running dev/SSR servers. Locales share the same tint.
const tints = new Map<string, Promise<string>>()
// Bump when changing the extraction or tint formula.
const TINT_VERSION = 1

export function getCoverTint(cover: Buffer, cacheDir?: URL): Promise<string> {
  const key = createHash("sha256")
    .update(
      JSON.stringify({ version: TINT_VERSION, dependencies: sharp.versions }),
    )
    .update(cover)
    .digest("hex")
  const directory = cacheDir && new URL("lightnet/cover-tints/", cacheDir)
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
          console.warn("[lightnet] Cannot read cover tint cache:", error)
        }
      }
    }
    const image = await sharp(cover)
      .autoOrient()
      .resize(432, 502, { fit: "inside" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const { dominant } = await sharp(image.data, { raw: image.info }).stats()
    const value = `rgb(${[dominant.r, dominant.g, dominant.b]
      .map((channel) => Math.round(250 * 0.68 + channel * 0.32))
      .join(",")})`
    if (directory && tintPath) {
      const temporaryPath = new URL(`${key}.${randomUUID()}.tmp`, directory)
      try {
        await mkdir(directory, { recursive: true })
        await writeFile(temporaryPath, value, { flag: "wx" })
        await rename(temporaryPath, tintPath)
      } catch (error) {
        console.warn("[lightnet] Cannot write cover tint cache:", error)
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
