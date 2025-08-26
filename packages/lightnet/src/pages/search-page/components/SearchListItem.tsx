import CoverImageDecorator from "../../../components/CoverImageDecorator"
import Icon from "../../../components/Icon"
import { detailsPagePath } from "../../../utils/paths"
import type { SearchItem } from "../../api/search-response"

export type MediaType = {
  name: string
  icon: string
  coverImageStyle: "default" | "book"
}

export type TranslatedLanguage = {
  name: string
  direction: "rtl" | "ltr"
}

interface Props {
  item: SearchItem
  currentLocale: string | undefined
  direction: "rtl" | "ltr"
  categories: Record<string, string>
  languages: Record<string, TranslatedLanguage>
  showLanguage: boolean
  mediaTypes: Record<string, MediaType>
}

export default function SearchListItem({
  item,
  currentLocale,
  categories,
  languages,
  direction,
  showLanguage,
  mediaTypes,
}: Props) {
  return (
    <a
      href={detailsPagePath(currentLocale, {
        id: item.id,
      })}
      lang={item.language}
      className="group flex h-52 overflow-hidden py-2 transition-colors ease-in-out sm:h-64 md:rounded-sm md:hover:bg-gray-100"
    >
      <div className="flex h-full w-36 shrink-0 flex-col items-start justify-center">
        <CoverImageDecorator style={mediaTypes[item.type].coverImageStyle}>
          <img
            className="max-h-40 w-auto max-w-36 rounded-sm object-contain shadow-md"
            src={item.image.src}
            width={item.image.width}
            height={item.image.height}
            alt=""
            decoding="async"
            loading="eager"
          />
        </CoverImageDecorator>
      </div>

      <div className="ms-5 flex grow flex-col justify-center text-xs sm:ms-8">
        <h2 className="mb-1 line-clamp-2 text-balance text-sm font-bold text-gray-700 md:mb-3 md:text-base">
          <Icon
            className={`${mediaTypes[item.type].icon} me-2 align-bottom text-2xl text-gray-700`}
            ariaLabel={mediaTypes[item.type].name}
          />
          <span>{item.title}</span>
        </h2>
        <div className="flex flex-col flex-wrap items-start gap-2 sm:mb-3 md:flex-row md:items-center md:gap-3">
          {!!item.authors?.length && (
            <p className="mb-1 line-clamp-2 sm:line-clamp-1 md:mb-0 md:text-base">
              {item.authors.join(", ")}
            </p>
          )}
          {showLanguage && (
            <span className="rounded-lg border border-gray-300 px-2 py-1 text-gray-500">
              {languages[item.language].name}
            </span>
          )}
          <ul
            lang={currentLocale}
            className="flex max-h-14 flex-wrap gap-1 overflow-hidden sm:max-h-6"
          >
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
            className="line-clamp-3 max-w-screen-sm text-xs"
            lang={item.language}
            dir={languages[item.language].direction}
          >
            {item.description}
          </p>
        </div>
      </div>
      <Icon
        className="mdi--chevron-right md:group-hover:text-primary my-auto me-4 ms-2 hidden shrink-0 text-2xl text-gray-300 sm:block"
        flipIcon={direction === "rtl"}
        ariaLabel=""
      />
    </a>
  )
}
