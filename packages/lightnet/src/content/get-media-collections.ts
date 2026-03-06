import { getCollection } from "astro:content"

import { verifySchemaAsync } from "../utils/verify-schema"
import { mediaCollectionEntrySchema } from "./content-schema"

const collectionsByMediaItemIds = (await loadMediaCollections())
  .flatMap((collection) =>
    collection.data.mediaItems.map(({ id }) => [id, collection.id]),
  )
  .reduce(
    (collected, [mediaId, collectionId]) => {
      collected[mediaId] = [...(collected[mediaId] ?? []), collectionId]
      return collected
    },
    {} as Record<string, string[]>,
  )

export const getCollectionsForMediaItem = async (mediaId: string) => {
  return collectionsByMediaItemIds[mediaId] ?? []
}

async function loadMediaCollections() {
  const mediaCollections: unknown[] = await getCollection("media-collections")
  return await Promise.all(mediaCollections.map(parseMediaCollection))
}

async function parseMediaCollection(item: unknown) {
  return await verifySchemaAsync(
    mediaCollectionEntrySchema,
    item,
    (id) => `Invalid media-collection: ${id}`,
    (id) =>
      `Fix these issues inside "src/content/media-collections/${id}.json":`,
  )
}
