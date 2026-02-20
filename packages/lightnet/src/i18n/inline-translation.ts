import { AstroError } from "astro/errors"

export type InlineTranslation = Record<string, string>

export function resolveInlineTranslation(
  inlineTranslation: InlineTranslation,
  currentLocale: string,
): string {
  const value = inlineTranslation[currentLocale]
  if (value) {
    return value
  }

  throw new AstroError(
    `Missing localized translation for locale "${currentLocale}"`,
    `Available translations: ${JSON.stringify(inlineTranslation)}. Add "${currentLocale}" to this inline translation map.`,
  )
}
