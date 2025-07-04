import { type ImageFunction, z } from "astro:content"

/**
 * We use this function to make sure decap's relative paths will resolve correctly
 * with astro content.
 *
 * @param image astro content image function
 * @returns image property
 */
export const astroImage = (image: ImageFunction) =>
  z
    .string()
    .transform((path) => (path.startsWith("./") ? path : `./${path}`))
    .pipe(image())

/**
 * The Astro image function resolves to this schema.
 */
export const imageSchema = z.object({
  src: z.string(),
  width: z.number(),
  height: z.number(),
  format: z.enum(["png", "jpg", "jpeg", "tiff", "webp", "gif", "svg", "avif"]),
})
