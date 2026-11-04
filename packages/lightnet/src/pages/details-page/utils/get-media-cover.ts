import { readFile } from "node:fs/promises"

import { getEntry } from "astro:content"

export async function getMediaCover(mediaId: string) {
  // Schema validation strips fsPath; optimized assets are not available yet
  // during prerendering. Read the original Astro image metadata instead.
  const entry = await getEntry("media", mediaId)
  const imagePath: unknown = entry && Reflect.get(entry.data.image, "fsPath")
  if (typeof imagePath !== "string") {
    throw new Error(
      `Cannot resolve the cover image for media item "${mediaId}"`,
    )
  }
  return readFile(imagePath)
}
