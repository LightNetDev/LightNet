import type { SearchItem } from "../api/search-response"
import type { SearchQuery } from "./search-query"

type FilterOption = { id: string; labelText: string }
type Filter = "language" | "type" | "category"

/** Match the other filters so users can still switch the current filter. */
export function availableFilterOptions(
  options: FilterOption[],
  items: Pick<SearchItem, "language" | "type" | "categories">[] | undefined,
  query: SearchQuery,
  filter: Filter,
): FilterOption[] {
  // Keep the original options while loading, or if the index could not load.
  if (!items) return options

  const available = new Set<string>()
  for (const item of items) {
    if (
      filter !== "language" &&
      query.language &&
      item.language !== query.language
    )
      continue
    if (filter !== "type" && query.type && item.type !== query.type) continue
    if (
      filter !== "category" &&
      query.category &&
      !item.categories?.includes(query.category)
    )
      continue

    if (filter === "category") {
      item.categories?.forEach((category) => available.add(category))
    } else {
      available.add(item[filter])
    }
  }

  const selected = query[filter]
  const result = options.filter(
    ({ id }) => available.has(id) || id === selected,
  )
  // Preserve even unknown URL values, keeping the select consistent with its tag.
  if (selected && !result.some(({ id }) => id === selected)) {
    result.push({ id: selected, labelText: selected })
  }
  return result
}
