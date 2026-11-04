import sharp, { type OverlayOptions } from "sharp"

import type { MediaTypeEntry } from "../../../content/schema/media-type"

export const OPEN_GRAPH_WIDTH = 1200
export const OPEN_GRAPH_HEIGHT = 630

// Text is Pango markup. Escape user content before passing it to the renderer.
function escapeMarkup(text: string) {
  return text.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character]!,
  )
}

async function renderText(
  value: string,
  {
    width,
    height,
    maxSize,
    color,
    bold = false,
    rtl = false,
  }: {
    width: number
    height: number
    maxSize: number
    color: string
    bold?: boolean
    rtl?: boolean
  },
) {
  // Estimate the occupied area using average glyph width (0.55 em) and
  // line height (1.2 em). Count Unicode code points rather than UTF-16 units.
  const size = Math.max(
    1,
    Math.min(
      maxSize,
      Math.floor(
        Math.sqrt((width * height) / ([...value].length * 0.55 * 1.2)),
      ),
    ),
  )
  const render = (fit = false) =>
    sharp({
      text: {
        text: `<span foreground="${color}">${escapeMarkup(value)}</span>`,
        font: `sans ${bold ? "bold " : ""}${size}`,
        width,
        ...(fit ? { height } : {}),
        wrap: "word-char",
        align: rtl ? "right" : "left",
        rgba: true,
      },
    })
      .raw()
      .toBuffer({ resolveWithObject: true })
  const result = await render()
  // Wide glyphs, shaping, and explicit line breaks can exceed the estimate.
  return result.info.height <= height ? result : render(true)
}

export async function createOpenGraphImage({
  cover,
  title,
  authors = [],
  direction = "ltr",
  coverImageStyle = "default",
}: {
  cover: Buffer
  title: string
  authors?: string[] | null
  direction?: "ltr" | "rtl"
  coverImageStyle?: MediaTypeEntry["data"]["coverImageStyle"]
}) {
  const rtl = direction === "rtl"
  const textStart = rtl ? 64 : 560
  const coverImage = await sharp(cover)
    .autoOrient()
    .resize(432, 502, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { dominant } = await sharp(coverImage.data, {
    raw: coverImage.info,
  }).stats()
  const { width: coverWidth, height: coverHeight } = coverImage.info
  const cornerRadius = coverImageStyle === "book" ? 2 : 6
  const decorations: OverlayOptions[] = []
  if (coverImageStyle === "book") {
    decorations.push({
      input: Buffer.from(`<svg width="${coverWidth}" height="${coverHeight}">
        <defs>
          <linearGradient id="spine" x1="${rtl ? 1 : 0}" x2="${rtl ? 0 : 1}">
            <stop stop-color="#6b7280" stop-opacity="0.2"/>
            <stop offset="1" stop-color="#6b7280" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <rect x="${coverWidth * (rtl ? 0.97 : 0.01)}" width="${coverWidth * 0.02}" height="100%" fill="url(#spine)"/>
      </svg>`),
    })
  }
  decorations.push({
    input: Buffer.from(`<svg width="${coverWidth}" height="${coverHeight}">
      <rect width="100%" height="100%" rx="${cornerRadius}" fill="white"/>
    </svg>`),
    blend: "dest-in",
  })
  const decoratedCover = await sharp(coverImage.data, { raw: coverImage.info })
    .composite(decorations)
    .raw()
    .toBuffer({ resolveWithObject: true })
  const tint = `rgb(${[dominant.r, dominant.g, dominant.b]
    .map((channel) => Math.round(250 * 0.68 + channel * 0.32))
    .join(",")})`
  const coverLeft =
    (rtl ? 704 : 64) + Math.floor((432 - coverImage.info.width) / 2)
  const coverTop = 64 + Math.floor((502 - coverImage.info.height) / 2)
  const layers: OverlayOptions[] = [
    {
      input: decoratedCover.data,
      raw: decoratedCover.info,
      left: coverLeft,
      top: coverTop,
    },
  ]
  const textLayers: OverlayOptions[] = []
  const addText = async (
    value: string,
    top: number,
    height: number,
    maxSize: number,
    color: string,
    bold = false,
  ) => {
    if (!value.trim()) return 0
    const text = await renderText(value, {
      width: 576,
      height,
      maxSize,
      color,
      bold,
      rtl,
    })
    textLayers.push({
      input: text.data,
      raw: text.info,
      left: textStart + (rtl ? 576 - text.info.width : 0),
      top,
    })
    return text.info.height
  }

  const titleHeight = await addText(title, 0, 280, 64, "#111827", true)
  const authorsHeight = await addText(
    authors?.join(", ") ?? "",
    titleHeight + 24,
    84,
    32,
    "#4b5563",
  )
  const contentHeight = titleHeight + (authorsHeight ? 24 + authorsHeight : 0)
  const textTop = Math.round((OPEN_GRAPH_HEIGHT - contentHeight) / 2)
  layers.push(
    ...textLayers.map((layer) => ({
      ...layer,
      top: textTop + (layer.top ?? 0),
    })),
  )

  return sharp(
    Buffer.from(`<svg width="${OPEN_GRAPH_WIDTH}" height="${OPEN_GRAPH_HEIGHT}">
    <defs>
      <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="${rtl ? "#fcfcfd" : tint}"/>
        <stop offset="1" stop-color="${rtl ? tint : "#fcfcfd"}"/>
      </linearGradient>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="16"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#background)"/>
    <rect x="${coverLeft}" y="${coverTop + 12}" width="${coverImage.info.width}" height="${coverImage.info.height}" rx="${cornerRadius}"
      fill="#0f172a" opacity="0.18" filter="url(#shadow)"/>
  </svg>`),
  )
    .flatten({ background: "#fafafa" })
    .composite(layers)
    .png()
    .toBuffer()
}
