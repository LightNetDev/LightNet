import type { APIRoute } from "astro"
import { getImage } from "astro:assets"

import type { MediaItemEntry } from "../../../content/content-schema"
import { getMediaItems } from "../../../content/get-media-items"
import { markdownToText } from "../../../utils/markdown"
import type { SearchItem } from "./search-response"

export const GET: APIRoute = async () => {
  const items = await searchResults()
  return new Response(JSON.stringify({ items }))
}

export async function searchResults() {
  const items: SearchItem[] = []
  for await (const mediaItem of await getMediaItems()) {
    items.push(await createSearchItem(mediaItem))
  }
  return items.sort((a, b) => {
    return 10 * a.type.localeCompare(b.type) + a.title.localeCompare(b.title)
  })
}

async function createSearchItem(mediaItem: MediaItemEntry) {
  const {
    id,
    data: { image, title, authors, categories, language, description, type },
  } = mediaItem
  const {
    src,
    attributes: { width, height },
  } = await getImage({
    src: image,
    format: "webp",
    width: 256,
  })
  return {
    title,
    id,
    type: type.id,
    authors,
    categories: categories?.map(({ id }) => id),
    description: markdownToText(description)?.slice(0, 350),
    language,
    image: { src, width, height },
  }
}
