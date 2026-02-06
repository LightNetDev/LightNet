import { z } from "astro/zod"

export const labelSchema = z.object({
  type: z.enum(["fixed", "translated"]),
  value: z.string(),
})

export type LabelInput = z.input<typeof labelSchema>
export type LabelValue = z.output<typeof labelSchema>

export const fixedLabel = (value: string): LabelValue => ({
  type: "fixed",
  value,
})

export const translatedLabel = (value: string): LabelValue => ({
  type: "translated",
  value,
})

export const isLabelValue = (value: unknown): value is LabelValue => {
  if (!value || typeof value !== "object") {
    return false
  }

  if (!("type" in value) || !("value" in value)) {
    return false
  }

  const labelType = (value as { type?: unknown }).type
  return labelType === "fixed" || labelType === "translated"
}
