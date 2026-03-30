import { beforeEach, expect, test, vi } from "vitest"

const getCollectionMock = vi.fn()

vi.mock("astro:content", async () => {
  const { z } = await import("astro/zod")

  return {
    getCollection: getCollectionMock,
    defineCollection: (definition: unknown) => definition,
    reference: () => z.object({ id: z.string(), collection: z.string() }),
  }
})

beforeEach(() => {
  vi.resetModules()
  getCollectionMock.mockReset()
})

test("Should build a reverse index and ignore duplicate media items in a collection", async () => {
  getCollectionMock.mockResolvedValue([
    {
      id: "series-a",
      data: {
        label: { en: "Series A" },
        mediaItems: [
          { id: "item-2", collection: "media" },
          { id: "item-1", collection: "media" },
          { id: "item-1", collection: "media" },
        ],
      },
    },
    {
      id: "series-b",
      data: {
        label: { en: "Series B" },
        mediaItems: [{ id: "item-1", collection: "media" }],
      },
    },
  ])

  const { getCollectionsForMediaItem } =
    await import("../../src/content/get-media-collections")

  expect(await getCollectionsForMediaItem("item-1")).toEqual([
    "series-a",
    "series-b",
  ])
  expect(await getCollectionsForMediaItem("item-2")).toEqual(["series-a"])
})

test("Should return empty for unknown media ids and load collections once", async () => {
  getCollectionMock.mockResolvedValue([
    {
      id: "series-a",
      data: {
        label: { en: "Series A" },
        mediaItems: [
          { id: "item-2", collection: "media" },
          { id: "item-1", collection: "media" },
        ],
      },
    },
  ])

  const { getCollectionsForMediaItem } =
    await import("../../src/content/get-media-collections")

  expect(await getCollectionsForMediaItem("missing-id")).toEqual([])
  expect(await getCollectionsForMediaItem("item-1")).toEqual(["series-a"])
  expect(getCollectionMock).toHaveBeenCalledTimes(1)
})
