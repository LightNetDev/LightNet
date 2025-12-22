import { useRef } from "react"

import Icon from "../../../components/Icon"
import { createI18n, type I18nConfig } from "../../../i18n/react/i18n-context"
import { useDebounce } from "../hooks/use-debounce"
import { useSearchQueryParam } from "../hooks/use-search-query-param"
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

  const searchInput = useRef<HTMLInputElement | null>(null)

  const { t } = createI18n(i18nConfig)

  const debouncedSetSearch = useDebounce((value: string) => {
    setSearch(value)
  }, 300)

  return (
    <>
      <label className="mb-2 flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-4 py-3 shadow-inner outline outline-2 outline-offset-2 outline-transparent transition-all ease-in-out focus-within:outline-gray-300">
        <input
          type="search"
          className="grow placeholder-gray-500 focus:outline-none"
          name="search"
          ref={searchInput}
          placeholder={t("ln.search.placeholder")}
          enterKeyHint="search"
          defaultValue={search}
          onInput={(e) => debouncedSetSearch(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && searchInput.current?.blur()}
        />
        <Icon className="text-xl mdi--magnify" ariaLabel="" />
      </label>
      <div className="mb-8 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-6 md:mb-10">
        {languageFilterEnabled && (
          <Select
            label={t("ln.language")}
            initialValue={language}
            valueChange={(val) => setLanguage(val)}
            options={[
              { id: "", labelText: t("ln.search.all-languages") },
              ...languages,
            ]}
          />
        )}

        {typesFilterEnabled && (
          <Select
            label={t("ln.type")}
            initialValue={type}
            valueChange={(val) => setType(val)}
            options={[
              { id: "", labelText: t("ln.search.all-types") },
              ...mediaTypes,
            ]}
          />
        )}

        {categoriesFilterEnabled && (
          <Select
            label={t("ln.category")}
            initialValue={category}
            valueChange={(val) => setCategory(val)}
            options={[
              { id: "", labelText: t("ln.search.all-categories") },
              ...categories,
            ]}
          />
        )}
      </div>
    </>
  )
}
