export function resolveCurrentLocaleFromPathname({
  pathname,
  locales,
  defaultLocale,
}: {
  pathname: string
  locales: string[]
  defaultLocale: string
}) {
  const firstPathSegment = pathname.split("/")[1]
  return locales.includes(firstPathSegment) ? firstPathSegment : defaultLocale
}
