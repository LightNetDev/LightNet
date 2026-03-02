import { z } from "astro/zod"
import { expect, test, vi } from "vitest"

vi.mock("astro:content", () => ({
  defineCollection: (definition: unknown) => definition,
  reference: () => z.string(),
}))

const {
  categorySchema,
  inlineTranslationSchema,
  languageSchema,
  mediaCollectionSchema,
} = await import("../../src/content/content-schema")

test("Should accept inline translation with only default locale", () => {
  const parsed = inlineTranslationSchema.safeParse({
    en: "Hello",
  })

  expect(parsed.success).toBe(true)
})

test("Should reject inline translation without default locale", () => {
  const parsed = inlineTranslationSchema.safeParse({
    de: "Hallo",
  })

  expect(parsed.success).toBe(false)
})

test("Should reject unsupported locale keys in inline translation", () => {
  const parsed = inlineTranslationSchema.safeParse({
    en: "Hello",
    fr: "Bonjour",
  })

  expect(parsed.success).toBe(false)
  if (parsed.success) {
    return
  }

  expect(parsed.error.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: expect.stringContaining("Unrecognized key(s) in object"),
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

test("Should reject language with invalid BCP-47 code", () => {
  const parsed = languageSchema.safeParse({
    code: "en_US",
    label: {
      en: "English",
    },
  })

  expect(parsed.success).toBe(false)
})
