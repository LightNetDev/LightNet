import { AstroError } from "astro/errors"
import i18next from "i18next"
import config from "virtual:lightnet/config"

import type { InlineTranslateFn } from "./inline-translation"

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
  tInline: InlineTranslateFn,
) => {
  const language = resolveLanguage(bcp47)
  return {
    ...language,
    labelText: tInline(language.label, {
      path: ["languages", bcp47, "label"],
    }),
  }
}
