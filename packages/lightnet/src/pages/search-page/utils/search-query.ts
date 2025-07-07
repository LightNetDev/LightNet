export type SearchQuery = {
  search?: string
  category?: string
  language?: string
  type?: string
}

// URL search parameter names
export const SEARCH = "search"
export const LANGUAGE = "language"
export const TYPE = "type"
export const CATEGORY = "category"

export const UPDATE_QUERY_EVENT = "ln:update-search-query"

export type SearchQueryParam =
  | typeof SEARCH
  | typeof LANGUAGE
  | typeof TYPE
  | typeof CATEGORY

/**
 * Read the current value of the given search query parameter
 * from the url.
 * @param paramName query parameter name
 * @returns query parameter or undefined if it is not set
 */
export function getSearchQueryParam(paramName: SearchQueryParam) {
  if (!window) {
    return undefined
  }
  const searchParams = new URLSearchParams(window.location.search)
  return searchParams.get(paramName) ?? undefined
}

/**
 * Set the new value of the search query parameter. This will
 * also change the search results.
 *
 * We need to know if a value has been set by the user. Empty string
 * means user action has removed a query parameter.
 * E.g. when there is a default language filter this must not override
 * the users choice to remove the language filter.
 *
 * @param paramName parameter name to set
 * @param value new value, use empty string if you want to remove the filter.
 */
export function setSearchQueryParam(
  paramName: SearchQueryParam,
  value: string,
) {
  const url = new URL(window.location.href)
  // Only update when value before and after are different and both are non empty.
  if (value === (url.searchParams.get(paramName) ?? "")) {
    return
  }
  url.searchParams.set(paramName, value)
  history.replaceState({ ...history.state }, "", url.toString())
  document.dispatchEvent(new Event(UPDATE_QUERY_EVENT))
}

export function observeSearchQuery(callback: (query: SearchQuery) => void) {
  const onUpdateQuery = () => {
    const searchParams = new URL(window.location.href).searchParams
    const query = {
      search: searchParams.get(SEARCH) ?? undefined,
      category: searchParams.get(CATEGORY) ?? undefined,
      language: searchParams.get(LANGUAGE) ?? undefined,
      type: searchParams.get(TYPE) ?? undefined,
    }
    callback(query)
  }
  document.addEventListener(UPDATE_QUERY_EVENT, onUpdateQuery)
  onUpdateQuery()
  return () => document.removeEventListener(UPDATE_QUERY_EVENT, onUpdateQuery)
}
