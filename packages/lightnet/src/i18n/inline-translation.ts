import { AstroError } from "astro/errors"
import { z } from "astro/zod"
import config from "virtual:lightnet/config"

export const inlineTranslationSchema = z.object(
  Object.fromEntries(
    config.locales.map((locale) => [locale, z.string().nonempty()]),
  ),
)
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
