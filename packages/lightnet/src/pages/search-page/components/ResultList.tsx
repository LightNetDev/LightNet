import { useMemo, useState } from "react"

import Icon from "../../../components/Icon"
import { detailsPagePath } from "../../../utils/paths"
import type { SearchItem } from "../../api/search-response"
import type { MediaType, TranslatedLanguage } from "../types"
import type { Translations } from "../utils/search-translations"
import { useProvidedTranslations } from "../utils/use-provided-translations"

const PAGE_SIZE = 30

interface Props {
  items: SearchItem[]
  locale: string | undefined
  translations: Translations
  categories: Record<string, string>
  contentLanguages: TranslatedLanguage[]
  direction: "rtl" | "ltr"
  mediaTypes: MediaType[]
}

export default function ResultList({
  items,
  locale,
  categories,
  translations,
  contentLanguages,
  direction,
  mediaTypes,
}: Props) {
  const [maxItems, setMaxItems] = useState(15)
  const t = useProvidedTranslations(translations)

  const types = useMemo(
    () =>
      Object.fromEntries(
        mediaTypes.map(({ id, icon, label }) => [id, { icon, label }]),
      ),
    [mediaTypes],
  )
  const languages = useMemo(
    () => Object.fromEntries(contentLanguages.map((lang) => [lang.code, lang])),
    [contentLanguages],
  )

  return (
    <>
      <ol className={`divide-y divide-gray-200 px-4 md:px-8`}>
        {items.slice(0, maxItems).map((item) => (
          <li key={item.id} lang={item.language}>
            <a
              href={detailsPagePath(locale, {
                id: item.id,
              })}
              className="md:rounded-xs group flex overflow-hidden py-6 transition-colors ease-in-out hover:bg-gray-100 md:py-10"
            >
              <div className="flex h-36 w-36 shrink-0 flex-col items-start justify-center">
                <img
                  className="rounded-xs max-h-36 w-auto max-w-36 object-contain shadow-md"
                  src={item.image.src}
                  width={item.image.width}
                  height={item.image.height}
                  alt=""
                  decoding="async"
                  loading="lazy"
                />
              </div>

              <div className="ms-5 flex grow flex-col justify-center text-xs sm:ms-8">
                <h2 className="mb-1 line-clamp-3 text-sm font-bold text-gray-700 md:mb-3 md:text-base">
                  <Icon
                    className={`${types[item.type].icon} me-2 align-bottom text-2xl text-gray-700`}
                    ariaLabel={types[item.type].label}
                  />
                  <span>{item.title}</span>
                </h2>
                <div className="mb-3 flex flex-col flex-wrap items-start gap-2 md:flex-row md:items-center md:gap-3">
                  {!!item.authors?.length && (
                    <p className="mb-1 md:mb-0 md:text-base">
                      {item.authors.join(", ")}
                    </p>
                  )}
                  {contentLanguages.length > 1 && (
                    <span className="rounded-lg border border-gray-300 px-2 py-1 text-gray-500">
                      {languages[item.language].name}
                    </span>
                  )}
                  <ul lang={locale} className="flex flex-wrap gap-1">
                    {item.categories?.map((category) => (
                      <li
                        key={category}
                        className="rounded-lg bg-gray-200 px-2 py-1 text-gray-600"
                      >
                        {categories[category]}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="hidden sm:block">
                  <p
                    className="line-clamp-3 max-w-screen-sm text-xs text-gray-500"
                    lang={item.language}
                    dir={languages[item.language].direction}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
              <Icon
                className="mdi--chevron-right group-hover:text-primary my-auto me-4 ms-2 hidden shrink-0 text-2xl text-gray-300 sm:block"
                flipIcon={direction === "rtl"}
                ariaLabel=""
              />
            </a>
          </li>
        ))}
      </ol>
      {items.length > maxItems && (
        <div className="mt-8 flex flex-col px-4 md:px-8">
          <div className="dy-divider">
            <button
              type="button"
              className="dy-btn text-gray-700"
              onClick={() => setMaxItems(maxItems + PAGE_SIZE)}
            >
              {t("ln.search.more-results")}
              <Icon className="mdi--chevron-down" ariaLabel="" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
