const exampleAllowedOrigin = "https://example.com"

const parseAllowedOrigins = (allowedOrigins?: string) =>
  (allowedOrigins ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

const isCanonicalHttpsOrigin = (origin: string) => {
  try {
    const url = new URL(origin)
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      origin === url.origin
    )
  } catch {
    return false
  }
}

/** Returns the configured origins only when every entry is a canonical HTTPS origin. */
export const getAllowedOrigins = (allowedOrigins?: string) => {
  const origins = parseAllowedOrigins(allowedOrigins)
  return origins.every(isCanonicalHttpsOrigin) ? origins : []
}

/** The allow-list is required before this worker may start or complete an OAuth flow. */
export const hasConfiguredAllowedOrigins = (allowedOrigins?: string) => {
  const origins = getAllowedOrigins(allowedOrigins)
  return (
    origins.length > 0 &&
    !origins.some((origin) => origin === exampleAllowedOrigin)
  )
}

export const isAllowedSiteId = (
  siteId: string | undefined,
  allowedOrigins?: string,
) => {
  if (!siteId) return false

  return getAllowedOrigins(allowedOrigins).some(
    (origin) => new URL(origin).hostname === siteId,
  )
}
