import { localizePath, pathWithoutBase } from "../utils/paths"
import { resolveTranslatedLanguage } from "./resolve-language"
import type { TranslateConfigFieldFn } from "./translate-map"

export type LanguageLink = {
  active: boolean
  href: string
  label: string
  locale: string
}

export function getLanguageLinks({
  currentLocale,
  locales,
  pathname,
  tConfigField,
}: {
  currentLocale: string
  locales: string[]
  pathname: string
  tConfigField: TranslateConfigFieldFn
}) {
  const currentPath = pathWithoutBase(pathname)
  const hasLocale = Boolean(
    currentLocale &&
    (currentPath.startsWith(`/${currentLocale}/`) ||
      currentPath === `/${currentLocale}`),
  )

  const links = locales
    .map((locale) => ({
      locale,
      label: resolveTranslatedLanguage(locale, tConfigField).labelText,
      active: locale === currentLocale,
      href: localizePath(
        locale,
        hasLocale ? currentPath.slice(currentLocale.length + 1) : currentPath,
      ),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, currentLocale))

  return {
    currentPath,
    hasLocale,
    links,
  }
}
