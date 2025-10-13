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
  zh: () => import("./translations/zh.yml?raw"),
} as const

type BuiltInLanguage = keyof typeof builtInTranslations

const userTranslations = Object.fromEntries(
  Object.entries(
    import.meta.glob(["/src/translations/*.(yml|yaml)"], {
      query: "?raw",
      import: "default",
    }),
  ).map(([path, translationImport]) => {
    const [fileName] = path.split("/").slice(-1)
    const lang = fileName.replace(/\.ya?ml/, "")
    return [lang, translationImport]
  }),
)

export const loadTranslations = async (bcp47: string) => ({
  ...(await loadBuiltInTranslations(bcp47)),
  ...(await loadUserTranslations(bcp47)),
})

function isBuiltInLanguage(bcp47: string): bcp47 is BuiltInLanguage {
  return Object.hasOwn(builtInTranslations, bcp47)
}

export const loadBuiltInTranslations = async (bcp47: string) => {
  if (!isBuiltInLanguage(bcp47)) {
    return {}
  }
  const yml = (await builtInTranslations[bcp47]()).default
  return YAML.parse(yml)
}

export const loadUserTranslations = async (bcp47: string) => {
  if (!userTranslations[bcp47]) {
    return {}
  }
  const yml = (await userTranslations[bcp47]()) as string
  return YAML.parse(yml)
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
