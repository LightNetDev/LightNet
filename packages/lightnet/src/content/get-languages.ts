import { getTranslatedLanguages } from "../i18n/resolve-language"
import type { TranslateConfigFieldFn } from "../i18n/translate-map"
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
  tConfigField: TranslateConfigFieldFn,
) => {
  const contentLanguages = await contentLanguagesLoader.get()
  return (await getTranslatedLanguages(currentLocale, tConfigField)).filter(
    ({ code }) => contentLanguages.has(code),
  )
}
