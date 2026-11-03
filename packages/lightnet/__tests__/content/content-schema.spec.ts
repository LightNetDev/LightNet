import { z } from "astro/zod"
import { expect, test, vi } from "vitest"

vi.mock("astro:content", () => ({
  defineCollection: (definition: unknown) => definition,
  reference: () => z.string(),
}))

const { categorySchema } = await import("../../src/content/schema/category")
const { translationMapSchema } =
  await import("../../src/i18n/translation-map-schema")
const { mediaCollectionSchema } =
  await import("../../src/content/schema/media-collection")
const { mediaItemSchema } = await import("../../src/content/schema/media-item")
const { mediaTypeSchema } = await import("../../src/content/schema/media-type")

test("Should accept inline translation with only default locale", () => {
  const parsed = translationMapSchema.safeParse({
    en: "Hello",
  })

  expect(parsed.success).toBe(true)
})

test("Should accept inline translation without a specific default locale", () => {
  const parsed = translationMapSchema.safeParse({
    de: "Hallo",
  })

  expect(parsed.success).toBe(true)
})

test("Should accept arbitrary locale keys in inline translation", () => {
  const parsed = translationMapSchema.safeParse({
    en: "Hello",
    fr: "Bonjour",
  })

  expect(parsed.success).toBe(true)
})

test("Should reject empty inline translations", () => {
  const parsed = translationMapSchema.safeParse({})

  expect(parsed.success).toBe(false)
  if (parsed.success) {
    return
  }

  expect(parsed.error.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: "Inline translations must contain at least one entry",
        path: [],
      }),
    ]),
  )
})

test("Should accept category label with default locale only", () => {
  const parsed = categorySchema.safeParse({
    label: {
      en: "Category",
    },
  })

  expect(parsed.success).toBe(true)
})

test("Should accept media collection with media item references", () => {
  const parsed = mediaCollectionSchema.safeParse({
    label: {
      en: "Collection",
    },
    mediaItems: ["book-a--en", "book-b--en"],
  })

  expect(parsed.success).toBe(true)
})

test("Should reject media collection without media item references", () => {
  const parsed = mediaCollectionSchema.safeParse({
    label: {
      en: "Collection",
    },
  })

  expect(parsed.success).toBe(false)
})

test("Should accept media item without commonId", () => {
  const parsed = mediaItemSchema.safeParse({
    title: "A book about love",
    type: "book",
    description: "Description",
    authors: ["George Miller"],
    dateCreated: "2024-09-10",
    categories: ["family"],
    language: "en",
    image: {
      src: "/images/a-book-about-love--en.jpg",
      width: 600,
      height: 900,
      format: "webp",
    },
    content: [{ type: "upload", url: "/files/a-book-about-love.pdf" }],
  })

  expect(parsed.success).toBe(true)
})

test("Should leave structured data classification unset for existing media types", () => {
  expect(
    mediaTypeSchema.parse({
      label: { en: "Books" },
      icon: "lucide--book-open",
    }).schemaType,
  ).toBeUndefined()
})

test.each([
  "CreativeWork",
  "Book",
  "Article",
  "DigitalDocument",
  "AudioObject",
  "VideoObject",
  "ImageObject",
])(
  "Should accept %s as a media type structured data classification",
  (schemaType) => {
    expect(
      mediaTypeSchema.parse({
        label: { en: "Resources" },
        icon: "lucide--book-open",
        schemaType,
      }).schemaType,
    ).toBe(schemaType)
  },
)

test.each(["UnknownType", "book", "", null])(
  "Should reject unsupported structured data classification %s",
  (schemaType) => {
    expect(
      mediaTypeSchema.safeParse({
        label: { en: "Resources" },
        icon: "lucide--book-open",
        schemaType,
      }).success,
    ).toBe(false)
  },
)
