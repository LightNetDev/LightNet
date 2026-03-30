import { z } from "astro/zod"

type Language = {
  code: string
  isDefaultSiteLanguage?: boolean
}

export const validateLanguages = (
  languages: Language[],
  ctx: z.RefinementCtx,
) => {
  const seen = new Set<string>()
  let defaultCount = 0

  for (const [index, language] of languages.entries()) {
    const { code, isDefaultSiteLanguage } = language

    if (!seen.has(code)) {
      seen.add(code)
    } else {
      ctx.addIssue({
        code: "custom",
        message: `Duplicate language code "${code}"`,
        path: [index, "code"],
      })
    }

    if (isDefaultSiteLanguage) {
      defaultCount += 1
    }
  }

  if (defaultCount !== 1) {
    ctx.addIssue({
      code: "custom",
      message: "Exactly one language must define isDefaultSiteLanguage: true",
    })
  }
}
