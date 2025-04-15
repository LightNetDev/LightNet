import Fuse from "fuse.js"
import { useEffect, useRef, useState } from "react"

import type { SearchItem, SearchResponse } from "../../api/search-response"

export type SearchQuery = {
  search?: string
  language?: string
  type?: string
  category?: string
}

export function useSearch() {
  const fuse = useRef<Fuse<SearchItem>>(undefined)
  const [allItems, setAllItems] = useState<SearchItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState<SearchQuery>({})
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/search.json")
        if (!response.ok) {
          throw new Error(
            "Was not able to load search results from /api/search.json.",
          )
        }
        const { items }: SearchResponse = await response.json()
        fuse.current = new Fuse(items, {
          keys: [
            { name: "title", weight: 3 },
            "language",
            { name: "authors", weight: 2 },
            "description",
            "type",
            "categories",
            "id",
          ],
          useExtendedSearch: true,
          threshold: 0.3,
          ignoreLocation: true,
        })
        setAllItems(items)
      } catch (error) {
        console.error(error)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const { language, type, category, search } = query
  const fuseQuery = []
  // order is relevant! query will stop evaluation
  // when condition is not met.
  if (language) {
    fuseQuery.push({ language: `=${language}` })
  }
  if (type) {
    fuseQuery.push({ type: `=${type}` })
  }
  if (category) {
    fuseQuery.push({ categories: `=${category}` })
  }
  if (search) {
    fuseQuery.push({
      $or: [
        { title: search },
        { description: search },
        { authors: search },
        { id: search },
      ],
    })
  }

  const updateQuery = (newQuery: SearchQuery) => {
    const queryIsUpdated = (
      ["search", "category", "language", "type"] as const
    ).find((key) => (newQuery[key] ? newQuery[key] !== query[key] : query[key]))

    if (!queryIsUpdated) {
      return
    }
    setQuery(newQuery)
  }

  if (!fuse.current || !fuseQuery.length) {
    return { results: allItems, updateQuery, isLoading }
  }

  return {
    results: fuse.current
      .search({ $and: fuseQuery })
      .map((fuseItem) => fuseItem.item),
    updateQuery,
    isLoading,
  }
}
