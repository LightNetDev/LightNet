import { z } from "astro/zod"

export const mediaItemSchema = z.object({
  commonId: z.string().nonempty(),
  title: z.string().nonempty(),
})

export type MediaItem = z.infer<typeof mediaItemSchema>
