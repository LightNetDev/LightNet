import Fuse from "fuse.js"
import { useEffect, useMemo, useRef, useState } from "react"

import type { SearchItem, SearchResponse } from "../../api/search-response"
import { observeSearchQuery, type SearchQuery } from "../utils/search-query"

declare global {
  interface Window {
    lnSearchState?: {
      fuse: Fuse<SearchItem>
      items: SearchItem[]
      locale?: string
    }
  }
}

interface Context {
  categories: Record<string, string>
  mediaTypes: Record<string, { name: string }>
  languages: Record<string, { name: string }>
  currentLocale?: string
}

export function useSearch({
  currentLocale,
  categories,
  mediaTypes,
  languages,
}: Context) {
  const fuse = useRef<Fuse<SearchItem>>(undefined)
  const [allItems, setAllItems] = useState<SearchItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState<Partial<SearchQuery>>({})
  useEffect(() => {
    const removeSearchQueryObserver = observeSearchQuery((newQuery) => {
      const queryIsUpdated = (
        ["search", "category", "language", "type"] as const
      ).find((key) => newQuery[key] !== query[key])

      if (!queryIsUpdated) {
        return
      }
      setQuery(newQuery)
    })
    const fetchData = async () => {
      try {
        const response = await fetch("/api/search.json")
        if (!response.ok) {
          throw new Error(
            "Was not able to load search results from /api/search.json.",
          )
        }
        const { items }: SearchResponse = await response.json()
        const enrichedItems = items.map((item) => {
          const translatedCategories =
            item.categories &&
            item.categories.map((categoryId) => categories[categoryId])
          const translatedType = mediaTypes[item.type].name
          const translatedLanguage = languages[item.language].name

          return {
            ...item,
            translatedCategories,
            translatedType,
            translatedLanguage,
          }
        })
        fuse.current = new Fuse(enrichedItems, {
          keys: [
            { name: "title", weight: 3 },
            "language",
            { name: "authors", weight: 2 },
            { name: "translatedCategories", weight: 2 },
            { name: "translatedType", weight: 2 },
            { name: "translatedLanguage", weight: 2 },
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
        window.lnSearchState = {
          locale: currentLocale,
          items,
          fuse: fuse.current,
        }
      } catch (error) {
        console.error(error)
      }
      setIsLoading(false)
    }
    // try restore old search index only if
    // locale is still the same because we add translated values to the
    // search index
    const { lnSearchState } = window
    if (lnSearchState && lnSearchState.locale === currentLocale) {
      fuse.current = lnSearchState.fuse
      setAllItems(lnSearchState.items)
      setIsLoading(false)
    } else {
      fetchData()
    }
    return removeSearchQueryObserver
  }, [])

  const results = useMemo(() => {
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
          { translatedCategories: search },
          { translatedType: search },
          { translatedLanguage: search },
          { description: search },
          { authors: search },
          { id: search },
        ],
      })
    }

    if (!fuse.current || !fuseQuery.length) {
      return allItems
    }

    return fuse.current
      .search({ $and: fuseQuery })
      .map((fuseItem) => fuseItem.item)
  }, [query, allItems])

  return {
    results,
    isLoading,
  }
}
