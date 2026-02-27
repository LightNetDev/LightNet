import { resolveLanguage } from "../i18n/resolve-language"
import type { TranslateFn } from "../i18n/translate"
import { getMediaItems } from "./get-media-items"

/**
 * Array of distinct content languages.
 */
export const contentLanguages = Object.values(
  Object.fromEntries(
    (await getMediaItems()).map(({ data: { language } }) => [
      language,
      resolveLanguage(language),
    ]),
  ),
)

export const getUsedLanguages = async (
  currentLocale: string,
  t: TranslateFn,
) => {
  return contentLanguages
    .map((language) => ({
      ...language,
      labelText: t(language.label),
    }))
    .sort((a, b) => a.labelText.localeCompare(b.labelText, currentLocale))
}
