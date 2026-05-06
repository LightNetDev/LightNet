import { z } from "astro/zod"
import { reference } from "astro:content"

import { translationMapSchema } from "../../i18n/translation-map-schema"

/**
 * Media Collection Schema
 */
export const mediaCollectionSchema = z.object({
  /**
   * Name of the collection.
   *
   * Label translated for the default locale. Other configured site locales are optional.
   */
  label: translationMapSchema,
  /**
   * Ordered list of media items included in this collection.
   * The array order defines how items are shown when querying by collection.
   *
   * @example ["my-book--en", "my-video--en"]
   */
  mediaItems: z.array(reference("media")),
})

export const mediaCollectionEntrySchema = z.object({
  id: z.string(),
  collection: z.literal("media-collections"),
  data: mediaCollectionSchema,
})

export type MediaCollectionEntry = z.infer<typeof mediaCollectionEntrySchema>
