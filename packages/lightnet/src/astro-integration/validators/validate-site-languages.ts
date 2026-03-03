import { z } from "astro/zod"

type SiteLanguage = {
  code: string
  isDefault?: boolean
}

export const validateSiteLanguages = (
  siteLanguages: SiteLanguage[],
  ctx: z.RefinementCtx,
) => {
  const seen = new Set<string>()
  let defaultCount = 0

  for (const [index, siteLanguage] of siteLanguages.entries()) {
    const { code, isDefault } = siteLanguage

    if (!seen.has(code)) {
      seen.add(code)
    } else {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate site language code "${code}"`,
        path: [index, "code"],
      })
    }

    if (isDefault) {
      defaultCount += 1
    }
  }

  if (defaultCount !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Exactly one site language must define isDefault: true",
    })
  }
}
