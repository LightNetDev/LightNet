const translationKeys = [
  "ln.search.no-results",
  "ln.search.title",
  "ln.language_one",
  "ln.search.placeholder",
  "ln.search.all-languages",
  "ln.type",
  "ln.search.all-types",
  "ln.category_one",
  "ln.search.all-categories",
  "ln.search.more-results",
] as const

export type TranslationKey = (typeof translationKeys)[number]

export type Translations = Record<TranslationKey, string>

export const provideTranslations = (translate: (key: string) => string) => {
  return Object.fromEntries(
    translationKeys.map((key) => [key, translate(key)]),
  ) as Translations
}
