import { pathWithoutBase } from "../utils/paths"

export function resolveCurrentLocaleFromPathname({
  pathname,
  base,
  locales,
  defaultLocale,
}: {
  pathname: string
  base?: string
  locales: string[]
  defaultLocale: string
}) {
  const pathnameWithoutBase = base ? pathWithoutBase(pathname, base) : pathname
  const firstPathSegment = pathnameWithoutBase.split("/")[1]

  return locales.includes(firstPathSegment) ? firstPathSegment : defaultLocale
}
