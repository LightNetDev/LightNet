import { type RefinementCtx, z } from "astro/zod"

const NON_EMPTY_STRING = "ln.admin.errors.non-empty-string"
const INVALID_DATE = "ln.admin.errors.invalid-date"
const REQUIRED = "ln.admin.errors.required"
const GTE_0 = "ln.admin.errors.gte-0"
const INTEGER = "ln.admin.errors.integer"
const UNIQUE_ELEMENTS = "ln.admin.errors.unique-elements"

const unique = <TArrayItem>(path: Extract<keyof TArrayItem, string>) => {
  return (values: TArrayItem[], ctx: RefinementCtx) => {
    const seenValues = new Set<unknown>()
    values.forEach((value, index) => {
      if (seenValues.has(value[path])) {
        ctx.addIssue({
          path: [index, path],
          message: UNIQUE_ELEMENTS,
          code: "custom",
        })
      }
      seenValues.add(value[path])
    })
  }
}

export const mediaItemSchema = z.object({
  commonId: z.string().nonempty(NON_EMPTY_STRING),
  title: z.string().nonempty(NON_EMPTY_STRING),
  type: z.string().nonempty(REQUIRED),
  language: z.string().nonempty(REQUIRED),
  authors: z
    .object({ value: z.string().nonempty(NON_EMPTY_STRING) })
    .array()
    .superRefine(unique("value")),
  categories: z
    .object({
      value: z.string().nonempty(REQUIRED),
    })
    .array()
    .superRefine(unique("value")),
  collections: z
    .object({
      collection: z.string().nonempty(REQUIRED),
      index: z.number().int(INTEGER).gte(0, GTE_0).optional(),
    })
    .array()
    .superRefine(unique("collection")),
  dateCreated: z.string().date(INVALID_DATE),
})

export type MediaItem = z.input<typeof mediaItemSchema>
