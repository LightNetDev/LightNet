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
  const normalizedBase =
    base && base !== "/" ? base.replace(/\/+$/, "") || "/" : undefined
  const pathnameWithoutBase =
    normalizedBase &&
    (pathname === normalizedBase || pathname.startsWith(`${normalizedBase}/`))
      ? pathname.slice(normalizedBase.length) || "/"
      : pathname
  const firstPathSegment = pathnameWithoutBase.split("/")[1]

  return locales.includes(firstPathSegment) ? firstPathSegment : defaultLocale
}
