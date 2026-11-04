import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import sharp from "sharp"
import { afterEach, beforeEach, expect, test, vi } from "vitest"

import { getCoverTint } from "../../../src/pages/details-page/utils/get-cover-tint"

let cacheDir: URL
const cover = Buffer.from(
  '<svg width="20" height="20"><rect width="100%" height="100%" fill="red"/></svg>',
)

beforeEach(async () => {
  cacheDir = pathToFileURL(
    (await mkdtemp(join(tmpdir(), "lightnet-cover-tint-"))) + "/",
  )
})

afterEach(async () => {
  vi.restoreAllMocks()
  await rm(cacheDir, { recursive: true, force: true })
})

async function reload() {
  vi.resetModules()
  return (await import("../../../src/pages/details-page/utils/get-cover-tint"))
    .getCoverTint
}

test("Reuses the color from disk after the module is reloaded", async () => {
  const stats = vi.spyOn(sharp.prototype, "stats")
  const tint = await getCoverTint(cover, cacheDir)
  expect(stats).toHaveBeenCalledTimes(1)

  const reloaded = await reload()
  expect(await reloaded(cover, cacheDir)).toBe(tint)
  expect(stats).toHaveBeenCalledTimes(1)

  const directory = new URL("lightnet/cover-tints/", cacheDir)
  const files = await readdir(directory)
  expect(files).toHaveLength(1)
  expect(files[0]).toMatch(/^[a-f0-9]{64}\.txt$/)
  expect(await readFile(new URL(files[0], directory), "utf8")).toBe(tint)
})

test("Calculates a new color when the image contents change", async () => {
  const red = await getCoverTint(cover, cacheDir)
  const blue = await getCoverTint(
    Buffer.from(cover.toString().replace("red", "blue")),
    cacheDir,
  )
  expect(blue).not.toBe(red)
  expect(
    await readdir(new URL("lightnet/cover-tints/", cacheDir)),
  ).toHaveLength(2)
})

test.each(["invalid", "rgb(999,0,0)"])(
  "Recalculates and replaces a corrupt cached color: %s",
  async (invalid) => {
    const tint = await getCoverTint(cover, cacheDir)
    const directory = new URL("lightnet/cover-tints/", cacheDir)
    const [file] = await readdir(directory)
    const path = new URL(file, directory)
    await writeFile(path, invalid)

    const reloaded = await reload()
    const stats = vi.spyOn(sharp.prototype, "stats")
    expect(await reloaded(cover, cacheDir)).toBe(tint)
    expect(stats).toHaveBeenCalledTimes(1)
    expect(await readFile(path, "utf8")).toBe(tint)
  },
)

test("Still calculates a color when the cache is inaccessible", async () => {
  await writeFile(new URL("lightnet", cacheDir), "not a directory")
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)
  expect(await getCoverTint(cover, cacheDir)).toMatch(/^rgb\(/)
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining("Cannot read cover tint cache"),
    expect.objectContaining({ code: "ENOTDIR" }),
  )
})

test("Shares color extraction between concurrent requests", async () => {
  const stats = vi.spyOn(sharp.prototype, "stats")
  const colors = await Promise.all(
    Array.from({ length: 5 }, () => getCoverTint(cover, cacheDir)),
  )
  expect(new Set(colors).size).toBe(1)
  expect(stats).toHaveBeenCalledTimes(1)
  expect(
    await readdir(new URL("lightnet/cover-tints/", cacheDir)),
  ).toHaveLength(1)
})
