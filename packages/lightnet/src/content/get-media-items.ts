import { getCollection, getEntry } from "astro:content"

import { verifySchemaAsync } from "../utils/verify-schema"
import { type MediaItemEntry, mediaItemEntrySchema } from "./content-schema"

/**
 * Internal API to get media items. Since this package is a Astro integration
 * we cannot rely on Astro's getCollection typings. They are configured outside this package.
 */

export const getMediaItem = async (id: string) => {
  const item = await getEntry("media", id)
  return prepareItem(item)
}

export const getMediaItems = async () => {
  const items: unknown[] = await getCollection("media")
  return Promise.all(items.map(prepareItem))
}

const prepareItem = async (item: unknown) => {
  return await verifySchemaAsync(
    mediaItemEntrySchema,
    item,
    (id) => `Invalid media item: ${id}`,
    (id) => `Fix these issues inside "src/content/media/${id}.yaml":`,
  )
}

/**
 * Revert media items like they it is stored in the
 * content collection folder.
 */
export const getRawMediaItem = async (id: string) => {
  const item = await getMediaItem(id)
  return revertMediaItemEntry(item)
}

/**
 * Revert media items like they are stored in the
 * content collection folder.
 */
export const getRawMediaItems = async () => {
  const mediaItems = await getMediaItems()
  return Promise.all(mediaItems.map(revertMediaItemEntry))
}

/**
 * Returns the media item like it is stored in the content collection yaml.
 * We need to revert Astro's modifications to references and images.
 *
 * @param mediaItem media item parsed by Astro
 * @returns media item like before parsing
 */
async function revertMediaItemEntry({ id, data: mediaItem }: MediaItemEntry) {
  const type = mediaItem.type.id
  const categories = mediaItem.categories?.map((category) => category.id)
  const collections = mediaItem.collections?.map((collection) => ({
    ...collection,
    collection: collection.collection.id,
  }))
  const image =
    (await getEntry("internal-media-image-path", id))?.data.image ?? ""
  return {
    id,
    data: {
      ...mediaItem,
      type,
      categories,
      collections,
      image,
    },
  }
}
