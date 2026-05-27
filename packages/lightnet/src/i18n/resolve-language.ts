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
    labelText: formatLanguageLabel(tConfigField(language.label, config), bcp47),
  }
}

export function formatLanguageLabel(labelText: string, bcp47: string) {
  try {
    const region = new Intl.Locale(bcp47).region
    if (region) {
      return `${labelText} (${region.toUpperCase()})`
    }
  } catch {
    // Ignore invalid locale parsing here and fall back to the default label.
  }

  const defaultRegions: Record<string, string> = {
    ar: "SA",
    de: "DE",
    en: "US",
  }
  const language = bcp47.split("-")[0].toLowerCase()
  const defaultRegion = defaultRegions[language]

  if (defaultRegion) {
    return `${labelText} (${defaultRegion})`
  }

  return labelText
}

export async function getTranslatedLanguages(
  currentLocale: string,
  tConfigField: TranslateConfigFieldFn,
) {
  return config.languages
    .map(({ code }) => resolveTranslatedLanguage(code, tConfigField))
    .sort((a, b) => a.labelText.localeCompare(b.labelText, currentLocale))
}
