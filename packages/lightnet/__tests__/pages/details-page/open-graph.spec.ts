import { getCollection } from "astro:content"
import { expect, test, vi } from "vitest"

import { getStaticPaths } from "../../../src/pages/details-page/api/open-graph"

vi.mock("astro:content", async (importOriginal) => ({
  ...(await importOriginal<typeof import("astro:content")>()),
  getCollection: vi.fn(),
  getEntry: vi.fn(),
}))

test("Generates one image per item in the default site locale", async () => {
  vi.mocked(getCollection).mockResolvedValue([
    { id: "first-book" },
    { id: "second-book" },
  ] as Awaited<ReturnType<typeof getCollection>>)

  expect(
    await getStaticPaths({} as Parameters<typeof getStaticPaths>[0]),
  ).toEqual([
    { params: { locale: "en", mediaId: "first-book" } },
    { params: { locale: "en", mediaId: "second-book" } },
  ])
})
