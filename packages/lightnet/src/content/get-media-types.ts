import { getCollection, getEntry } from "astro:content"

import { verifySchema } from "../utils/verify-schema"
import { mediaTypeEntrySchema } from "./content-schema-internal"

export const getMediaType = async (id: string) => {
  return verifySchema(
    mediaTypeEntrySchema,
    await getEntry("media-types", id),
    (id) => `Invalid media type: "${id}"`,
    (id) => `Fix these issues inside "src/content/media-types/${id}.json":`,
  )
}

export const getMediaTypes = async () => {
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
