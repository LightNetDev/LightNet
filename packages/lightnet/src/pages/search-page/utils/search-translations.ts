const translationKeys = [
  "ln.search.no-results",
  "ln.search.more-results",
] as const

export type TranslationKey = (typeof translationKeys)[number]

export type Translations = Record<TranslationKey, string>

export const provideTranslations = (translate: (key: string) => string) => {
  return Object.fromEntries(
    translationKeys.map((key) => [key, translate(key)]),
  ) as Translations
}
