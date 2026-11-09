import SearchIcon from "lucide-react/icons/search"
import SlidersHorizontalIcon from "lucide-react/icons/sliders-horizontal"
import XIcon from "lucide-react/icons/x"
import { useId, useRef, useState } from "react"

import { createI18n, type I18nConfig } from "../../../i18n/react/i18n-context"
import { useDebounce } from "../hooks/use-debounce"
import { useSearchItems } from "../hooks/use-search-items"
import { useSearchQueryParam } from "../hooks/use-search-query-param"
import { availableFilterOptions } from "../utils/available-filter-options"
import { CATEGORY, LANGUAGE, SEARCH, TYPE } from "../utils/search-query"
import Select from "./Select"

type FilterValue = { id: string; labelText: string }

interface Props {
  languages: FilterValue[]
  categories: FilterValue[]
  mediaTypes: FilterValue[]
  i18nConfig: I18nConfig
  languageFilterEnabled: boolean
  typesFilterEnabled: boolean
  categoriesFilterEnabled: boolean
  initialLanguage?: string
}

export default function SearchFilter({
  categories,
  mediaTypes,
  i18nConfig,
  languages,
  languageFilterEnabled,
  typesFilterEnabled,
  categoriesFilterEnabled,
  initialLanguage,
}: Props) {
  const [search, setSearch] = useSearchQueryParam(SEARCH)
  const [language, setLanguage] = useSearchQueryParam(LANGUAGE, initialLanguage)
  const [type, setType] = useSearchQueryParam(TYPE)
  const [category, setCategory] = useSearchQueryParam(CATEGORY)

  const items = useSearchItems()
  const query = { language, type, category }

  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const filtersId = useId()
  const filtersEnabled =
    languageFilterEnabled || typesFilterEnabled || categoriesFilterEnabled

  const searchInput = useRef<HTMLInputElement | null>(null)

  const { t } = createI18n(i18nConfig)

  const debouncedSetSearch = useDebounce((value: string) => {
    setSearch(value)
  }, 300)

  const activeFilters = [
    {
      id: LANGUAGE,
      enabled: languageFilterEnabled,
      label: t("ln.language"),
      value: language,
      options: languages,
      clear: () => setLanguage(""),
    },
    {
      id: TYPE,
      enabled: typesFilterEnabled,
      label: t("ln.type"),
      value: type,
      options: mediaTypes,
      clear: () => setType(""),
    },
    {
      id: CATEGORY,
      enabled: categoriesFilterEnabled,
      label: t("ln.category"),
      value: category,
      options: categories,
      clear: () => setCategory(""),
    },
  ].filter(({ enabled, value }) => enabled && value)

  return (
    <div className="mb-8 md:mb-10">
      <div className="flex items-stretch gap-2">
        <label className="flex min-w-0 grow items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-3 shadow-inner outline outline-2 outline-offset-2 outline-transparent transition-all ease-in-out focus-within:outline-gray-300">
          <input
            type="search"
            className="min-w-0 grow bg-white placeholder-gray-500 focus:outline-none"
            name="search"
            aria-label={t("ln.search.title")}
            ref={searchInput}
            placeholder={t("ln.search.placeholder")}
            enterKeyHint="search"
            defaultValue={search}
            onInput={(e) => debouncedSetSearch(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && searchInput.current?.blur()}
          />
          <SearchIcon className="shrink-0 text-gray-700" />
        </label>
        {filtersEnabled && (
          <button
            type="button"
            aria-expanded={filtersExpanded}
            aria-controls={filtersId}
            onClick={() => setFiltersExpanded((expanded) => !expanded)}
            className="flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 sm:px-4"
          >
            <SlidersHorizontalIcon size={20} aria-hidden="true" />
            {t("ln.search.filters")}
          </button>
        )}
      </div>
      <div id={filtersId} hidden={!filtersExpanded}>
        <div className="mt-3 grid grid-cols-1 gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-3 sm:gap-6">
          {languageFilterEnabled && (
            <Select
              label={t("ln.language")}
              initialValue={language ?? ""}
              valueChange={(val) => setLanguage(val)}
              options={[
                { id: "", labelText: t("ln.search.all-languages") },
                ...availableFilterOptions(languages, items, query, LANGUAGE),
              ]}
            />
          )}

          {typesFilterEnabled && (
            <Select
              label={t("ln.type")}
              initialValue={type ?? ""}
              valueChange={(val) => setType(val)}
              options={[
                { id: "", labelText: t("ln.search.all-types") },
                ...availableFilterOptions(mediaTypes, items, query, TYPE),
              ]}
            />
          )}

          {categoriesFilterEnabled && (
            <Select
              label={t("ln.category")}
              initialValue={category ?? ""}
              valueChange={(val) => setCategory(val)}
              options={[
                { id: "", labelText: t("ln.search.all-categories") },
                ...availableFilterOptions(categories, items, query, CATEGORY),
              ]}
            />
          )}
        </div>
      </div>
      {activeFilters.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {activeFilters.map(({ id, label, value, options, clear }) => {
            const text = `${label}: ${options.find(({ id }) => id === value)?.labelText ?? value}`
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={clear}
                  aria-label={t("ln.search.remove-filter", { filter: text })}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
                >
                  {text}
                  <XIcon size={16} className="shrink-0" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
