import { z } from "astro/zod"
import type { SchemaContext } from "astro:content"
import { reference } from "astro:content"

import { imageSchema } from "../astro-image"
import { translationMapSchema } from "../../i18n/translation-map-schema"
import { attachTranslationMapMetadata } from "../../i18n/translation-map-metadata"

/**
 * Media Item Schema
 */
export const mediaItemSchema = z.object({
  /**
   * Optional identifier used to link translated variants of a media item.
   * If other media items share the same commonId they will show up as translations.
   * If omitted, the media item is treated as standalone and has no translations.
   * The common id will show up in the media item's url combined with it's language.
   *
   * We suggest you use the english name of the media item, all lower case, words separated with hyphens.
   *
   * @example "a-book-about-love"
   */
  commonId: z.string().optional(),
  /**
   * Title of this media item.
   * This is expected to be in the language that is defined by the 'language' property.
   *
   * @example "A book about love"
   */
  title: z.string(),
  /**
   * References one media-type by its filename without .json suffix.
   *
   * @example "book"
   */
  type: reference("media-types"),
  /**
   *Describes this media item. You can use markdown syntax to add formatting.
   * This is expected to be in the language that is defined by the 'language' property.
   *
   * @example "This is a book about **love**..."
   */
  description: z.string().optional(),
  /**
   * List of authors of this media item.
   *
   * @example ["George Miller", "Timothy Meier"]
   */
  authors: z.array(z.string()).nullish(),
  /**
   * Date this media item has been created on this lightnet instance.
   * Format is YYYY-MM-DD
   *
   * @example 2024-09-10
   */
  dateCreated: z.iso.date(),
  /**
   * List of categories of this media item.
   *
   * @example ["family"]
   */
  categories: z.array(reference("categories")).nullish(),
  /**
   * BCP-47 language code of this media item.
   *
   * @example "en"
   */
  language: z.string().nonempty(),
  /**
   * Relative path to the image of this media item. Eg. a book cover or video thumbnail.
   *
   * The image is expected to be inside the `images` folder next to the media item definition json.
   * This image will be used for previews and on the media item detail page.
   * It can have one of these file types: png, jpg, tiff, webp, gif, svg, avif.
   * We suggest to give it a size of at least 1000px for it's longer side.
   *
   * @example "./images/a-book-about-love--en.jpg"
   */
  image: imageSchema,
  /**
   * List of objects defining the content of this media item.
   */
  content: z
    .array(
      z.object({
        /**
         * Storage kind for this content item.
         *
         * - `"upload"`: a file managed by this LightNet site (typically a relative path like `/files/...`)
         * - `"link"`: an external URL (typically `https://...`)
         *
         * @example "upload"
         */
        type: z.enum(["upload", "link"]),
        /**
         * Urls might be:
         * - links to youtube videos
         * - links to vimeo videos
         * - links to .mp4 video files
         * - links to .mp3 audio files
         * - links to external websites
         * - links to pdfs (might be hosted inside the public/files/ folder)
         * - links to epubs (might be hosted inside the public/files/ folder)
         *
         * @example "/files/a-book-about-love.pdf"
         */
        url: z.string(),
        /**
         * The name of the content translated for the default locale.
         * Other configured site locales are optional.
         * If this is not set, the file name from URL will be used.
         */
        label: translationMapSchema.optional(),
      }),
    )
    .min(1),
})

/**
 * MediaItemSchema above defines the shape of a media item.
 * We need this function to accept the astro content's image function that
 * is available inside defineCollection.
 *
 * @param schemaContext that is passed by astro's defineCollection schema.
 * @returns schema with image mixed in.
 */
export const createMediaItemSchema = ({ image }: SchemaContext) =>
  mediaItemSchema.extend({
    image: image(),
  })

export const mediaItemEntrySchema = z.object({
  id: z.string(),
  collection: z.literal("media"),
  data: mediaItemSchema,
})

export type MediaItemEntry = z.infer<typeof mediaItemEntrySchema>
