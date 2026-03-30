import { resolveLanguage } from "../i18n/resolve-language"
import type { TranslateMapFn } from "../i18n/translate-map"
import { lazy } from "../utils/lazy"
import { getMediaItems } from "./get-media-items"

type ResolvedLanguage = Awaited<ReturnType<typeof resolveLanguage>>

/**
 * Array of distinct content languages.
 */
const contentLanguages = lazy(async () => {
  const languagesByCode = Object.fromEntries(
    await Promise.all(
      (await getMediaItems()).map(async ({ data: { language } }) => [
        language,
        resolveLanguage(language),
      ]),
    ),
  )
  return Object.values(languagesByCode) as ResolvedLanguage[]
})

export const getUsedLanguages = async (
  currentLocale: string,
  tMap: TranslateMapFn,
) => {
  return (await contentLanguages.get())
    .map((language) => ({
      ...language,
      labelText: tMap(language.label, {
        path: ["languages", language.code, "label"],
      }),
    }))
    .sort((a, b) => a.labelText.localeCompare(b.labelText, currentLocale))
}
