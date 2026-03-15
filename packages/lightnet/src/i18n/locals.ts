import type { MiddlewareHandler } from "astro"
import config from "virtual:lightnet/config"

import { resolveCurrentLocaleFromPathname } from "./resolve-current-locale"
import { resolveLanguage } from "./resolve-language"
import { getTranslationKeys, useTranslate } from "./translate"

export const onRequest: MiddlewareHandler = async ({ locals, url }, next) => {
  if (!locals.i18n) {
    const defaultLocale = config.defaultLocale
    const locales = config.locales
    const currentLocale = resolveCurrentLocaleFromPathname({
      pathname: url.pathname,
      locales,
      defaultLocale,
    })
    const [t, translationKeys] = await Promise.all([
      useTranslate(currentLocale),
      getTranslationKeys(),
    ])
    const { direction } = await resolveLanguage(currentLocale)
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
