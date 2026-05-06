import type { MiddlewareHandler } from "astro"
import config from "virtual:lightnet/config"

import { resolveCurrentLocaleFromPathname } from "./resolve-current-locale"
import { resolveLanguage } from "./resolve-language"
import { getTranslationKeys, useTranslate } from "./translate"
import { useTranslateMap } from "./translate-map"

export const onRequest: MiddlewareHandler = async ({ locals, url }, next) => {
  if (!locals.i18n) {
    const defaultLocale = config.defaultLocale
    const locales = config.locales
    const currentLocale = resolveCurrentLocaleFromPathname({
      pathname: url.pathname,
      base: import.meta.env.BASE_URL,
      locales,
      defaultLocale,
    })
    const [t, translationKeys] = await Promise.all([
      useTranslate(currentLocale),
      getTranslationKeys(),
    ])
    const { tMap, tConfigField, tContentField } = useTranslateMap(currentLocale)
    const { direction } = resolveLanguage(currentLocale)
    locals.i18n = {
      t,
      tMap,
      tConfigField,
      tContentField,
      currentLocale,
      defaultLocale,
      direction,
      locales,
      translationKeys,
    }
  }
  return next()
}
