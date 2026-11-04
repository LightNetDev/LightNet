import sharp from "sharp"
import { expect, test } from "vitest"

import { createOpenGraphImage } from "../../../src/pages/details-page/utils/create-open-graph-image"

test.each([
  { width: 100, height: 200, direction: "ltr" as const },
  { width: 400, height: 100, direction: "ltr" as const },
  { width: 100, height: 200, direction: "rtl" as const },
])(
  "Keeps every cover edge for $width × $height in $direction",
  async ({ width, height, direction }) => {
    const cover = Buffer.from(`<svg width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="red"/>
    <rect x="10" y="10" width="${width - 20}" height="${height - 20}" fill="white"/>
  </svg>`)
    const png = await createOpenGraphImage({
      cover,
      title: "A title",
      direction,
    })
    const { data, info } = await sharp(png)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    expect(info).toMatchObject({ width: 1200, height: 630, channels: 3 })
    const pixel = (x: number, y: number) => [
      ...data.subarray((y * 1200 + x) * 3, (y * 1200 + x) * 3 + 3),
    ]
    const scale = Math.min(432 / width, 502 / height)
    const imageWidth = Math.round(width * scale)
    const imageHeight = Math.round(height * scale)
    const start = direction === "rtl" ? 704 : 64
    const x = start + Math.floor((432 - imageWidth) / 2)
    const y = 64 + Math.floor((502 - imageHeight) / 2)
    const centerX = x + Math.floor(imageWidth / 2)
    const centerY = y + Math.floor(imageHeight / 2)
    for (const [edgeX, edgeY] of [
      [x + 2, centerY],
      [x + imageWidth - 3, centerY],
      [centerX, y + 2],
      [centerX, y + imageHeight - 3],
    ]) {
      expect(pixel(edgeX, edgeY)).toEqual([255, 0, 0])
    }
    expect(pixel(centerX, centerY)).toEqual([255, 255, 255])
  },
)

test.each(["ltr", "rtl"] as const)(
  "Fits long text and treats markup as literal content in %s",
  async (direction) => {
    const cover = await sharp({
      create: { width: 10, height: 10, channels: 3, background: "white" },
    })
      .png()
      .toBuffer()
    const png = await createOpenGraphImage({
      cover,
      title: 'A <title> & "quotes" '.repeat(30),
      authors: ["An author ".repeat(40)],
      direction,
    })
    expect(await sharp(png).metadata()).toMatchObject({
      format: "png",
      width: 1200,
      height: 630,
    })
    const { data, info } = await sharp(png)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const textStart = direction === "rtl" ? 64 : 560
    const textRows = []
    for (let y = 0; y < info.height; y++) {
      for (let x = textStart; x < textStart + 576; x++) {
        const offset = (y * info.width + x) * 3
        if (
          data[offset] < 100 &&
          data[offset + 1] < 100 &&
          data[offset + 2] < 100
        ) {
          textRows.push(y)
          break
        }
      }
    }
    expect(textRows.length).toBeGreaterThan(0)
    // Title (280), gap (24), and authors (84) stay centered within the image.
    expect(Math.min(...textRows)).toBeGreaterThanOrEqual(121)
    expect(Math.max(...textRows)).toBeLessThan(509)
  },
)

test.each(["ltr", "rtl"] as const)(
  "Keeps short titles and authors from filling their text boxes in %s",
  async (direction) => {
    const png = await createOpenGraphImage({
      cover: Buffer.from(
        '<svg width="10" height="10"><rect width="10" height="10" fill="white"/></svg>',
      ),
      title: "Hi",
      authors: ["Al"],
      direction,
    })
    const { data, info } = await sharp(png)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const textStart = direction === "rtl" ? 64 : 560
    const titleRows = new Set<number>()
    const authorRows = new Set<number>()
    for (let y = 0; y < info.height; y++) {
      for (let x = textStart; x < textStart + 576; x++) {
        const offset = (y * info.width + x) * 3
        const [r, g, b] = data.subarray(offset, offset + 3)
        if (r < 40 && g < 50 && b < 60) titleRows.add(y)
        if (r === 75 && g === 85 && b === 99) authorRows.add(y)
      }
    }
    expect(titleRows.size).toBeGreaterThan(0)
    expect(titleRows.size).toBeLessThanOrEqual(64)
    expect(authorRows.size).toBeGreaterThan(0)
    expect(authorRows.size).toBeLessThanOrEqual(32)
  },
)

test("Supports Arabic text and absent authors", async () => {
  const cover = await sharp({
    create: { width: 10, height: 10, channels: 3, background: "white" },
  })
    .png()
    .toBuffer()
  const png = await createOpenGraphImage({
    cover,
    title: "تعلم التزلج",
    authors: null,
    direction: "rtl",
  })
  expect(await sharp(png).metadata()).toMatchObject({
    width: 1200,
    height: 630,
  })
})
