import config from "virtual:lightnet/config"
import { useTranslate, translationKeys } from "../../i18n/translate"
import { resolveLanguage } from "../../i18n/resolve-language"
import { resolveDefaultLocale } from "../../i18n/resolve-default-locale"
import { resolveLocales } from "../../i18n/resolve-locales"

const currentLocale = config.experimental?.admin?.languageCode ?? "en"
const t = useTranslate(currentLocale)
const { direction } = resolveLanguage(currentLocale)
const defaultLocale = resolveDefaultLocale(config)
const locales = resolveLocales(config)

export const adminI18n = {
  currentLocale,
  t,
  direction,
  translationKeys,
  defaultLocale,
  locales,
}
