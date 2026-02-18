import { AstroError } from "astro/errors"
import i18next from "i18next"
import config from "virtual:lightnet/config"

import type { TranslateFn } from "./translate"

export const resolveLanguage = (bcp47: string) => {
  const language = config.languages[bcp47]

  if (!language) {
    throw new AstroError(
      `Missing language code "${bcp47}"`,
      `To fix the issue, add a language with the code "${bcp47}" to the LightNet configuration in your astro.config.mjs file.`,
    )
  }
  return {
    ...language,
    bcp47,
    direction: i18next.dir(bcp47),
  }
}

export const resolveTranslatedLanguage = (bcp47: string, t: TranslateFn) => {
  const language = resolveLanguage(bcp47)
  return {
    ...language,
    bcp47,
    labelText: t(language.label),
  }
}
