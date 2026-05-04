import { z } from "astro/zod"
import type { SchemaContext } from "astro:content"

import { imageSchema } from "../astro-image"
import { translationMapSchema } from "../../i18n/translation-map-schema"
import { attachTranslationMapMetadata } from "../../i18n/translation-map-metadata"

/**
 * Category Schema
 */
export const categorySchema = z.object({
  /**
   * Name of the category.
   *
   * Label translated for the default locale. Other configured site locales are optional.
   */
  label: translationMapSchema,

  /* Relative path to the thumbnail image of this category.
   *
   * The image is expected to be inside the `images` folder next to category definition json.
   * It can have one of these file types: png, jpg, tiff, webp, gif, svg, avif.
   * We suggest to give it a size of at least 1000px for it's longer side.
   *
   * @example "./images/devotionals.jpg"
   */
  image: imageSchema.optional(),
})

export const createCategorySchema = ({ image }: SchemaContext) =>
  categorySchema.extend({
    image: image().optional(),
  })

export const categoryEntrySchema = z.object({
  id: z.string(),
  collection: z.literal("categories"),
  data: categorySchema,
})

export type CategoryEntry = z.infer<typeof categoryEntrySchema>
