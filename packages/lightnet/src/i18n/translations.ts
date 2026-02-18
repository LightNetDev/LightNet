import config from "virtual:lightnet/config"
import YAML from "yaml"

const builtInTranslations = {
  ar: () => import("./translations/ar.yml?raw"),
  bn: () => import("./translations/bn.yml?raw"),
  de: () => import("./translations/de.yml?raw"),
  en: () => import("./translations/en.yml?raw"),
  es: () => import("./translations/es.yml?raw"),
  fi: () => import("./translations/fi.yml?raw"),
  fr: () => import("./translations/fr.yml?raw"),
  hi: () => import("./translations/hi.yml?raw"),
  kk: () => import("./translations/kk.yml?raw"),
  pt: () => import("./translations/pt.yml?raw"),
  ru: () => import("./translations/ru.yml?raw"),
  uk: () => import("./translations/uk.yml?raw"),
  ur: () => import("./translations/ur.yml?raw"),
  zh: () => import("./translations/zh.yml?raw"),
} as const

type BuiltInLanguage = keyof typeof builtInTranslations

export const loadTranslations = async (bcp47: string) => ({
  ...(await loadBuiltInTranslations(builtInTranslations, bcp47)),
  ...loadUserTranslations(bcp47),
})

function hasTranslations(
  translationMap: Record<string, unknown>,
  bcp47: string,
): bcp47 is BuiltInLanguage {
  return Object.hasOwn(translationMap, bcp47)
}

const loadBuiltInTranslations = async (
  translationMap: Record<string, () => Promise<typeof import("*?raw")>>,
  bcp47: string,
) => {
  if (!hasTranslations(translationMap, bcp47)) {
    return {}
  }
  const yml = (await translationMap[bcp47]()).default
  return YAML.parse(yml)
}

const loadUserTranslations = (bcp47: string) => {
  return config.translations[bcp47] ?? {}
}

export type LightNetTranslationKey =
  | "ln.404.go-to-the-home-page"
  | "ln.404.page-not-found"
  | "ln.category"
  | "ln.categories"
  | "ln.language"
  | "ln.languages"
  | "ln.external-link"
  | "ln.type"
  | "ln.previous"
  | "ln.next"
  | "ln.details.open"
  | "ln.details.share"
  | "ln.details.part-of-collection"
  | "ln.details.download"
  | "ln.header.open-main-menu"
  | "ln.header.select-language"
  | "ln.home.title"
  | "ln.search.all-categories"
  | "ln.search.all-languages"
  | "ln.search.all-types"
  | "ln.search.no-results"
  | "ln.search.placeholder"
  | "ln.search.title"
  | "ln.share.url-copied-to-clipboard"
  | "ln.footer.powered-by-lightnet"
