import { getCollection } from "astro:content"

import { lazy } from "../utils/lazy"
import { verifySchemaAsync } from "../utils/verify-schema"
import { mediaCollectionEntrySchema } from "./schema/media-collection"

const collectionsByMediaItemIds = lazy(async () =>
  (await loadMediaCollections())
    .flatMap((collection) =>
      collection.data.mediaItems.map(({ id }) => [id, collection.id]),
    )
    .reduce(
      (collected, [mediaId, collectionId]) => {
        const collectionIds = collected[mediaId] ?? []

        if (!collectionIds.includes(collectionId)) {
          collected[mediaId] = [...collectionIds, collectionId]
        }

        return collected
      },
      {} as Record<string, string[]>,
    ),
)

export const getCollectionsForMediaItem = async (mediaId: string) => {
  return (await collectionsByMediaItemIds.get())[mediaId] ?? []
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
