import { AstroError } from "astro/errors"
import i18next, { type TOptions } from "i18next"
import config from "virtual:lightnet/config"

import {
  type InlineTranslation,
  resolveInlineTranslation,
} from "./inline-translation"
import { resolveLanguage } from "./resolve-language"
import { type LightNetTranslationKey, loadTranslations } from "./translations"

// We add (string & NonNullable<unknown>) to preserve typescript autocompletion for known keys
export type TranslationKey =
  | LightNetTranslationKey
  | (string & NonNullable<unknown>)

export type TranslateFn = (
  input: TranslationKey | InlineTranslation,
  options?: TOptions,
) => string

const languageCodes = [
  ...new Set(
    config.languages
      .filter((lng) => lng.isSiteLanguage)
      .flatMap((lng) => [lng.code, ...lng.fallbackLanguages, "en"]),
  ),
]

const translations = await prepareI18nextTranslations()
export const translationKeys = [
  ...new Set(
    Object.values(translations)
      .map(({ translation }) => translation)
      .flatMap((oneLanguageTranslations) =>
        Object.keys(oneLanguageTranslations),
      ),
  ),
]

const i18n = i18next.createInstance({ showSupportNotice: false })
await i18n.init({
  lng: config.defaultLocale,
  // don't use name spacing
  nsSeparator: false,
  // only use flat keys
  keySeparator: false,
  resources: translations,
})

export function useTranslate(bcp47: string | undefined): TranslateFn {
  const resolvedLocale = bcp47 ?? config.defaultLocale
  const t = i18n.getFixedT<TranslationKey>(resolvedLocale)
  const fallbackLng = [
    ...resolveLanguage(resolvedLocale).fallbackLanguages,
    config.defaultLocale,
    "en",
  ]
  return (input, options) => {
    if (typeof input !== "string") {
      return resolveInlineTranslation(
        input,
        resolvedLocale,
        config.defaultLocale,
      )
    }

    const value = t(input, { fallbackLng, ...options })
    // i18next will return the key if no translation is found.
    if (value === input) {
      throw new AstroError(
        `Missing translation: '${input}' is undefined for language '${resolvedLocale}'.`,
        `To fix the issue, add a translation for '${input}' to src/translations/${resolvedLocale}.yml`,
      )
    }
    return value
  }
}

async function prepareI18nextTranslations() {
  const result: Record<string, { translation: Record<string, string> }> = {}
  for (const bcp47 of languageCodes) {
    result[bcp47] = {
      translation: await loadTranslations(bcp47),
    }
  }
  return result
}
