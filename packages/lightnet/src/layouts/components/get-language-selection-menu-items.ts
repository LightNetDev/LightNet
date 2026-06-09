import config from "virtual:lightnet/config"

import { resolveLanguage } from "../../i18n/resolve-language"
import type { TranslateConfigFieldFn } from "../../i18n/translate-map"
import { localizePath, pathWithoutBase } from "../../utils/paths"

export type LanguageLink = {
  active: boolean
  href: string
  label: string
  locale: string
}

export function getLanguageSelectionMenuItems({
  currentLocale,
  pathname,
  tConfigField,
}: {
  currentLocale: string
  pathname: string
  tConfigField: TranslateConfigFieldFn
}) {
  const currentPath = pathWithoutBase(pathname)
  const hasLocale = Boolean(
    currentLocale &&
    (currentPath.startsWith(`/${currentLocale}/`) ||
      currentPath === `/${currentLocale}`),
  )

  const links = config.locales
    .map((locale) => ({
      locale,
      label: tConfigField(resolveLanguage(locale).label, config),
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
