import type { MediaItemEntry } from "../../../content/schema/media-item"
import type { MediaTypeEntry } from "../../../content/schema/media-type"
import { markdownToText } from "../../../utils/markdown"
import { createContentMetadata } from "./create-content-metadata"

const FILE_FORMATS: Record<string, { type: string; mime: string }> = {
  mp3: { type: "AudioObject", mime: "audio/mpeg" },
  wav: { type: "AudioObject", mime: "audio/wav" },
  aac: { type: "AudioObject", mime: "audio/aac" },
  ogg: { type: "AudioObject", mime: "audio/ogg" },
  mp4: { type: "VideoObject", mime: "video/mp4" },
  webm: { type: "VideoObject", mime: "video/webm" },
  ogv: { type: "VideoObject", mime: "video/ogg" },
  jpg: { type: "ImageObject", mime: "image/jpeg" },
  jpeg: { type: "ImageObject", mime: "image/jpeg" },
  png: { type: "ImageObject", mime: "image/png" },
  gif: { type: "ImageObject", mime: "image/gif" },
  webp: { type: "ImageObject", mime: "image/webp" },
  avif: { type: "ImageObject", mime: "image/avif" },
  svg: { type: "ImageObject", mime: "image/svg+xml" },
  pdf: { type: "MediaObject", mime: "application/pdf" },
  epub: { type: "MediaObject", mime: "application/epub+zip" },
  txt: { type: "MediaObject", mime: "text/plain" },
}

export type DetailsPageLayout = "default" | "audio" | "video"

export function createMediaItemJsonLd({
  item,
  layout,
  schemaType,
  canonicalUrl,
  imageUrl,
  categoryNames = [],
  contentLabels = [],
}: {
  item: MediaItemEntry["data"]
  layout: DetailsPageLayout
  schemaType?: MediaTypeEntry["data"]["schemaType"]
  canonicalUrl: URL
  imageUrl: string
  categoryNames?: string[]
  contentLabels?: (string | undefined)[]
}): Record<string, unknown> {
  const base = {
    "@context": "https://schema.org",
    "@type": schemaType ?? "CreativeWork",
    "@id": `${canonicalUrl.href}#work`,
    url: canonicalUrl.href,
    name: item.title,
    description: markdownToText(item.description) || undefined,
    image: imageUrl,
    inLanguage: item.language,
    // Author names can refer to people or organizations; the model does not distinguish them.
    author: item.authors?.length
      ? item.authors.map((name) => ({ name }))
      : undefined,
    about: categoryNames.length
      ? categoryNames.map((name) => ({ "@type": "Thing", name }))
      : undefined,
  }

  const media = item.content.map(({ url }, index) => {
    let resolvedUrl: URL
    try {
      resolvedUrl = new URL(url, canonicalUrl)
    } catch {
      return undefined
    }
    if (!["http:", "https:"].includes(resolvedUrl.protocol)) {
      return undefined
    }

    const metadata = createContentMetadata({
      url: resolvedUrl.href,
      labelText: contentLabels[index],
    })
    const format = FILE_FORMATS[metadata.extension]
    const embedUrl = getVideoEmbedUrl(resolvedUrl)
    if (!format && !embedUrl) {
      return undefined
    }

    return {
      "@type": embedUrl ? "VideoObject" : format.type,
      name: metadata.labelText,
      inLanguage: item.language,
      ...(embedUrl
        ? { embedUrl }
        : { contentUrl: resolvedUrl.href, encodingFormat: format.mime }),
    }
  })

  const encodings = media.filter((entry) => entry !== undefined)
  if (
    schemaType === "AudioObject" ||
    schemaType === "VideoObject" ||
    schemaType === "ImageObject"
  ) {
    const matching = encodings.filter((entry) => entry["@type"] === schemaType)
    if (schemaType === "AudioObject" && matching.length > 1) {
      return {
        ...base,
        hasPart: matching,
        encoding: encodings.filter((entry) => entry["@type"] !== schemaType),
      }
    }
    const primary = media[0]?.["@type"] === schemaType ? media[0] : undefined
    const alternatives = encodings.filter((entry) => entry !== primary)
    return {
      ...primary,
      ...base,
      ...(schemaType === "VideoObject" ? { thumbnailUrl: imageUrl } : {}),
      encoding: alternatives.length ? alternatives : undefined,
    }
  }

  if (
    !schemaType &&
    layout === "video" &&
    media[0]?.["@type"] === "VideoObject"
  ) {
    return {
      ...media[0],
      ...base,
      "@type": "VideoObject",
      thumbnailUrl: imageUrl,
    }
  }

  if (layout === "audio") {
    const tracks = encodings.filter((entry) => entry["@type"] === "AudioObject")
    if (!schemaType && tracks.length === 1 && item.content.length === 1) {
      return { ...tracks[0], ...base, "@type": "AudioObject" }
    }
    if (tracks.length && item.content.length > 1) {
      return {
        ...base,
        hasPart: tracks,
        encoding: encodings.filter((entry) => entry["@type"] !== "AudioObject"),
      }
    }
  }

  return { ...base, encoding: encodings.length ? encodings : undefined }
}

function getVideoEmbedUrl(url: URL) {
  if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
    const id = url.pathname.startsWith("/embed/")
      ? url.pathname.slice(7)
      : url.pathname === "/watch"
        ? url.searchParams.get("v")
        : undefined
    if (id) return `https://www.youtube-nocookie.com/embed/${id}`
  }
  if (url.hostname === "youtu.be" && url.pathname.slice(1)) {
    return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`
  }
  if (
    url.hostname === "www.youtube-nocookie.com" &&
    url.pathname.startsWith("/embed/") &&
    url.pathname.slice(7)
  ) {
    return `https://www.youtube-nocookie.com${url.pathname}`
  }
  if (url.hostname === "vimeo.com" && /^\/\d+\/?$/.test(url.pathname)) {
    return `https://player.vimeo.com/video/${url.pathname.split("/")[1]}`
  }
  if (
    url.hostname === "player.vimeo.com" &&
    /^\/video\/\d+\/?$/.test(url.pathname)
  ) {
    return url.href
  }
}
