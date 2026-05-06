import { AstroError } from "astro/errors"
import i18next from "i18next"
import config from "virtual:lightnet/config"

import type { TranslateConfigFieldFn } from "./translate-map"

const languages = Object.fromEntries(
  config.languages.map((language) => [language.code, language]),
)

export const resolveLanguage = (bcp47: string) => {
  const language = languages[bcp47]

  if (!language) {
    throw new AstroError(
      `Missing language code "${bcp47}"`,
      `To fix the issue, add a language with the code "${bcp47}" to the LightNet configuration in your astro.config file.`,
    )
  }
  return {
    ...language,
    direction: i18next.dir(bcp47),
  }
}

export const resolveTranslatedLanguage = (
  bcp47: string,
  tConfigField: TranslateConfigFieldFn,
) => {
  const language = resolveLanguage(bcp47)
  return {
    ...language,
    labelText: tConfigField(language.label, config),
  }
}

export async function getTranslatedLanguages(
  currentLocale: string,
  tConfigField: TranslateConfigFieldFn,
) {
  return config.languages
    .map(({ code }) => resolveTranslatedLanguage(code, tConfigField))
    .sort((a, b) => a.labelText.localeCompare(b.labelText, currentLocale))
}
