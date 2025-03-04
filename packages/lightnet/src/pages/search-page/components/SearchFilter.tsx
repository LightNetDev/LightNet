import { useEffect, useRef, useState } from "react"

import Icon from "../../../components/Icon"
import { useDebounce } from "../hooks/use-debounce"
import type { SearchQuery } from "../hooks/use-search"
import type { MediaType, TranslatedLanguage } from "../types"
import type { Translations } from "../utils/search-translations"
import { useProvidedTranslations } from "../utils/use-provided-translations"
import Select from "./Select"

// URL search params
const SEARCH = "search"
const LANGUAGE = "language"
const TYPE = "type"
const CATEGORY = "category"

interface Props {
  contentLanguages: TranslatedLanguage[]
  categories: Record<string, string>
  mediaTypes: MediaType[]
  locale?: string
  translations: Translations
  filterByLocale: boolean
  updateQuery: (query: SearchQuery) => void
}

export default function SearchFilter({
  categories,
  mediaTypes,
  updateQuery,
  translations,
  filterByLocale,
  locale,
  contentLanguages,
}: Props) {
  const languageFilterEnabled = contentLanguages.length > 1
  const typesFilterEnabled = mediaTypes.length > 1
  // Not every media item has a category. So it makes
  // sense to have the filter when there is only one category.
  const categoriesFilterEnabled = Object.keys(categories).length > 0

  const getSearchParam = (name: string, defaultValue = "") => {
    // be lazy to avoid parsing search params all the time
    return () => {
      const searchParams = new URLSearchParams(window.location.search)
      return searchParams.get(name) ?? defaultValue
    }
  }

  const [search, setSearch] = useState(getSearchParam(SEARCH))
  const [language, setLanguage] = useState(() => {
    let initialLanguageFilter = ""
    const hasContentLanguage = contentLanguages.find(
      ({ code }) => code === locale,
    )
    if (
      filterByLocale &&
      locale &&
      hasContentLanguage &&
      languageFilterEnabled
    ) {
      initialLanguageFilter = locale
    }
    return getSearchParam(LANGUAGE, initialLanguageFilter)()
  })
  const [type, setType] = useState(getSearchParam(TYPE))
  const [category, setCategory] = useState(getSearchParam(CATEGORY))

  const searchInput = useRef<HTMLInputElement | null>(null)

  const t = useProvidedTranslations(translations)

  const debouncedSetSearch = useDebounce((value: string) => {
    setSearch(value)
  }, 300)

  useEffect(() => {
    const url = new URL(window.location.href)
    const updateSearchParam = (name: string, value: string) => {
      // Only update when value before and after are different and both are non empty.
      if (value === (url.searchParams.get(name) ?? "")) {
        return
      }
      url.searchParams.set(name, value)
    }

    updateSearchParam(SEARCH, search)
    updateSearchParam(LANGUAGE, language)
    updateSearchParam(TYPE, type)
    updateSearchParam(CATEGORY, category)
    history.replaceState({ ...history.state }, "", url.toString())

    updateQuery({ search, language, type, category })
  }, [search, language, type, category])

  return (
    <>
      <label className="dy-input dy-input-md dy-input-bordered mb-2 flex w-full items-center gap-2">
        <input
          type="search"
          className="grow"
          ref={searchInput}
          placeholder={t("ln.search.placeholder")}
          enterKeyHint="search"
          defaultValue={search}
          onInput={(e) => debouncedSetSearch(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && searchInput.current?.blur()}
        />
        <Icon className="mdi--magnify text-xl" ariaLabel="" />
      </label>
      <div className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-6 md:mb-10">
        {languageFilterEnabled && (
          <Select
            label={t("ln.language_one")}
            initialValue={language}
            valueChange={(val) => setLanguage(val)}
            options={[
              { id: "", label: t("ln.search.all-languages") },
              ...contentLanguages.map(({ code: id, name: label }) => ({
                id,
                label,
              })),
            ]}
          />
        )}

        {typesFilterEnabled && (
          <Select
            label={t("ln.type_one")}
            initialValue={type}
            valueChange={(val) => setType(val)}
            options={[
              { id: "", label: t("ln.search.all-types") },
              ...mediaTypes,
            ]}
          />
        )}

        {categoriesFilterEnabled && (
          <Select
            label={t("ln.category_one")}
            initialValue={category}
            valueChange={(val) => setCategory(val)}
            options={[
              { id: "", label: t("ln.search.all-categories") },
              ...Object.entries(categories)
                .sort((a, b) => a[1].localeCompare(b[1], locale))
                .map(([id, label]) => ({ id, label })),
            ]}
          />
        )}
      </div>
    </>
  )
}
