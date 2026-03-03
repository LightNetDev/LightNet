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
    { id: "book-en", data: { commonId: "book", language: { id: "en" } } },
    { id: "book-de", data: { commonId: "book", language: { id: "de" } } },
  ])
  mocks.getMediaItem.mockResolvedValue({
    id: "standalone-en",
    data: { language: { id: "en" } },
  })

  const { getTranslations } =
    await import("../../../src/pages/details-page/utils/get-translations")
  const result = await getTranslations("standalone-en")

  expect(result).toEqual([])
})

test("Should return sorted translations and ignore unique or missing commonId", async () => {
  mocks.getMediaItems.mockResolvedValue([
    { id: "book-de", data: { commonId: "book", language: { id: "de" } } },
    { id: "book-en", data: { commonId: "book", language: { id: "en" } } },
    { id: "book-es", data: { commonId: "book", language: { id: "es" } } },
    { id: "guide-en", data: { commonId: "guide", language: { id: "en" } } },
    { id: "standalone-fr", data: { language: { id: "fr" } } },
  ])
  mocks.getMediaItem.mockResolvedValue({
    id: "book-en",
    data: { commonId: "book", language: { id: "en" } },
  })

  const { getTranslations } =
    await import("../../../src/pages/details-page/utils/get-translations")
  const result = await getTranslations("book-en")

  expect(result).toEqual([
    { id: "book-de", language: "de" },
    { id: "book-es", language: "es" },
  ])
})
