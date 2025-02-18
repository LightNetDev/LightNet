import { AstroError } from "astro/errors"
import config from "virtual:lightnet/config"
import YAML from "yaml"

import { resolveDefaultLocale } from "./resolve-default-locale"
import { resolveLocales } from "./resolve-locales"
import type { LightNetTranslationKey } from "./translations/translation-key"

type TranslationsByLocales = Record<string, Record<string, string>>

// We add (string & NonNullable<unknown>) to preserve typescript autocompletion for known keys
export type TranslationKey =
  | LightNetTranslationKey
  | (string & NonNullable<unknown>)
export type TranslationOptions = { allowFixedStrings?: boolean }

export type TranslateFn = (
  key: TranslationKey,
  options?: TranslationOptions,
) => string

const locales = resolveLocales(config)
const defaultLocale = resolveDefaultLocale(config)

const builtInTranslations = await loadTranslations("/i18n/translations")
const userTranslations = await loadTranslations("/src/translations")

const translationsByLocales = merge(builtInTranslations, userTranslations)

export function useTranslate(locale: string | undefined): TranslateFn {
  const resolvedLocale = locale ?? defaultLocale
  const translations = translationsByLocales[resolvedLocale]
  const fallbackTranslations = translationsByLocales[defaultLocale]
  if (!translations) {
    throw new AstroError(
      `No translations found for language ${resolvedLocale}`,
      "Add them to your project's src/translations folder",
    )
  }
  return (key: TranslationKey, options?: TranslationOptions) => {
    const value = translations[key] ?? fallbackTranslations[key]
    const isTranslationKey = key.startsWith("custom.") || key.startsWith("ln.")
    if (!value && options?.allowFixedStrings && !isTranslationKey) {
      return key
    }
    if (!value) {
      throw new AstroError(
        `Missing translation: '${key}' is undefined for language '${resolvedLocale}'.`,
        `Add a translation for '${key}' to src/translations/${resolvedLocale}.json`,
      )
    }
    return value
  }
}

async function loadTranslations(path: string) {
  const translations: TranslationsByLocales = {}
  const imports = Object.entries(
    import.meta.glob(
      ["./translations/*.(yml|yaml)", "/src/translations/*.(yml|yaml)"],
      {
        query: "?raw",
        import: "default",
      },
    ),
  )
  const addTranslation = async (locale: string) => {
    const translationImport = imports.find(([importPath]) =>
      importPath.includes(`${path}/${locale}.`),
    )?.[1]
    if (!translationImport) {
      return
    }
    const translationsYml = (await translationImport()) as string
    translations[locale] = YAML.parse(translationsYml)
  }
  await Promise.all(locales.map((locale) => addTranslation(locale)))
  return translations
}

function merge(
  source: TranslationsByLocales,
  toMerge: TranslationsByLocales,
): TranslationsByLocales {
  const result = { ...source }
  for (const key of Object.keys(toMerge)) {
    if (!source[key]) {
      result[key] = toMerge[key]
    } else {
      result[key] = { ...source[key], ...toMerge[key] }
    }
  }
  return result
}
