import { z } from "astro/zod"
import { expect, test, vi } from "vitest"

import { getTranslationProvenance } from "../../src/i18n/translation-provenance"

vi.mock("astro:content", () => ({
  defineCollection: (definition: unknown) => definition,
  reference: () => z.string(),
}))

const {
  categorySchema,
  inlineTranslationSchema,
  mediaCollectionSchema,
  mediaItemSchema,
} = await import("../../src/content/content-schema")

test("Should accept inline translation with only default locale", () => {
  const parsed = inlineTranslationSchema.safeParse({
    en: "Hello",
  })

  expect(parsed.success).toBe(true)
  if (!parsed.success) {
    return
  }

  expect(getTranslationProvenance(parsed.data)).toEqual({})
})

test("Should accept inline translation without a specific default locale", () => {
  const parsed = inlineTranslationSchema.safeParse({
    de: "Hallo",
  })

  expect(parsed.success).toBe(true)
})

test("Should accept arbitrary locale keys in inline translation", () => {
  const parsed = inlineTranslationSchema.safeParse({
    en: "Hello",
    fr: "Bonjour",
  })

  expect(parsed.success).toBe(true)
})

test("Should reject empty inline translations", () => {
  const parsed = inlineTranslationSchema.safeParse({})

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
