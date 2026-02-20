import { z } from "astro/zod"

export const validateUniqueLanguageCodes = (
  languages: { code: string }[],
  ctx: z.RefinementCtx,
) => {
  const seen = new Set<string>()
  for (const [index, language] of languages.entries()) {
    if (seen.has(language.code)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate language code "${language.code}"`,
        path: [index, "code"],
      })
      continue
    }
    seen.add(language.code)
  }
}
