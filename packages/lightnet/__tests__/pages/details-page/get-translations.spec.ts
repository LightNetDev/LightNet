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
