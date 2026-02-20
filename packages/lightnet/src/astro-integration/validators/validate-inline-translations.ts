import { z } from "astro/zod"

export const validateInlineTranslations = (
  config: {
    title: Record<string, string>
    languages: { label: Record<string, string> }[]
    mainMenu?: { label: Record<string, string> }[]
    logo?: { alt?: Record<string, string> }
  },
  locales: string[],
  ctx: z.RefinementCtx,
) => {
  const validateInlineTranslation = (
    inlineTranslation: Record<string, string> | undefined,
    path: (string | number)[],
  ) => {
    if (!inlineTranslation) {
      return
    }

    for (const locale of locales) {
      if (locale in inlineTranslation) {
        continue
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Missing translation for locale "${locale}"`,
        path: [...path, locale],
      })
    }
  }

  validateInlineTranslation(config.title, ["title"])
  for (const [index, language] of config.languages.entries()) {
    validateInlineTranslation(language.label, ["languages", index, "label"])
  }
  for (const [index, link] of (config.mainMenu ?? []).entries()) {
    validateInlineTranslation(link.label, ["mainMenu", index, "label"])
  }
  validateInlineTranslation(config.logo?.alt, ["logo", "alt"])
}
