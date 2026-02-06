import YAML from "yaml"

const builtInTranslations = {
  ar: () => import("./translations/ar.yaml?raw"),
  bn: () => import("./translations/bn.yaml?raw"),
  de: () => import("./translations/de.yaml?raw"),
  en: () => import("./translations/en.yaml?raw"),
  es: () => import("./translations/es.yaml?raw"),
  fi: () => import("./translations/fi.yaml?raw"),
  fr: () => import("./translations/fr.yaml?raw"),
  hi: () => import("./translations/hi.yaml?raw"),
  kk: () => import("./translations/kk.yaml?raw"),
  pt: () => import("./translations/pt.yaml?raw"),
  ru: () => import("./translations/ru.yaml?raw"),
  uk: () => import("./translations/uk.yaml?raw"),
  ur: () => import("./translations/ur.yaml?raw"),
  zh: () => import("./translations/zh.yaml?raw"),
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
  ...(await loadBuiltInTranslations(builtInTranslations, bcp47)),
  ...(await loadUserTranslations(bcp47)),
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

const loadUserTranslations = async (bcp47: string) => {
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
