import type { APIRoute, GetStaticPaths } from "astro"
import { getCollection } from "astro:content"

import { getRawMediaItem } from "../../content/get-media-items"

export const getStaticPaths = (async () => {
  const mediaItems = await getCollection("media")
  return mediaItems.map(({ id: mediaId }) => ({ params: { mediaId } }))
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ params: { mediaId } }) => {
  const entry = await getRawMediaItem(mediaId!)
  return new Response(
    JSON.stringify({ id: entry.id, content: entry.data }, null, 2),
  )
}
