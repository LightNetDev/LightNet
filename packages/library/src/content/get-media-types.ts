import { getCollection, getEntry } from "astro:content";

import { verifySchema } from "../utils/verify-schema";

import { mediaTypeEntrySchema } from "./content-schema";

export const getMediaType = async (id: string) => {
  return verifySchema(
    mediaTypeEntrySchema,
    await getEntry("media-types", id),
    `Received invalid media type ${id}.`,
  );
};

export const getMediaTypes = async () => {
  const mediaTypes: unknown[] = await getCollection("media-types");
  return mediaTypes.map((type: unknown) =>
    verifySchema(
      mediaTypeEntrySchema,
      type,
      (id) => `Received invalid media type '${id}'.`,
    ),
  );
};
