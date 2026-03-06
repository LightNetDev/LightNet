import { expect, test, vi } from "vitest"

import type {
  MediaCollectionEntry,
  MediaItemEntry,
} from "../../src/content/content-schema"
import { queryMediaItems } from "../../src/content/query-media-items"

vi.mock("astro:content", async () => {
  const { z } = await import("astro/zod")

  return {
    getCollection: vi.fn(),
    defineCollection: (definition: unknown) => definition,
    reference: () => z.object({ id: z.string(), collection: z.string() }),
  }
})

const image = {
  src: "/image.webp",
  width: 400,
  height: 600,
  format: "webp",
} as const

const mediaItem = ({
  id,
  title,
  type,
  language,
  dateCreated,
  categories,
}: {
  id: string
  title: string
  type: string
  language: string
  dateCreated: string
  categories?: string[]
}): MediaItemEntry => ({
  id,
  data: {
    commonId: id,
    title,
    type: { id: type, collection: "media-types" },
    description: "",
    authors: [],
    dateCreated,
    categories: categories?.map((category) => ({
      id: category,
      collection: "categories",
    })),
    language: { id: language, collection: "languages" },
    image,
    content: [{ type: "upload", url: "/files/example.pdf" }],
  },
})

const mediaItems: MediaItemEntry[] = [
  mediaItem({
    id: "a",
    title: "Alpha",
    type: "book",
    language: "en",
    dateCreated: "2024-01-02",
    categories: ["family"],
  }),
  mediaItem({
    id: "b",
    title: "Beta",
    type: "book",
    language: "en",
    dateCreated: "2025-01-03",
    categories: ["theology"],
  }),
  mediaItem({
    id: "c",
    title: "Charlie",
    type: "video",
    language: "de",
    dateCreated: "2023-03-04",
    categories: ["theology"],
  }),
  mediaItem({
    id: "d",
    title: "Delta",
    type: "book",
    language: "en",
    dateCreated: "2022-01-01",
  }),
]

const mediaCollections: MediaCollectionEntry[] = [
  {
    id: "featured",
    data: {
      label: { en: "Featured" },
      mediaItems: [
        { id: "d", collection: "media" },
        { id: "b", collection: "media" },
        { id: "a", collection: "media" },
        { id: "a", collection: "media" },
      ],
    },
  },
  {
    id: "german",
    data: {
      label: { en: "German" },
      mediaItems: [{ id: "c", collection: "media" }],
    },
  },
]

test("Should filter by media type", async () => {
  const result = await queryMediaItems(
    Promise.resolve(mediaItems),
    Promise.resolve(mediaCollections),
    {
      where: { type: "book" },
    },
  )

  expect(result.map((item) => item.id)).toEqual(["a", "b", "d"])
})

test("Should combine collection and other filters using AND", async () => {
  const result = await queryMediaItems(
    Promise.resolve(mediaItems),
    Promise.resolve(mediaCollections),
    {
      where: {
        collection: "featured",
        language: "en",
        type: "book",
        category: "theology",
      },
    },
  )

  expect(result.map((item) => item.id)).toEqual(["b"])
})

test("Should keep collection order when no orderBy is set", async () => {
  const result = await queryMediaItems(
    Promise.resolve(mediaItems),
    Promise.resolve(mediaCollections),
    {
      where: {
        collection: "featured",
      },
    },
  )

  expect(result.map((item) => item.id)).toEqual(["d", "b", "a"])
})

test("Should override collection order when orderBy is set", async () => {
  const result = await queryMediaItems(
    Promise.resolve(mediaItems),
    Promise.resolve(mediaCollections),
    {
      where: {
        collection: "featured",
      },
      orderBy: "title",
    },
  )

  expect(result.map((item) => item.id)).toEqual(["a", "b", "d"])
})

test("Should apply limit after ordering", async () => {
  const result = await queryMediaItems(
    Promise.resolve(mediaItems),
    Promise.resolve(mediaCollections),
    {
      where: {
        collection: "featured",
      },
      limit: 2,
    },
  )

  expect(result.map((item) => item.id)).toEqual(["d", "b"])
})

test("Should return an empty list for unknown collection filters", async () => {
  const result = await queryMediaItems(
    Promise.resolve(mediaItems),
    Promise.resolve(mediaCollections),
    {
      where: {
        collection: "does-not-exist",
      },
    },
  )

  expect(result).toEqual([])
})

test("Should sort by dateCreated descending", async () => {
  const result = await queryMediaItems(
    Promise.resolve(mediaItems),
    Promise.resolve(mediaCollections),
    {
      where: { type: "book" },
      orderBy: "dateCreated",
    },
  )

  expect(result.map((item) => item.id)).toEqual(["b", "a", "d"])
})
