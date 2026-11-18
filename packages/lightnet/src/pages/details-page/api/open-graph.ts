import type { APIRoute, GetStaticPaths } from "astro"
import { cacheDir } from "astro:config/server"
import { getCollection } from "astro:content"
import config from "virtual:lightnet/config"

import { getMediaItem } from "../../../content/get-media-items"
import { getMediaType } from "../../../content/get-media-types"
import { resolveLanguage } from "../../../i18n/resolve-language"
import { getCachedOpenGraphImage } from "../utils/get-cached-open-graph-image"
import { getMediaCover } from "../utils/get-media-cover"

export const getStaticPaths: GetStaticPaths = async () => {
  const items = await getCollection("media")
  return items.map(({ id: mediaId }) => ({
    params: { locale: config.defaultLocale, mediaId },
  }))
}

export const GET: APIRoute = async ({ params }) => {
  const item = await getMediaItem(params.mediaId!)
  const mediaType = await getMediaType(item.data.type.id)
  const { direction } = resolveLanguage(item.data.language)
  const png = await getCachedOpenGraphImage(
    {
      cover: await getMediaCover(item.id),
      coverImageStyle: mediaType.data.coverImageStyle,
      title: item.data.title,
      authors: item.data.authors,
      direction,
    },
    new URL(cacheDir),
  )
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  })
}
