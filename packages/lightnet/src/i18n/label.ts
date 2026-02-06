import { z } from "astro/zod"

export const labelSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("fixed"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("translated"),
    key: z.string(),
  }),
])

export type LabelInput = z.input<typeof labelSchema>
export type LabelValue = z.output<typeof labelSchema>

export const fixedLabel = (text: string): LabelValue => ({
  type: "fixed",
  text,
})

export const translatedLabel = (key: string): LabelValue => ({
  type: "translated",
  key,
})

export const isLabelValue = (value: unknown): value is LabelValue => {
  if (!value || typeof value !== "object") {
    return false
  }

  const labelType = (value as { type?: unknown }).type
  if (labelType === "fixed") {
    return "text" in value
  }
  if (labelType === "translated") {
    return "key" in value
  }
  return false
}
