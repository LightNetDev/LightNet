import { z } from "astro/zod"

export const validateInlineTranslations = (
  config: {
    title: Record<string, string>
    mainMenu?: { label: Record<string, string> }[]
    logo?: { alt?: Record<string, string> }
  },
  locales: string[],
  defaultLocale: string,
  ctx: z.RefinementCtx,
) => {
  const validateInlineTranslation = (
    inlineTranslation: Record<string, string> | undefined,
    path: (string | number)[],
  ) => {
    if (!inlineTranslation) {
      return
    }

    if (!(defaultLocale in inlineTranslation)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Missing translation for default locale "${defaultLocale}"`,
        path: [...path, defaultLocale],
      })
    }

    for (const locale of Object.keys(inlineTranslation)) {
      if (locales.includes(locale)) {
        continue
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid locale "${locale}". Inline translations only support configured site locales: ${locales.join(", ")}`,
        path: [...path, locale],
      })
    }
  }

  validateInlineTranslation(config.title, ["title"])
  for (const [index, link] of (config.mainMenu ?? []).entries()) {
    validateInlineTranslation(link.label, ["mainMenu", index, "label"])
  }
  validateInlineTranslation(config.logo?.alt, ["logo", "alt"])
}
