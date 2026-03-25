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

/**
 * Build path to media item page.
 *
 * @param language current locale
 * @param mediaItem  media item
 * @returns path to media item page eg. '/en/media/my-book'
 */
export function detailsPagePath(
  locale: string | undefined,
  { id }: { id: string },
) {
  return pathWithBase(`/${locale}/media/${id}`)
}

/**
 * Build path to the search page.
 *
 * @param locale current locale
 * @param query  search query params
 * @returns path to the search page eg. '/en/media?category=comics'
 */
export function searchPagePath(
  locale: string | undefined,
  filter?: {
    category?: string
    language?: string
    search?: string
    type?: string
  },
) {
  const searchParams = new URLSearchParams()
  if (filter?.category) {
    searchParams.append("category", filter.category)
  }
  if (filter?.language) {
    searchParams.append("language", filter.language)
  }
  if (filter?.search) {
    searchParams.append("search", filter.search)
  }
  if (filter?.type) {
    searchParams.append("type", filter.type)
  }
  const query = searchParams.size ? `?${searchParams.toString()}` : ""
  return pathWithBase(`/${locale}/media${query}`)
}

/**
 * Resolve a path for a given locale.
 * Use this if you create paths based on user's input. In
 * cases where you control the full path, JavaScript template strings
 * are the easier solution to create a localized path.
 *
 * @param locale current locale
 * @param path to be resolved. A '/' at the beginning of the path is not required.
 * @returns resolved path. Eg. '/en/about' for input "en" and "/about"
 */
export function localizePath(locale: string | undefined, path: string) {
  return pathWithBase(
    `${locale ? `/${locale}` : ""}/${path.replace(/^\//, "")}`,
  )
}
