/**
 * Prefix a site-internal path with Astro's configured base path.
 *
 * This helper trims any trailing slash from `BASE_URL`, ensures the input
 * path starts with a leading slash, and concatenates the two values.
 * Absolute URLs are out of scope for this helper.
 *
 * @param path internal path such as "/en/media", "/api/internal/search.json", or "/"
 * @returns base-aware internal path
 */
export function pathWithBase(path: string) {
  const normalizedBase = import.meta.env.BASE_URL.replace(/\/+$/, "")
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}
