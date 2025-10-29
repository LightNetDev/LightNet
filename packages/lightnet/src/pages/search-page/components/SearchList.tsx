import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { useEffect, useRef, useState } from "react"

import {
  createI18n,
  type I18nConfig,
  I18nContext,
} from "../../../i18n/react/i18n-context"
import { useSearch } from "../hooks/use-search"
import LoadingSkeleton from "./LoadingSkeleton"
import SearchListItem, {
  type MediaType,
  type TranslatedLanguage,
} from "./SearchListItem"

interface Props {
  i18nConfig: I18nConfig
  categories: Record<string, string>
  languages: Record<string, TranslatedLanguage>
  showLanguage: boolean
  mediaTypes: Record<string, MediaType>
  mediaItemsTotal: number
}

export default function SearchList({
  categories,
  i18nConfig,
  languages,
  showLanguage,
  mediaTypes,
  mediaItemsTotal,
}: Props) {
  const listRef = useRef<HTMLDivElement | null>(null)
  const [rowHeight, setRowHeight] = useState(256)
  const { results, isLoading } = useSearch({
    categories,
    languages,
    mediaTypes,
  })
  const count = isLoading ? mediaItemsTotal : results.length

  const virtualizer = useWindowVirtualizer({
    count,
    estimateSize: () => rowHeight,
    getItemKey: (index) => (isLoading ? index : results[index].id),
    overscan: 2,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  })

  useEffect(() => {
    const updateRowHeight = () => {
      // This is the fixed row heights that have a responsive breakpoint
      // If you update here, also update the initial height
      const newRowHeight = window.matchMedia("(min-width: 640px)").matches
        ? 256
        : 208
      setRowHeight(newRowHeight)
    }
    const observer = new ResizeObserver(() => updateRowHeight())
    observer.observe(document.body)
    updateRowHeight()
    return () => {
      observer.disconnect()
    }
  }, [])
  const i18n = createI18n(i18nConfig)

  return (
    <I18nContext.Provider value={i18n}>
      <div ref={listRef} className="px-4 md:px-8">
        <ol
          className="relative w-full divide-y divide-gray-200"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const item = results[virtualRow.index]
            return (
              <li
                key={virtualRow.key}
                className="absolute left-0 top-0 block w-full"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${
                    virtualRow.start - virtualizer.options.scrollMargin
                  }px)`,
                }}
              >
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <SearchListItem
                    item={item}
                    showLanguage={showLanguage}
                    categories={categories}
                    languages={languages}
                    mediaTypes={mediaTypes}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </div>
      {!results.length && !isLoading && (
        <div className="mt-24 text-center font-bold text-gray-500">
          {i18n.t("ln.search.no-results")}
        </div>
      )}
    </I18nContext.Provider>
  )
}
