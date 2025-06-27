import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { useEffect, useRef, useState } from "react"

import { useSearch } from "../hooks/use-search"
import type { TranslationKey, Translations } from "../utils/search-translations"
import SearchListItem, {
  type MediaType,
  type TranslatedLanguage,
} from "./SearchListItem"

interface Props {
  currentLocale: string | undefined
  translations: Translations
  direction: "rtl" | "ltr"
  categories: Record<string, string>
  languages: Record<string, TranslatedLanguage>
  showLanguage: boolean
  mediaTypes: Record<string, MediaType>
}

export default function SearchList({
  currentLocale,
  categories,
  translations,
  languages,
  direction,
  showLanguage,
  mediaTypes,
}: Props) {
  const restoredPosition = useRef(0)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [rowHeight, setRowHeight] = useState(208)

  const { results, isLoading } = useSearch({
    currentLocale,
    categories,
    languages,
    mediaTypes,
  })
  const virtualizer = useWindowVirtualizer({
    count: results.length,
    estimateSize: () => rowHeight,
    getItemKey: (index) => results[index].id,
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

  // Astro's ClientRouter is writing a incorrect scroll position to
  // history.state.scrollY. We have seen this when having the search results
  // below the fold. This leads to incorrect scroll position restoration after
  // navigating back.
  //
  // We store the correct scroll value to a custom property "searchScrollY"
  // to be used by the scroll restoration.
  useEffect(() => {
    restoredPosition.current = history.state?.searchScrollY ?? 0
    let timeout: number | undefined
    const storeScrollPosition = () => {
      if (timeout) {
        window.clearTimeout(timeout)
      }
      timeout = window.setTimeout(() => {
        const state = history.state ?? {}
        history.pushState({ ...state, searchScrollY: window.scrollY }, "")
      }, 50)
    }
    document.addEventListener("scroll", storeScrollPosition)
    return () => {
      document.removeEventListener("scroll", storeScrollPosition)
    }
  }, [])

  // Restore scroll position after back navigation.
  // We need to implement this because default restoration is kicking in
  // before results are loaded. Also default restoration uses and incorrect scroll position.
  // This is why we rely on our custom property.
  useEffect(() => {
    const { state } = history
    if (!isLoading && state?.searchScrollY !== undefined) {
      requestAnimationFrame(() =>
        window.scrollTo({ top: restoredPosition.current }),
      )
    }
  }, [isLoading])

  const t = (key: TranslationKey) => translations[key]

  return (
    <>
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
                <SearchListItem
                  item={item}
                  direction={direction}
                  showLanguage={showLanguage}
                  currentLocale={currentLocale}
                  categories={categories}
                  languages={languages}
                  mediaTypes={mediaTypes}
                />
              </li>
            )
          })}
        </ol>
      </div>
      {!results.length && !isLoading && (
        <div className="mt-24 text-center font-bold text-gray-500">
          {t("ln.search.no-results")}
        </div>
      )}
    </>
  )
}
