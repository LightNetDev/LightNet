import { useRef } from "react"

import Icon from "../../../components/Icon"
import { useDebounce } from "../hooks/use-debounce"
import { useSearchQueryParam } from "../hooks/use-search-query-param"
import type {
  TranslationKey,
  Translations,
} from "../utils/search-filter-translations"
import { CATEGORY, LANGUAGE, SEARCH, TYPE } from "../utils/search-query"
import Select from "./Select"

type FilterValue = { id: string; name: string }

interface Props {
  languages: FilterValue[]
  categories: FilterValue[]
  mediaTypes: FilterValue[]
  translations: Translations
  languageFilterEnabled: boolean
  typesFilterEnabled: boolean
  categoriesFilterEnabled: boolean
  initialLanguage?: string
}

export default function SearchFilter({
  categories,
  mediaTypes,
  translations,
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

  const t = (key: TranslationKey) => translations[key]

  const debouncedSetSearch = useDebounce((value: string) => {
    setSearch(value)
  }, 300)

  return (
    <>
      <label className="dy-input dy-input-bordered mb-2 flex items-center gap-2 rounded-2xl">
        <input
          type="search"
          className="grow placeholder-gray-500"
          name="search"
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
            label={t("ln.language")}
            initialValue={language}
            valueChange={(val) => setLanguage(val)}
            options={[
              { id: "", name: t("ln.search.all-languages") },
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
              { id: "", name: t("ln.search.all-types") },
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
              { id: "", name: t("ln.search.all-categories") },
              ...categories,
            ]}
          />
        )}
      </div>
    </>
  )
}
