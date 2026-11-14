import { useEffect, useState } from "react"

import type { SearchItem } from "../api/search-response"
import { loadSearchItems } from "../utils/load-search-items"

export function useSearchItems() {
  const [items, setItems] = useState<SearchItem[]>()

  useEffect(() => {
    let active = true
    loadSearchItems()
      .then((items) => {
        if (active) setItems(items)
      })
      .catch((error) => console.error(error))
    return () => {
      active = false
    }
  }, [])

  return items
}
