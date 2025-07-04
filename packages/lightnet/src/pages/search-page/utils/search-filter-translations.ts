const translationKeys = [
  "ln.search.title",
  "ln.language",
  "ln.search.placeholder",
  "ln.search.all-languages",
  "ln.type",
  "ln.search.all-types",
  "ln.category",
  "ln.search.all-categories",
] as const

export type TranslationKey = (typeof translationKeys)[number]

export type Translations = Record<TranslationKey, string>

export const provideTranslations = (translate: (key: string) => string) => {
  return Object.fromEntries(
    translationKeys.map((key) => [key, translate(key)]),
  ) as Translations
}
