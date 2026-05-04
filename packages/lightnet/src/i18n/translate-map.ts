import { AstroError } from "astro/errors"
import type { CollectionKey } from "astro:content"
import config from "virtual:lightnet/config"

import type { ExtendedLightnetConfig } from "../astro-integration/config"
import { recordTranslation } from "./record-translation"

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
 * Resolve an inline translation map that belongs to a content entry.
 *
 * The entry is only used to provide a stable fallback path when translation-map
 * metadata is missing during the current refactor.
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
 * Resolve an inline translation map that belongs to the LightNet config.
 *
 * The config object is only used to keep the API explicit and to provide a
 * stable fallback path when translation-map metadata is missing.
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
    const getKey = () => {
      const keyCacheSymbol = Symbol.for("ln.key-cache")
      if (hasOwnProperty(translationMap, keyCacheSymbol)) {
        return translationMap[keyCacheSymbol] as string
      }
      const value = context.path.join(".")
      Object.defineProperty(translationMap, keyCacheSymbol, { value })
      return value
    }
    const key = getKey()
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
    return tMap(translationMap, {
      path: getMapPath(translationMap, contentEntry.data, [
        "content",
        contentEntry.collection,
        contentEntry.id,
      ]),
    })
  }

  const tConfigField: TranslateConfigFieldFn = (translationMap, _config) => {
    return tMap(translationMap, {
      path: getMapPath(translationMap, config, ["config"]),
    })
  }

  return { tMap, tContentField, tConfigField }
}

function getMapPath(
  translationMap: TranslationMap,
  data: unknown,
  path: string[],
) {
  const pathCacheSymbol = Symbol.for("ln.path-cache")

  if (hasOwnProperty(translationMap, pathCacheSymbol)) {
    return translationMap[pathCacheSymbol] as string[]
  }

  const findPath: (_data: unknown, _path: string[]) => string[] | undefined = (
    _data,
    _path,
  ) => {
    if (!_data || typeof _data !== "object") {
      return
    }
    if (equalsTranslationMap(translationMap, _data)) {
      return _path
    }
    for (const [key, value] of Object.entries(_data)) {
      const p = findPath(value, [..._path, key])
      if (p) {
        return p as string[]
      }
    }
  }

  const resolvedPath = findPath(data, path)
  if (!resolvedPath) {
    throw new AstroError(
      `Invalid map context provided ${path} for could not find path for object ${JSON.stringify(translationMap)}`,
      `Provided object ${JSON.stringify(data)}`,
    )
  }
  Object.defineProperty(translationMap, pathCacheSymbol, {
    value: resolvedPath,
  })
  return resolvedPath
}

function equalsTranslationMap(
  translationMap: TranslationMap,
  toCompare: unknown,
) {
  if (!toCompare || typeof toCompare !== "object" || Array.isArray(toCompare)) {
    return false
  }
  const keysA = Object.keys(translationMap)
  const keysB = Object.keys(toCompare)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (const key of keysA) {
    if (!hasOwnProperty(toCompare, key)) {
      return false
    }
    if (translationMap[key] !== toCompare[key]) {
      return false
    }
  }
  return true
}

function hasOwnProperty<K extends PropertyKey>(
  obj: unknown,
  key: K,
): obj is Record<K, unknown> {
  return !!obj && typeof obj === "object" && Object.hasOwn(obj, key)
}
