import { getTranslatedLanguages } from "../i18n/resolve-language"
import type { TranslateMapFn } from "../i18n/translate-map"
import { lazy } from "../utils/lazy"
import { getMediaItems } from "./get-media-items"

/**
 * Distinct language codes referenced by media items.
 */
const contentLanguagesLoader = lazy(
  async () =>
    new Set((await getMediaItems()).map(({ data: { language } }) => language)),
)

export const getContentLanguages = async (
  currentLocale: string,
  tMap: TranslateMapFn,
) => {
  const contentLanguages = await contentLanguagesLoader.get()
  return (await getTranslatedLanguages(currentLocale, tMap)).filter(
    ({ code }) => contentLanguages.has(code),
  )
}
