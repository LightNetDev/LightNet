import { AstroError } from "astro/errors"
import config from "virtual:lightnet/config"

/**
 * A map of translated values keyed by locale code.
 *
 * @example
 * {
 *   en: "Hello",
 *   de: "Hallo"
 * }
 */
export type TranslationMap = Record<string, string | undefined>

/**
 * Describes where a translation map comes from so missing-value
 * errors can point to the exact field in config or content.
 */
export type TranslationMapContext = {
  path: (string | number)[]
}

/**
 * Resolve a translation map for the current locale, falling back
 * to configured default locale when needed.
 *
 * @param translationMap Localized values keyed by locale code.
 * @param context Describes where this map came from in config or content.
 * The `path` is required so missing-translation errors can name the exact
 * field that needs fixing, for example `["config", "title"]` or
 * `["content", 0, "label"]`.
 */
export type TranslateMapFn = (
  translationMap: TranslationMap,
  context: TranslationMapContext,
) => string

/**
 * Create a locale-bound translation-map resolver.
 *
 * Use this for values that already contain their own translations,
 * such as labels in config or content frontmatter. In contrast to `t`,
 * this does not look up translation keys in translation files.
 *
 * @param currentLocale The locale that should be resolved first before
 * falling back to LightNet's configured default locale.
 */
export function useTranslateMap(currentLocale: string): TranslateMapFn {
  return (translationMap: TranslationMap, context: TranslationMapContext) => {
    const currentLocaleValue = translationMap[currentLocale]
    if (currentLocaleValue) {
      return currentLocaleValue
    }

    const defaultLocaleValue = translationMap[config.defaultLocale]
    if (defaultLocaleValue) {
      return defaultLocaleValue
    }

    const availableLocales = Object.keys(translationMap)
    const availableLocalesText = availableLocales.length
      ? availableLocales.map((locale) => `"${locale}"`).join(", ")
      : "none"

    throw new AstroError(
      `Missing translation map value for "${context.path.join(".")}" in locales "${currentLocale}" and "${config.defaultLocale}"`,
      `Available locales: ${availableLocalesText}. Add a value for "${currentLocale}" or "${config.defaultLocale}" to this inline translation map.`,
    )
  }
}
