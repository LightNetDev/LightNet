import { z } from "astro/zod"

/**
 * The Astro image function resolves to this schema.
 */
export const imageSchema = z.object({
  src: z.string(),
  width: z.number(),
  height: z.number(),
  format: z.enum(["png", "jpg", "jpeg", "tiff", "webp", "gif", "svg", "avif"]),
})
