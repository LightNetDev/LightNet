import { afterEach, expect, test, vi } from "vitest"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

test("Shares one request and its result between search consumers", async () => {
  const items = [{ id: "example" }]
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ items }) })
  vi.stubGlobal("fetch", fetchMock)
  const { loadSearchItems } =
    await import("../../../src/pages/search-page/utils/load-search-items")

  const first = loadSearchItems()
  const second = loadSearchItems()
  expect(first).toBe(second)
  expect(await first).toEqual(items)
  expect(await loadSearchItems()).toEqual(items)
  expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/internal/search.json")
})

test("Allows retrying a failed request", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({ ok: false })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [] }) })
  vi.stubGlobal("fetch", fetchMock)
  const { loadSearchItems } =
    await import("../../../src/pages/search-page/utils/load-search-items")

  await expect(loadSearchItems()).rejects.toThrow(
    "Was not able to load search results",
  )
  await expect(loadSearchItems()).resolves.toEqual([])
  expect(fetchMock).toHaveBeenCalledTimes(2)
})
