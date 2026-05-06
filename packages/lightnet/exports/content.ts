export { LIGHTNET_COLLECTIONS } from "../src/content/content-schema"
export { createCategorySchema as categorySchema } from "../src/content/schema/category"
export { mediaCollectionSchema } from "../src/content/schema/media-collection"
export { createMediaItemSchema as mediaItemSchema } from "../src/content/schema/media-item"
export { mediaTypeSchema } from "../src/content/schema/media-type"

import { type CollectionEntry, getCollection } from "astro:content"

import {
  type MediaItemQuery,
  queryMediaItems,
} from "../src/content/query-media-items"

export const getMediaItems = async (
  query?: MediaItemQuery<CollectionEntry<"media">>,
) =>
  queryMediaItems(
    getCollection("media"),
    getCollection("media-collections"),
    query ?? {},
  )
