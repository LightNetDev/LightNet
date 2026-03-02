import { z } from "astro/zod"

export const validateSiteLanguages = (
  siteLanguages: string[],
  ctx: z.RefinementCtx,
) => {
  const seen = new Set<string>()
  for (const [index, code] of siteLanguages.entries()) {
    if (!seen.has(code)) {
      seen.add(code)
      continue
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Duplicate site language code "${code}"`,
      path: [index],
    })
  }
}

export const validateFallbackLanguages = (
  fallbackLanguages: Record<string, string[]>,
  siteLanguagesArray: string[],
  ctx: z.RefinementCtx,
) => {
  const siteLanguages = new Set(siteLanguagesArray)
  for (const sourceLanguage of Object.keys(fallbackLanguages)) {
    if (!siteLanguages.has(sourceLanguage)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `fallbackLanguages key "${sourceLanguage}" must be included in siteLanguages`,
        path: ["fallbackLanguages", sourceLanguage],
      })
    }
  }
}
