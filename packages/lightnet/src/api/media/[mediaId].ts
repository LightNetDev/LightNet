import type { APIRoute, GetStaticPaths } from "astro"
import { getCollection, getEntry } from "astro:content"
import { getMediaItem } from "../../content/get-media-items"

export const getStaticPaths = (async () => {
  const mediaItems = await getCollection("media")
  return mediaItems.map(({ id: mediaId }) => ({ params: { mediaId } }))
}) satisfies GetStaticPaths

export const GET: APIRoute = async ({ params: { mediaId } }) => {
  return new Response(
    JSON.stringify(await originalMediaItem(mediaId!), null, 2),
  )
}

/**
 * Returns the media item like it is stored in the content collection json.
 * We need to revert Astro's modifications to references and images.
 *
 * @param mediaItem media item parsed by Astro
 * @returns media item like before parsing
 */
async function originalMediaItem(mediaId: string) {
  const mediaItem = (await getMediaItem(mediaId)).data

  const type = mediaItem.type.id
  const categories = mediaItem.categories?.map((category) => category.id)
  const collections = mediaItem.collections?.map((collection) => ({
    ...collection,
    collection: collection.collection.id,
  }))
  const image = (await getEntry("internal-media-image-path", mediaId))?.data
    .image
  return {
    ...mediaItem,
    type,
    categories,
    collections,
    image,
  }
}
