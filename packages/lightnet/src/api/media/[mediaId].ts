import type { APIRoute, GetStaticPaths } from "astro"
import { getCollection } from "astro:content"
import { getMediaItem } from "../../content/get-media-items"

export const getStaticPaths = (async () => {
  const mediaItems = await getCollection("media")
  return mediaItems.map(({ id: mediaId }) => ({ params: { mediaId } }))
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ params: { mediaId } }) => {
  const mediaItem = await getMediaItem(mediaId!)
  return new Response(JSON.stringify({ ...mediaItem }, null, 2))
}
