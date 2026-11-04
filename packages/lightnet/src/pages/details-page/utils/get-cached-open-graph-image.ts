import { createHash, randomUUID } from "node:crypto"
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises"

import sharp from "sharp"

import { createOpenGraphImage } from "./create-open-graph-image"

// Bump when changing the renderer, layout, or fonts to invalidate old images.
const RENDERER_VERSION = 1

export async function getCachedOpenGraphImage(
  input: Parameters<typeof createOpenGraphImage>[0],
  cacheDir: URL,
) {
  const key = createHash("sha256")
    .update(
      JSON.stringify({
        version: RENDERER_VERSION,
        dependencies: sharp.versions,
        title: input.title,
        authors: input.authors ?? [],
        direction: input.direction ?? "ltr",
        coverImageStyle: input.coverImageStyle ?? "default",
      }),
    )
    .update(input.cover)
    .digest("hex")
  const directory = new URL("lightnet/open-graph/", cacheDir)
  const imagePath = new URL(`${key}.png`, directory)

  try {
    return await readFile(imagePath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("[lightnet] Cannot read Open Graph image cache:", error)
      return createOpenGraphImage(input)
    }
  }

  const png = await createOpenGraphImage(input)
  const temporaryPath = new URL(`${key}.${randomUUID()}.tmp`, directory)
  try {
    await mkdir(directory, { recursive: true })
    await writeFile(temporaryPath, png, { flag: "wx" })
    await rename(temporaryPath, imagePath)
  } catch (error) {
    console.warn("[lightnet] Cannot write Open Graph image cache:", error)
  } finally {
    await rm(temporaryPath, { force: true }).catch(() => undefined)
  }
  return png
}
