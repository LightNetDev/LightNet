import { AstroError } from "astro/errors"
import i18next, { type TOptions } from "i18next"
import config from "virtual:lightnet/config"

import { lazy } from "../utils/lazy"
import {
  type InlineTranslation,
  resolveInlineTranslation,
} from "./inline-translation"
import { type LightNetTranslationKey, loadTranslations } from "./translations"

// We add (string & NonNullable<unknown>) to preserve typescript autocompletion for known keys
export type TranslationKey =
  | LightNetTranslationKey
  | (string & NonNullable<unknown>)

export type TranslateFn = (
  input: TranslationKey | InlineTranslation,
  options?: TOptions,
) => string

const fallbackLanguages = Object.fromEntries(
  config.languages.map(({ code, fallbackLanguages }) => [
    code,
    fallbackLanguages,
  ]),
)

const languageCodes = [
  ...new Set(
    config.languages
      .filter(({ isSiteLanguage }) => isSiteLanguage)
      .flatMap(({ code, fallbackLanguages }) => [
        code,
        ...fallbackLanguages,
        "en",
      ]),
  ),
]

const i18nextTranslations = lazy(async () => {
  const result: Record<string, { translation: Record<string, string> }> = {}
  for (const bcp47 of languageCodes) {
    result[bcp47] = {
      translation: await loadTranslations(bcp47),
    }
  }
  return result
})

const translationKeys = lazy(async () => {
  const translations = await i18nextTranslations.get()
  return [
    ...new Set(
      Object.values(translations)
        .map(({ translation }) => translation)
        .flatMap((oneLanguageTranslations) =>
          Object.keys(oneLanguageTranslations),
        ),
    ),
  ]
})

export function getTranslationKeys() {
  return translationKeys.get()
}

export async function useTranslate(
  bcp47: string | undefined,
): Promise<TranslateFn> {
  const resolvedLocale = bcp47 ?? config.defaultLocale
  const translations = await i18nextTranslations.get()
  const availableTranslationKeys = new Set(await translationKeys.get())

  const i18n = i18next.createInstance({ showSupportNotice: false })

  await i18n.init({
    lng: config.defaultLocale,
    // don't use name spacing
    nsSeparator: false,
    // only use flat keys
    keySeparator: false,
    resources: translations,
  })

  const fallbackLng = [
    ...(fallbackLanguages[resolvedLocale] ?? []),
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

    const t = i18n.getFixedT(resolvedLocale) as (
      key: TranslationKey,
      options?: TOptions,
    ) => string
    const value = t(input, { fallbackLng, ...options })
    if (value === input && !availableTranslationKeys.has(input)) {
      throw new AstroError(
        `Missing translation: '${input}' is undefined for language '${resolvedLocale}'.`,
        `To fix the issue, add a translation for '${input}' to src/translations/${resolvedLocale}.yml`,
      )
    }
    return value
  }
}
