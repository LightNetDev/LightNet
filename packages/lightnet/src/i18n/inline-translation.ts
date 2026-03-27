import { AstroError } from "astro/errors"
import config from "virtual:lightnet/config"

export type InlineTranslation = Record<string, string | undefined>
export type InlineTranslationContext = {
  path: (string | number)[]
}

export type InlineTranslateFn = (
  translationMap: InlineTranslation,
  context: InlineTranslationContext,
) => string

export function useInlineTranslate(currentLocale: string): InlineTranslateFn {
  return (
    inlineTranslation: InlineTranslation,
    context: InlineTranslationContext,
  ) => {
    const currentLocaleValue = inlineTranslation[currentLocale]
    if (currentLocaleValue) {
      return currentLocaleValue
    }

    const defaultLocaleValue = inlineTranslation[config.defaultLocale]
    if (defaultLocaleValue) {
      return defaultLocaleValue
    }

    const availableLocales = Object.keys(inlineTranslation)
    const availableLocalesText = availableLocales.length
      ? availableLocales.map((locale) => `"${locale}"`).join(", ")
      : "none"

    throw new AstroError(
      `Missing inline translation for "${context.path.join(".")}" in locales "${currentLocale}" and "${config.defaultLocale}"`,
      `Available locales: ${availableLocalesText}. Add a value for "${currentLocale}" or "${config.defaultLocale}" to this inline translation map.`,
    )
  }
}
