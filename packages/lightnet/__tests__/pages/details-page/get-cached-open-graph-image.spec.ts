import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import { afterEach, beforeEach, expect, test, vi } from "vitest"

import { createOpenGraphImage } from "../../../src/pages/details-page/utils/create-open-graph-image"
import { getCachedOpenGraphImage } from "../../../src/pages/details-page/utils/get-cached-open-graph-image"

vi.mock(
  "../../../src/pages/details-page/utils/create-open-graph-image",
  () => ({
    createOpenGraphImage: vi.fn(),
  }),
)

let cacheDir: URL
const input = {
  cover: Buffer.from("cover contents"),
  title: "A book",
  authors: ["An author"],
}
const png = Buffer.from("rendered PNG")

beforeEach(async () => {
  cacheDir = pathToFileURL(
    (await mkdtemp(join(tmpdir(), "lightnet-open-graph-"))) + "/",
  )
  vi.mocked(createOpenGraphImage).mockReset().mockResolvedValue(png)
})

afterEach(async () => {
  vi.restoreAllMocks()
  await rm(cacheDir, { recursive: true, force: true })
})

test("Reuses the PNG from disk after the module is reloaded", async () => {
  expect(await getCachedOpenGraphImage(input, cacheDir)).toEqual(png)
  expect(createOpenGraphImage).toHaveBeenCalledTimes(1)

  vi.resetModules()
  const { getCachedOpenGraphImage: reloaded } =
    await import("../../../src/pages/details-page/utils/get-cached-open-graph-image")
  expect(await reloaded(input, cacheDir)).toEqual(png)
  expect(createOpenGraphImage).toHaveBeenCalledTimes(1)

  const files = await readdir(new URL("lightnet/open-graph/", cacheDir))
  expect(files).toHaveLength(1)
  expect(files[0]).toMatch(/^[a-f0-9]{64}\.png$/)
})

test.each([
  { cover: Buffer.from("changed cover contents") },
  { title: "A different title" },
  { authors: ["Another author"] },
  { direction: "rtl" as const },
  { coverImageStyle: "book" as const },
])("Invalidates the image when inputs change: %j", async (change) => {
  await getCachedOpenGraphImage(input, cacheDir)
  await getCachedOpenGraphImage({ ...input, ...change }, cacheDir)
  expect(createOpenGraphImage).toHaveBeenCalledTimes(2)
})

test("Normalizes omitted defaults and absent authors", async () => {
  await getCachedOpenGraphImage({ ...input, authors: null }, cacheDir)
  await getCachedOpenGraphImage(
    { ...input, authors: [], direction: "ltr", coverImageStyle: "default" },
    cacheDir,
  )
  expect(createOpenGraphImage).toHaveBeenCalledTimes(1)
})

test("Regenerates images when the cache has been cleared", async () => {
  await getCachedOpenGraphImage(input, cacheDir)
  await rm(new URL("lightnet/", cacheDir), { recursive: true })
  expect(await getCachedOpenGraphImage(input, cacheDir)).toEqual(png)
  expect(createOpenGraphImage).toHaveBeenCalledTimes(2)
})

test("Still renders when the cache is inaccessible", async () => {
  await writeFile(new URL("lightnet", cacheDir), "not a directory")
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
  expect(await getCachedOpenGraphImage(input, cacheDir)).toEqual(png)
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining("Cannot read Open Graph image cache"),
    expect.objectContaining({ code: "ENOTDIR" }),
  )
})
