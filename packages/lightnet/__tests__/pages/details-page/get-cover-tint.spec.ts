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

async function tintChannels(svg: string) {
  const tint = await getCoverTint(Buffer.from(svg))
  return tint.match(/\d+/g)!.map(Number)
}

test.each(["#222", "#888", "#eee", "#304850"])(
  "Prefers a substantial colorful region over a dominant neutral background: %s",
  async (background) => {
    const [r, g, b] = await tintChannels(
      `<svg width="100" height="100">
        <rect width="100" height="100" fill="${background}"/>
        <rect width="20" height="100" fill="#2080e0"/>
        <rect width="10" height="100" x="20" fill="red"/>
      </svg>`,
    )
    expect(b).toBeGreaterThan(r + 40)
    expect(g).toBeGreaterThan(r)
  },
)

test("Keeps monochrome images neutral", async () => {
  const [r, g, b] = await tintChannels(
    '<svg width="100" height="100"><rect width="100" height="100" fill="#888"/></svg>',
  )
  expect(r).toBe(g)
  expect(g).toBe(b)
})

test("Does not let a tiny colorful accent dominate a neutral image", async () => {
  const [r, g, b] = await tintChannels(
    `<svg width="100" height="100">
      <rect width="100" height="100" fill="#888"/>
      <rect width="2" height="100" fill="red"/>
    </svg>`,
  )
  expect(r).toBe(g)
  expect(g).toBe(b)
})

test("Weights colors by opacity and ignores hidden RGB values", async () => {
  const pixels = Buffer.alloc(100 * 100 * 4)
  for (let offset = 0; offset < pixels.length; offset += 4) {
    // Mostly invisible red pixels must not outweigh the opaque blue artwork.
    const blue = offset < 10 * 100 * 4
    pixels[offset] = blue ? 0 : 255
    pixels[offset + 2] = blue ? 255 : 0
    pixels[offset + 3] = blue ? 255 : offset < 50 * 100 * 4 ? 1 : 0
  }
  const image = await sharp(pixels, {
    raw: { width: 100, height: 100, channels: 4 },
  })
    .png()
    .toBuffer()
  const tint = await getCoverTint(image)
  const [r, , b] = tint.match(/\d+/g)!.map(Number)
  expect(b).toBeGreaterThan(r + 40)
})

test("Uses a light neutral fallback for fully transparent artwork", async () => {
  const [r, g, b] = await tintChannels(
    '<svg width="100" height="100"><rect width="100" height="100" fill="red" fill-opacity="0"/></svg>',
  )
  expect(r).toBe(g)
  expect(g).toBe(b)
  expect(r).toBeGreaterThan(240)
})

test("Reuses the color from disk after the module is reloaded", async () => {
  const extraction = vi.spyOn(sharp.prototype, "autoOrient")
  const tint = await getCoverTint(cover, cacheDir)
  expect(extraction).toHaveBeenCalledTimes(1)

  const reloaded = await reload()
  expect(await reloaded(cover, cacheDir)).toBe(tint)
  expect(extraction).toHaveBeenCalledTimes(1)

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
    const extraction = vi.spyOn(sharp.prototype, "autoOrient")
    expect(await reloaded(cover, cacheDir)).toBe(tint)
    expect(extraction).toHaveBeenCalledTimes(1)
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
  const extraction = vi.spyOn(sharp.prototype, "autoOrient")
  const colors = await Promise.all(
    Array.from({ length: 5 }, () => getCoverTint(cover, cacheDir)),
  )
  expect(new Set(colors).size).toBe(1)
  expect(extraction).toHaveBeenCalledTimes(1)
  expect(
    await readdir(new URL("lightnet/cover-tints/", cacheDir)),
  ).toHaveLength(1)
})
