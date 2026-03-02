export {
  createCategorySchema as categorySchema,
  LIGHTNET_COLLECTIONS,
  mediaCollectionSchema,
  createMediaItemSchema as mediaItemSchema,
  mediaTypeSchema,
} from "../src/content/content-schema"

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
