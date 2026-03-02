import { AstroError } from "astro/errors"

export type InlineTranslation = Record<string, string | undefined>

export function resolveInlineTranslation(
  inlineTranslation: InlineTranslation,
  currentLocale: string,
  defaultLocale: string,
): string {
  const currentLocaleValue = inlineTranslation[currentLocale]
  if (currentLocaleValue) return currentLocaleValue

  const defaultLocaleValue = inlineTranslation[defaultLocale]
  if (defaultLocaleValue) return defaultLocaleValue

  throw new AstroError(
    `Missing localized translation for locales "${currentLocale}" and "${defaultLocale}"`,
    `Available translations: ${JSON.stringify(inlineTranslation)}. Add "${currentLocale}" or "${defaultLocale}" to this inline translation map.`,
  )
}
