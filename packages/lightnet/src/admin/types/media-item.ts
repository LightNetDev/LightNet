import { z } from "astro/zod"

const NON_EMPTY_STRING = "ln.admin.errors.non-empty-string"
const INVALID_DATE = "ln.admin.errors.invalid-date"
const REQUIRED = "ln.admin.errors.required"

export const mediaItemSchema = z.object({
  commonId: z.string().nonempty(NON_EMPTY_STRING),
  title: z.string().nonempty(NON_EMPTY_STRING),
  type: z.string().nonempty(REQUIRED),
  language: z.string().nonempty(REQUIRED),
  authors: z.string().nonempty(NON_EMPTY_STRING).array().optional(),
  dateCreated: z.string().date(INVALID_DATE),
})

export type MediaItem = z.infer<typeof mediaItemSchema>
