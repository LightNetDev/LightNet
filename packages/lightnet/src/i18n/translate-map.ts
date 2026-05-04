import { AstroError } from "astro/errors"
import config from "virtual:lightnet/config"

import { recordTranslation } from "./record-translation"
import type { CollectionKey } from "astro:content"
import type {
  ExtendedLightnetConfig,
  LightnetConfig,
} from "../astro-integration/config"

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
  /**
   * Describes where a translation map comes from so translation logs
   * can point to the exact field in config or content.
   */
  context: { path: (string | number)[] },
) => string

/**
 * Translate one field inside a content collection entry.
 */
export type TranslateContentFieldFn = (
  translationMap: TranslationMap,
  contentEntry: {
    id: string
    collection: CollectionKey
    data: Record<PropertyKey, unknown>
  },
) => string

/**
 * Translate one field of a LightNet config.
 */
export type TranslateConfigFieldFn = (
  translationMap: TranslationMap,
  config: ExtendedLightnetConfig,
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
export function useTranslateMap(currentLocale: string) {
  const tMap: TranslateMapFn = (translationMap, context) => {
    const resolvedPath = context.path
    const key = resolvedPath.join(".")
    recordTranslation({ key, values: translationMap, type: "map" })

    const currentLocaleValue = translationMap[currentLocale]
    if (currentLocaleValue) {
      return currentLocaleValue
    }

    const defaultLocaleValue = translationMap[config.defaultLocale]
    if (defaultLocaleValue) {
      return defaultLocaleValue
    }

    const availableLocales = Object.keys(translationMap).filter(
      (key) => key !== "path",
    )
    const availableLocalesText = availableLocales.length
      ? availableLocales.map((locale) => `"${locale}"`).join(", ")
      : "none"

    throw new AstroError(
      `Missing translation map value for "${key}" in locales "${currentLocale}" and "${config.defaultLocale}"`,
      `Available locales: ${availableLocalesText}. Add a value for "${currentLocale}" or "${config.defaultLocale}" to this inline translation map.`,
    )
  }

  const tContentField: TranslateContentFieldFn = (
    translationMap,
    contentEntry,
  ) => {
    // todo append path to property
    const path = ["content", contentEntry.collection, contentEntry.id]
    return tMap(translationMap, { path })
  }

  const tConfigField: TranslateConfigFieldFn = (translationMap, config) => {
    // todo append path to property
    return tMap(translationMap, { path: ["config"] })
  }

  return { tMap, tContentField, tConfigField }
}
