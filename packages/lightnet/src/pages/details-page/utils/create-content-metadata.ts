import { isExternalUrl } from "../../../utils/urls"

export type UrlType =
  | "link"
  | "source"
  | "image"
  | "audio"
  | "video"
  | "text"
  | "package"

const KNOWN_EXTENSIONS: Record<
  string,
  { type: UrlType; canBeOpened?: boolean } | undefined
> = {
  htm: { type: "link", canBeOpened: true },
  html: { type: "link", canBeOpened: true },
  php: { type: "link", canBeOpened: true },
  json: { type: "source", canBeOpened: true },
  xml: { type: "source", canBeOpened: true },
  svg: { type: "image", canBeOpened: true },
  jpg: { type: "image", canBeOpened: true },
  jpeg: { type: "image", canBeOpened: true },
  png: { type: "image", canBeOpened: true },
  gif: { type: "image", canBeOpened: true },
  ico: { type: "image", canBeOpened: true },
  webp: { type: "image", canBeOpened: true },
  mp3: { type: "audio", canBeOpened: true },
  wav: { type: "audio", canBeOpened: true },
  aac: { type: "audio", canBeOpened: true },
  ogg: { type: "audio", canBeOpened: true },
  mp4: { type: "video", canBeOpened: true },
  webm: { type: "video", canBeOpened: true },
  ogv: { type: "video", canBeOpened: true },
  pdf: { type: "text", canBeOpened: true },
  txt: { type: "text", canBeOpened: true },
  epub: { type: "text" },
  zip: { type: "package" },
  ppt: { type: "text" },
  pptx: { type: "text" },
  doc: { type: "text" },
  docx: { type: "text" },
} as const

export function createContentMetadata({
  url,
  label: customLabel,
}: {
  url: string
  label?: string
}) {
  const lastUrlSegment = url.split("/").slice(-1)[0]
  const hasExtension = lastUrlSegment.includes(".")
  const extension = hasExtension
    ? lastUrlSegment.split(".").slice(-1)[0].toLowerCase()
    : ""

  const isExternal = isExternalUrl(url)

  const linkName = isExternal ? new URL(url).hostname : lastUrlSegment
  const fileName = hasExtension
    ? lastUrlSegment.slice(0, -(extension.length + 1))
    : undefined
  const label = customLabel ?? fileName ?? linkName
  const type = KNOWN_EXTENSIONS[extension]?.type ?? "link"
  const canBeOpened =
    !hasExtension || !!KNOWN_EXTENSIONS[extension]?.canBeOpened

  return {
    url,
    extension,
    isExternal,
    label,
    canBeOpened,
    type,
    target: isExternal ? "_blank" : "_self",
  } as const
}
