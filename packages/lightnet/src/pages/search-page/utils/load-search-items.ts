import type { SearchItem, SearchResponse } from "../api/search-response"

const SEARCH_API_PATH = "/api/internal/search.json"

let searchItems: Promise<SearchItem[]> | undefined

/** Share one search index request between the results and filter components. */
export function loadSearchItems() {
  searchItems ??= fetch(SEARCH_API_PATH)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `Was not able to load search results from ${SEARCH_API_PATH}.`,
        )
      }
      const { items }: SearchResponse = await response.json()
      return items
    })
    .catch((error) => {
      searchItems = undefined
      throw error
    })
  return searchItems
}
