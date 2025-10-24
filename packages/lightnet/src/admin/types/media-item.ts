import { z } from "astro/zod"

export const mediaItemSchema = z.object({
  title: z.string()
})

export type MediaItem = { title: string }

