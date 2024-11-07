import { z } from "astro/zod"
import type { SchemaContext } from "astro:content"
import { defineCollection, reference } from "astro:content"

import { astroImage } from "./astro-image"

/**
 * Category schema
 */
export const categorySchema = z.object({
  /**
   * Name of the category.
   *
   * If your site uses translations, this is a translation key that needs to be translated.
   * If your site doesn't use translations, this can be the the name that will show up.
   *
   * @example "category.biography"
   */
  label: z.string(),
})

/**
 * Media Collection schema
 */
export const mediaCollectionSchema = z.object({
  /**
   * Name of the collection.
   *
   * This will be displayed as is and not be translated.
   */
  name: z.string(),
})

/**
 * Media item schema
 */
export const mediaItemSchema = z.object({
  /**
   * Identifier of this media item. If other media items
   * share the same commonId they will show up as translations.
   * The common id will show up in the media item's url combined with it's language.
   *
   * We suggest you use the english name of the media item, all lower case, words separated with hyphens.
   *
   * @example "a-book-about-love"
   */
  commonId: z.string(),
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
  authors: z.array(z.string()).optional(),
  /**
   * Date this media item has been created on this lightnet instance.
   * Format is YYYY-MM-DD
   *
   * @example 2024-09-10
   */
  dateCreated: z.string().date(),
  /**
   * List of categories of this media item.
   *
   * @example ["family"]
   */
  categories: z.array(reference("categories")).optional(),
  /**
   * List of media collections this media item is included.
   * Collections can be used to group media items into series, playlists...
   *
   * @example [{collection:"my-series"}]
   */
  collections: z
    .array(
      z.object({
        /**
         * Id of the collection.
         */
        collection: reference("media-collections"),
        /**
         * Position of the item inside the collection.
         */
        index: z.number().optional(),
      }),
    )
    .optional(),
  /**
   * BCP-47 name of the language this media item is in.
   *
   * @example "en"
   */
  language: z.string(),
  /**
   * Relative path to the image of this media item. Eg. a book cover or video thumbnail.
   *
   * The image is expected to be inside the _images folder next to the media item definition json.
   * This image will be used for previews and on the media item detail page.
   * It can have on of this file types: png, jpg, tiff, webp, gif, svg, avif.
   * We suggest to give it a size of at least 1000px for it's longer side.
   *
   * @example "./_images/a-book-about-love--en.jpg"
   */
  image: z.string(),
  /**
   * List of objects defining the content of this media item.
   */
  content: z
    .array(
      z.object({
        /**
         * Urls might be:
         * - links to youtube videos
         * - links to vimeo videos
         * - links to .mp4 video files
         * - links to external websites
         * - links to pdfs (might be hosted inside the public/files/ folder)
         * - links to epubs (might be hosted inside the public/files/ folder)
         *
         * @example "/files/a-book-about-love.pdf"
         */
        url: z.string(),
        /**
         * The name of the content. If this is not set. The file name
         * from URL will be used.
         */
        name: z.string().optional(),
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
export const mediaSchema = ({ image }: SchemaContext) =>
  mediaItemSchema.extend({
    image: astroImage(image),
  })

/**
 * Media type schema
 */
export const mediaTypeSchema = z.object({
  /**
   * Name of this media type that will be shown on the pages.
   *
   * If your site uses translations, this is a translation key that needs to be translated.
   * If your site doesn't use translations, this can be the the name that will show up.
   *
   * @example "media-type.book"
   */
  label: z.string(),
  /**
   * What media item details page to use for media items with this type.
   *
   */
  detailsPage: z
    .discriminatedUnion("type", [
      z.object({
        /**
         * Details page for all media types.
         */
        type: z.literal("default"),
        /**
         * Label for the open action button. Use this if you want to change the text
         * of the "Open" button to be more matching to your media item.
         * For example you could change the text to be "Read" for a book media type.
         *
         * The label is a translation key.
         *
         * @example "ln.details.open"
         */
        openActionLabel: z.string().optional(),
        /**
         * What style to use for the cover image.
         *
         * @example "book"
         */
        coverStyle: z.enum(["default", "book"]).default("default"),
      }),
      z.object({
        /**
         * Custom details page.
         */
        type: z.literal("custom"),
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
        type: z.literal("video"),
        /**
         * Label for the open action button. Use this if you want to change the text
         * of the "Open" button to be more matching to your media item.
         * For example you could change the text to be "Watch".
         *
         * The label is a translation key.
         *
         * @example "ln.details.open"
         */
        openActionLabel: z.string().optional(),
      }),
    ])
    .optional(),
  /**
   * Pick the media type's icon from https://pictogrammers.com/library/mdi/
   * Prefix it's name with "mdi--"
   *
   * @example "mdi--ab-testing"
   */
  icon: z.string(),
})

export const LIGHTNET_COLLECTIONS = {
  categories: defineCollection({ type: "data", schema: categorySchema }),
  "media-collections": defineCollection({
    type: "data",
    schema: mediaCollectionSchema,
  }),
  media: defineCollection({ type: "data", schema: mediaSchema }),
  "media-types": defineCollection({ type: "data", schema: mediaTypeSchema }),
}
