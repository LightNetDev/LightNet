import { z } from "astro/zod"

/**
 * Translations by BCP-47 tag
 * Must contain at least one localized value.
 *
 * @example
 * {
 *    de: "Hallo",
 *    en: "Hello"
 * }
 */
export const inlineTranslationSchema = z
  .record(z.string(), z.string())
  .refine((value) => Object.keys(value).length > 0, {
    message: "Inline translations must contain at least one entry",
  })
