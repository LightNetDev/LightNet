import type { MiddlewareHandler } from "astro"
import config from "virtual:lightnet/config"

import { resolveLanguage } from "./resolve-language"
import { translationKeys, useTranslate } from "./translate"

export const onRequest: MiddlewareHandler = (
  { locals, currentLocale: astroCurrentLocale },
  next,
) => {
  if (!locals.i18n) {
    const t = useTranslate(astroCurrentLocale)
    const defaultLocale = config.defaultLocale
    const locales = config.locales
    const currentLocale = astroCurrentLocale ?? defaultLocale
    const { direction } = resolveLanguage(currentLocale)
    locals.i18n = {
      t,
      currentLocale,
      defaultLocale,
      direction,
      locales,
      translationKeys,
    }
  }
  return next()
}
