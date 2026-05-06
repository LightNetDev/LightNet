import { z } from "astro/zod"

import { translationMapSchema } from "../../i18n/translation-map-schema"

/**
 * Media Type Schema
 */
export const mediaTypeSchema = z.object({
  /**
   * Name of this media type that will be shown on the pages.
   *
   * Label translated for the default locale. Other configured site locales are optional.
   */
  label: translationMapSchema,
  /**
   * Defines how the cover image for a media item of this type is rendered.
   *
   * Options:
   * - `"default"` — Renders the media item image with no modifications.
   * - `"book"` — Adds a book fold effect and sharper edges, styled like a book cover.
   * - `"video"` — Constrains the image to a 16:9 aspect ratio with a black background.
   *
   * @default "default"
   */
  coverImageStyle: z.enum(["default", "book", "video"]).default("default"),
  /**
   * What media item details page to use for media items with this type.
   *
   */
  detailsPage: z
    .discriminatedUnion("layout", [
      z.object({
        /**
         * Details page for all media types.
         */
        layout: z.literal("default"),
        /**
         * Label for the open action button. Use this if you want to change the text
         * of the "Open" button to be more matching to your media item.
         * For example you could change the text to be "Read" for a book media type.
         *
         * Label translated for the default locale. Other configured site locales are optional.
         */
        openActionLabel: translationMapSchema.optional(),
      }),
      z.object({
        /**
         * Custom details page.
         */
        layout: z.literal("custom"),
        /**
         * This references a custom component name to be used for the
         * details page. The custom component has be located at src/details-pages/
         *
         * @example "MyArticleDetails.astro"
         */
        customComponent: z.string(),
      }),
      z.object({
        /**
         * Detail page for videos.
         */
        layout: z.literal("video"),
      }),
      z.object({
        /**
         * Detail page for audio files.
         *
         * This only supports mp3 files.
         */
        layout: z.literal("audio"),
      }),
    ])
    .optional(),
  /**
   * Pick the media type's icon from https://lucide.dev/icons/
   * Prefix it's name with "lucide--"
   *
   * @example "lucide--book-open"
   */
  icon: z.string(),
})

export const mediaTypeEntrySchema = z.object({
  id: z.string(),
  collection: z.literal("media-types"),
  data: mediaTypeSchema,
})

export type MediaTypeEntry = z.infer<typeof mediaTypeEntrySchema>
