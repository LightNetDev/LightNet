import { beforeEach, expect, test, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getMediaItems: vi.fn(),
  getMediaItem: vi.fn(),
}))

vi.mock("../../../src/content/get-media-items", () => ({
  getMediaItems: mocks.getMediaItems,
  getMediaItem: mocks.getMediaItem,
}))

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
})

test("Should return empty translations when commonId is missing", async () => {
  mocks.getMediaItems.mockResolvedValue([
    { id: "book-en", data: { commonId: "book", language: "en" } },
    { id: "book-de", data: { commonId: "book", language: "de" } },
  ])
  mocks.getMediaItem.mockResolvedValue({
    id: "standalone-en",
    data: { language: "en" },
  })

  const { getTranslations } =
    await import("../../../src/pages/details-page/utils/get-translations")
  const result = await getTranslations("standalone-en")

  expect(result).toEqual([])
})

test("Should return sorted translations and ignore unique or missing commonId", async () => {
  mocks.getMediaItems.mockResolvedValue([
    { id: "book-de", data: { commonId: "book", language: "de" } },
    { id: "book-en", data: { commonId: "book", language: "en" } },
    { id: "book-es", data: { commonId: "book", language: "es" } },
    { id: "guide-en", data: { commonId: "guide", language: "en" } },
    { id: "standalone-fr", data: { language: "fr" } },
  ])
  mocks.getMediaItem.mockResolvedValue({
    id: "book-en",
    data: { commonId: "book", language: "en" },
  })

  const { getTranslations } =
    await import("../../../src/pages/details-page/utils/get-translations")
  const result = await getTranslations("book-en")

  expect(result).toEqual([
    { id: "book-de", language: "de" },
    { id: "book-es", language: "es" },
  ])
})

test("Should return language alternates including the media item itself", async () => {
  mocks.getMediaItems.mockResolvedValue([
    { id: "book-es", data: { commonId: "book", language: "es" } },
    { id: "book-en", data: { commonId: "book", language: "en" } },
    { id: "standalone-fr", data: { language: "fr" } },
  ])
  mocks.getMediaItem.mockResolvedValue({
    id: "book-es",
    data: { commonId: "book", language: "es" },
  })

  const { getLanguageAlternates } =
    await import("../../../src/pages/details-page/utils/get-translations")

  expect(await getLanguageAlternates("book-es")).toEqual([
    { id: "book-en", language: "en" },
    { id: "book-es", language: "es" },
  ])
})

test("Should return no language alternates without translations", async () => {
  mocks.getMediaItems.mockResolvedValue([
    { id: "book-en", data: { commonId: "book", language: "en" } },
    { id: "standalone-fr", data: { language: "fr" } },
  ])
  mocks.getMediaItem.mockImplementation(async (id: string) =>
    id === "book-en"
      ? { id, data: { commonId: "book", language: "en" } }
      : { id, data: { language: "fr" } },
  )

  const { getLanguageAlternates } =
    await import("../../../src/pages/details-page/utils/get-translations")

  expect(await getLanguageAlternates("book-en")).toEqual([])
  expect(await getLanguageAlternates("standalone-fr")).toEqual([])
})

test("Should skip language alternates when a group repeats a language", async () => {
  mocks.getMediaItems.mockResolvedValue([
    { id: "book-en", data: { commonId: "book", language: "en" } },
    { id: "audio-en", data: { commonId: "book", language: "en" } },
    { id: "book-de", data: { commonId: "book", language: "de" } },
  ])
  mocks.getMediaItem.mockResolvedValue({
    id: "book-de",
    data: { commonId: "book", language: "de" },
  })

  const { getLanguageAlternates, getTranslations } =
    await import("../../../src/pages/details-page/utils/get-translations")

  expect(await getLanguageAlternates("book-de")).toEqual([])
  // The visible list of translations still shows every media item.
  expect(await getTranslations("book-de")).toHaveLength(2)
})
