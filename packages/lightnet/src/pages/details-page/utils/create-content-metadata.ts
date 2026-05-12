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
  { type: UrlType; isDownload?: boolean } | undefined
> = {
  htm: { type: "link" },
  html: { type: "link" },
  php: { type: "link" },
  json: { type: "source" },
  xml: { type: "source" },
  md: { type: "source" },
  svg: { type: "image" },
  jpg: { type: "image" },
  jpeg: { type: "image" },
  png: { type: "image" },
  gif: { type: "image" },
  ico: { type: "image" },
  webp: { type: "image" },
  mp3: { type: "audio" },
  wav: { type: "audio" },
  aac: { type: "audio" },
  ogg: { type: "audio" },
  mp4: { type: "video" },
  webm: { type: "video" },
  ogv: { type: "video" },
  pdf: { type: "text" },
  txt: { type: "text" },
  epub: { type: "text", isDownload: true },
  zip: { type: "package", isDownload: true },
  ppt: { type: "text", isDownload: true },
  pptx: { type: "text", isDownload: true },
  doc: { type: "text", isDownload: true },
  docx: { type: "text", isDownload: true },
} as const

export function createContentMetadata({
  url,
  labelText: customLabel,
}: {
  url: string
  labelText?: string
}) {
  const isExternal = isExternalUrl(url)
  const path = isExternal ? new URL(url).pathname : url

  const lastPathSegment = path.split("/").slice(-1)[0]
  const hasExtension = lastPathSegment.includes(".")
  const extension = hasExtension
    ? lastPathSegment.split(".").slice(-1)[0].toLowerCase()
    : ""

  const linkName = isExternal ? new URL(url).hostname : lastPathSegment
  const fileName = hasExtension
    ? lastPathSegment.slice(0, -(extension.length + 1))
    : undefined

  const labelText = customLabel ?? fileName ?? linkName
  const type = KNOWN_EXTENSIONS[extension]?.type ?? "link"
  const isDownload = KNOWN_EXTENSIONS[extension]?.isDownload

  return {
    url,
    extension,
    isExternal,
    labelText,
    isDownload,
    type,
    target: isExternal ? "_blank" : "_self",
  } as const
}
