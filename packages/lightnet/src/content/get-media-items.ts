import { getCollection, getEntry } from "astro:content"

import { verifySchemaAsync } from "../utils/verify-schema"
import { mediaItemEntrySchema } from "./content-schema-internal"

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
    (id) => `Fix these issues inside "src/content/media/${id}.json":`,
  )
}
