import { readFile } from "node:fs/promises"

import type { APIRoute, GetStaticPaths } from "astro"
import { getCollection, getEntry } from "astro:content"
import config from "virtual:lightnet/config"

import { getMediaItem } from "../../../content/get-media-items"
import { getMediaType } from "../../../content/get-media-types"
import { createOpenGraphImage } from "../utils/create-open-graph-image"

export const getStaticPaths: GetStaticPaths = async () => {
  const items = await getCollection("media")
  return config.locales.flatMap((locale) =>
    items.map(({ id: mediaId }) => ({ params: { locale, mediaId } })),
  )
}

export const GET: APIRoute = async ({ params, locals }) => {
  const item = await getMediaItem(params.mediaId!)
  const mediaType = await getMediaType(item.data.type.id)
  // Read the original Astro image metadata: schema validation strips its
  // non-enumerable fsPath, and optimized assets are generated after prerendering.
  const entry = await getEntry("media", params.mediaId!)
  const imagePath: unknown = Reflect.get(entry!.data.image, "fsPath")
  if (typeof imagePath !== "string") {
    throw new Error(
      `Cannot resolve the cover image for media item "${item.id}"`,
    )
  }
  const { direction } = locals.i18n
  const png = await createOpenGraphImage({
    cover: await readFile(imagePath),
    coverImageStyle: mediaType.data.coverImageStyle,
    title: item.data.title,
    authors: item.data.authors,
    direction,
  })
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  })
}
