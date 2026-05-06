import { glob } from "astro/loaders"
import { defineCollection } from "astro:content"

import { createCategorySchema } from "./schema/category"
import { mediaCollectionSchema } from "./schema/media-collection"
import { createMediaItemSchema } from "./schema/media-item"
import { mediaTypeSchema } from "./schema/media-type"

export const LIGHTNET_COLLECTIONS = {
  categories: defineCollection({
    loader: glob({ pattern: "*.json", base: "./src/content/categories" }),
    schema: createCategorySchema,
  }),
  "media-collections": defineCollection({
    loader: glob({
      pattern: "*.json",
      base: "./src/content/media-collections",
    }),
    schema: mediaCollectionSchema,
  }),
  media: defineCollection({
    loader: glob({
      pattern: "*.json",
      base: "./src/content/media",
    }),
    schema: createMediaItemSchema,
  }),
  "media-types": defineCollection({
    loader: glob({
      pattern: "*.json",
      base: "./src/content/media-types",
    }),
    schema: mediaTypeSchema,
  }),
}
