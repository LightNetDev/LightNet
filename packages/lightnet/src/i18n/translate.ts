import { AstroError } from "astro/errors"
import i18next, { type TOptions } from "i18next"
import config from "virtual:lightnet/config"

import { isLabelValue, type LabelValue } from "./label"
import { resolveDefaultLocale } from "./resolve-default-locale"
import { resolveLanguage } from "./resolve-language"
import { type LightNetTranslationKey, loadTranslations } from "./translations"

// We add (string & NonNullable<unknown>) to preserve typescript autocompletion for known keys
export type TranslationKey =
  | LightNetTranslationKey
  | (string & NonNullable<unknown>)

export type TranslateFn = (
  key: TranslationKey | LabelValue,
  options?: TOptions,
) => string

const languageCodes = [
  ...new Set(
    config.languages
      .filter((lng) => lng.isSiteLanguage)
      .flatMap((lng) => [lng.code, ...lng.fallbackLanguages, "en"]),
  ),
]
const defaultLocale = resolveDefaultLocale(config)

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
  lng: defaultLocale,
  // don't use name spacing
  nsSeparator: false,
  // only use flat keys
  keySeparator: false,
  resources: translations,
})

export function useTranslate(bcp47: string | undefined): TranslateFn {
  const resolvedLocale = bcp47 ?? defaultLocale
  const t = i18n.getFixedT<TranslationKey>(resolvedLocale)
  const fallbackLng = [
    ...resolveLanguage(resolvedLocale).fallbackLanguages,
    defaultLocale,
    "en",
  ]
  return (key, options) => {
    if (isLabelValue(key)) {
      if (key.type === "fixed") {
        return key.text
      }
      return translateKey(key.key, t, fallbackLng, resolvedLocale, options)
    }

    return translateKey(key, t, fallbackLng, resolvedLocale, options)
  }
}

function translateKey(
  key: TranslationKey,
  t: ReturnType<typeof i18n.getFixedT<TranslationKey>>,
  fallbackLng: string[],
  resolvedLocale: string,
  options?: TOptions,
) {
  const value = t(key, { fallbackLng, ...options })
  if (value === key) {
    throw new AstroError(
      `Missing translation: '${key}' is undefined for language '${resolvedLocale}'.`,
      `To fix the issue, add a translation for '${key}' to src/config/translations/${resolvedLocale}.yaml`,
    )
  }
  return value
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
