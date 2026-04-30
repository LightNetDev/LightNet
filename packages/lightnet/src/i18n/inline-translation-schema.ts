import { z } from "astro/zod"

import { setTranslationProvenance } from "./translation-provenance"

export const inlineTranslationSchema = z
  .record(z.string(), z.string())
  .refine((value) => Object.keys(value).length > 0, {
    message: "Inline translations must contain at least one entry",
  })
  .transform((value) => setTranslationProvenance(value, {}))
