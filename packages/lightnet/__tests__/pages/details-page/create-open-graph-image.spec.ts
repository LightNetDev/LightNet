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

test("Fits long text and treats markup as literal content", async () => {
  const cover = await sharp({
    create: { width: 10, height: 10, channels: 3, background: "white" },
  })
    .png()
    .toBuffer()
  const png = await createOpenGraphImage({
    cover,
    title: 'A <title> & "quotes" '.repeat(30),
    authors: ["An author ".repeat(40)],
  })
  expect(await sharp(png).metadata()).toMatchObject({
    format: "png",
    width: 1200,
    height: 630,
  })
})

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
