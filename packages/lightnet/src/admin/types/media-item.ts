import { z } from "astro/zod"

const NON_EMPTY_STRING = "ln.admin.errors.non-empty-string"
const INVALID_DATE = "ln.admin.errors.invalid-date"
const REQUIRED = "ln.admin.errors.required"
const GTE_0 = "ln.admin.errors.gte-0"

export const mediaItemSchema = z.object({
  commonId: z.string().nonempty(NON_EMPTY_STRING),
  title: z.string().nonempty(NON_EMPTY_STRING),
  type: z.string().nonempty(REQUIRED),
  language: z.string().nonempty(REQUIRED),
  authors: z.object({ value: z.string().nonempty(NON_EMPTY_STRING) }).array(),
  categories: z.object({ value: z.string().nonempty(REQUIRED) }).array(),
  collections: z
    .object({
      collection: z.string().nonempty(REQUIRED),
      index: z.number().gte(0, GTE_0).optional(),
    })
    .array(),
  dateCreated: z.string().date(INVALID_DATE),
})

export type MediaItem = z.input<typeof mediaItemSchema>
