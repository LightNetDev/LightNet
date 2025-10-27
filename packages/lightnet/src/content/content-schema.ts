import { glob } from "astro/loaders"
import { z } from "astro/zod"
import type { SchemaContext } from "astro:content"
import { defineCollection, reference } from "astro:content"

import { imageSchema } from "./astro-image"

/**
 * Category Schema
 */
export const categorySchema = z.object({
  /**
   * Name of the category.
   *
   * This can either be a translation key or a string that will be displayed as is.
   * LightNet will try to use it as translation key first if no translation is found it will use the string as is.
   *
   * @example "category.biography"
   */
  label: z.string(),

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

/**
 * Media Collection Schema
 */
export const mediaCollectionSchema = z.object({
  /**
   * Name of the collection.
   *
   * This can either be a translation key or a string that will be displayed as is.
   * LightNet will try to use it as translation key first if no translation is found it will use the string as is.
   */
  label: z.string(),
})

/**
 * Media Item Schema
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
  authors: z.array(z.string()).nullish(),
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
  categories: z.array(reference("categories")).nullish(),
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
    .nullish(),
  /**
   * BCP-47 name of the language this media item is in.
   *
   * @example "en"
   */
  language: z.string(),
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
         * The name of the content. If this is not set. The file name
         * from URL will be used. This can either be a fixed string or a translation key.
         */
        label: z.string().optional(),
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

export const createCategorySchema = ({ image }: SchemaContext) =>
  categorySchema.extend({
    image: image().optional(),
  })

/**
 * Media Type Schema
 */
export const mediaTypeSchema = z
  .object({
    /**
     * Name of this media type that will be shown on the pages.
     *
     * This can either be a fixed string or a translation key.
     *
     * @example "media-type.book"
     */
    label: z.string(),
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
           * The label is a translation key.
           *
           * @example "ln.details.open"
           */
          openActionLabel: z.string().optional(),
          /**
           * (Deprecated) Specifies the style of the cover image.
           *
           * Use `coverImageStyle` instead. This option will be removed in a future major release.
           *
           * Supported values:
           * - `"default"` — unmodified media item image
           * - `"book"` — styled as a book cover (book fold, sharper edges)
           *
           * @example "book"
           * @deprecated Use `coverImageStyle` instead
           */
          coverStyle: z.enum(["default", "book"]).default("default"),
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
     * Pick the media type's icon from https://pictogrammers.com/library/mdi/
     * Prefix it's name with "mdi--"
     *
     * @example "mdi--ab-testing"
     */
    icon: z.string(),
  })
  .transform((mediaType) => {
    // migrate old cover images style to new property
    const hasDeprecatedBookCover =
      mediaType.detailsPage?.layout === "default" &&
      mediaType.detailsPage.coverStyle === "book"
    return {
      ...mediaType,
      coverImageStyle: hasDeprecatedBookCover
        ? "book"
        : mediaType.coverImageStyle,
    }
  })

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
  "internal-media-image-path": defineCollection({
    loader: glob({
      pattern: "*.json",
      base: "./src/content/media",
    }),
    schema: z.object({ image: z.string() }),
  }),
}

export const mediaItemEntrySchema = z.object({
  id: z.string(),
  data: mediaItemSchema,
})

export type MediaItemEntry = z.infer<typeof mediaItemEntrySchema>

export const mediaTypeEntrySchema = z.object({
  id: z.string(),
  data: mediaTypeSchema,
})

export const categoryEntrySchema = z.object({
  id: z.string(),
  data: categorySchema,
})
