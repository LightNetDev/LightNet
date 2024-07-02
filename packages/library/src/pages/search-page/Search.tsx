import { useEffect } from "preact/hooks"

import ResultList from "./components/ResultList"
import SearchFilter from "./components/SearchFilter"
import { useSearch } from "./hooks/use-search"
import type { MediaType } from "./utils/media-type"
import type { Translations } from "./utils/search-translations"
import { useProvidedTranslations } from "./utils/use-provided-translations"

export default function ({
  locale,
  contentLanguages,
  categories,
  mediaTypes,
  translations,
}: {
  locale: string | undefined
  contentLanguages: Record<string, string>
  categories: Record<string, string>
  translations: Translations
  mediaTypes: MediaType[]
}) {
  const { results, updateQuery, isLoading } = useSearch()
  const t = useProvidedTranslations(translations)

  // restore scroll position after back navigation
  useEffect(() => {
    const { state } = history
    if (!isLoading && state?.scrollY) {
      window.scrollTo(0, state.scrollY)
    }
  }, [isLoading])

  return (
    <>
      <div class="px-4 md:px-8">
        <h1 class="mb-4 mt-8 text-4xl md:mb-8 md:mt-12 md:text-5xl">
          {t("ln.search.title")}
        </h1>
        <SearchFilter
          contentLanguages={contentLanguages}
          mediaTypes={mediaTypes}
          translations={translations}
          categories={categories}
          updateQuery={updateQuery}
        />
      </div>

      <ResultList
        items={results}
        locale={locale}
        translations={translations}
        categories={categories}
        mediaTypes={mediaTypes}
        contentLanguages={contentLanguages}
      />
      {!results.length && !isLoading && (
        <div class="mt-24 text-center font-bold text-gray-500">
          {t("ln.search.no-results")}
        </div>
      )}
    </>
  )
}
