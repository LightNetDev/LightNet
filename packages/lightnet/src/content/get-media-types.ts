import { AstroError } from "astro/errors"
import { getCollection } from "astro:content"

import type { TranslateMapFn } from "../i18n/translate-map"
import { lazy } from "../utils/lazy"
import { verifySchema } from "../utils/verify-schema"
import { getMediaItems } from "./get-media-items"
import { mediaTypeEntrySchema } from "./schema/media-type"

const typesById = lazy(async () =>
  Object.fromEntries((await loadTypes()).map((type) => [type.id, type])),
)

const contentTypesLoader = lazy(
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

export async function getUsedMediaTypes(
  currentLocale: string,
  tMap: TranslateMapFn,
) {
  const contentTypes = await contentTypesLoader.get()
  const mediaTypes = await getTranslatedMediaTypes(currentLocale, tMap)
  return mediaTypes.filter(({ id }) => contentTypes.has(id))
}

export async function getTranslatedMediaTypes(
  currentLocale: string,
  tMap: TranslateMapFn,
) {
  const mediaTypes = Object.values(await typesById.get())
  return mediaTypes
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
