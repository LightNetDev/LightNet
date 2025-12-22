import { type RefinementCtx, z } from "astro/zod"
import config from "virtual:lightnet/config"

const NON_EMPTY_STRING = "ln.admin.errors.non-empty-string"
const INVALID_DATE = "ln.admin.errors.invalid-date"
const REQUIRED = "ln.admin.errors.required"
const GTE_0 = "ln.admin.errors.gte-0"
const INTEGER = "ln.admin.errors.integer"
const UNIQUE_ELEMENTS = "ln.admin.errors.unique-elements"
const FILE_SIZE_EXCEEDED = "ln.admin.error.file-size-exceeded"
const NON_EMPTY_LIST = "ln.admin.errors.non-empty-list"

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

const fileShape = z
  .instanceof(File)
  .optional()
  .refine(
    (file) =>
      !file ||
      !!(
        file.size <
        (config.experimental?.admin?.maxFileSize ?? 0) * 1024 * 1024
      ),
    { message: FILE_SIZE_EXCEEDED },
  )

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
  description: z.string().optional(),
  image: z.object({
    path: z.string().nonempty(NON_EMPTY_STRING),
    previewSrc: z.string(),
    file: fileShape,
  }),
  content: z
    .object({
      url: z.string().nonempty(NON_EMPTY_STRING),
      file: fileShape,
      label: z.string().optional(),
    })
    .array()
    .min(1, NON_EMPTY_LIST),
})

export type MediaItem = z.input<typeof mediaItemSchema>
