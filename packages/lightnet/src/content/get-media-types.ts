import { AstroError } from "astro/errors"
import { getCollection } from "astro:content"

import type { TranslateMapFn } from "../i18n/translate-map"
import { lazy } from "../utils/lazy"
import { verifySchema } from "../utils/verify-schema"
import { mediaTypeEntrySchema } from "./content-schema"
import { getMediaItems } from "./get-media-items"

const typesById = lazy(async () =>
  Object.fromEntries((await loadTypes()).map((type) => [type.id, type])),
)

const contentTypes = lazy(
  async () => new Set((await getMediaItems()).map((item) => item.data.type.id)),
)

export const getMediaType = async (id: string) => {
  const type = (await typesById.get())[id]
  if (!type) {
    throw new AstroError(
      `No media type found for id ${id}`,
      `Fix this by adding a media type definition at "src/content/media-types/${id}.json"`,
    )
  }
  return type
}

export const getUsedMediaTypes = async (
  currentLocale: string,
  tMap: TranslateMapFn,
) => {
  const byId = await typesById.get()
  return Array.from(await contentTypes.get(), (typeId) => byId[typeId])
    .map(({ id, data }) => ({
      id,
      ...data,
      labelText: tMap(data.label, {
        path: ["media-types", id, "label"],
      }),
    }))
    .sort((a, b) => a.labelText.localeCompare(b.labelText, currentLocale))
}

export const getMediaTypes = async () => {
  return Object.values(await typesById.get())
}

async function loadTypes() {
  const mediaTypes: unknown[] = await getCollection("media-types")
  return mediaTypes.map((type: unknown) =>
    verifySchema(
      mediaTypeEntrySchema,
      type,
      (id) => `Invalid media type: "${id}"`,
      (id) => `Fix these issues inside "src/content/media-types/${id}.json":`,
    ),
  )
}
