import { z } from "astro/zod"

const NON_EMPTY_STRING = "ln.admin.errors.non-empty-string"

export const mediaItemSchema = z.object({
  commonId: z.string().nonempty(NON_EMPTY_STRING),
  title: z.string().nonempty(NON_EMPTY_STRING),
})

export type MediaItem = z.infer<typeof mediaItemSchema>
