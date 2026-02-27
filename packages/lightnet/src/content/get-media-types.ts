import { AstroError } from "astro/errors"
import { getCollection } from "astro:content"

import type { TranslateFn } from "../i18n/translate"
import { verifySchema } from "../utils/verify-schema"
import { mediaTypeEntrySchema } from "./content-schema"
import { getMediaItems } from "./get-media-items"

const typesById = Object.fromEntries(
  (await loadTypes()).map((type) => [type.id, type]),
)

const contentTypes = new Set(
  (await getMediaItems()).map((item) => item.data.type.id),
)

export const getMediaType = async (id: string) => {
  const type = typesById[id]
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
  t: TranslateFn,
) => {
  return Array.from(contentTypes, (typeId) => typesById[typeId])
    .map(({ id, data }) => ({ id, ...data, labelText: t(data.label) }))
    .sort((a, b) => a.labelText.localeCompare(b.labelText, currentLocale))
}

export const getMediaTypes = async () => {
  return Object.values(typesById)
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
