import { z } from "astro/zod"
import { attachMarker } from "./translation-map-metadata"

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
export const translationMapSchema = z.record(z.string(), z.string().nonempty())
