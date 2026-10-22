import { z } from "astro/zod"
import YAML from "yaml"

import { lazy } from "../utils/lazy"
import { writeStaleTranslationOverrides } from "./record-translation"

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

const translationFileSchema = z.record(z.string(), z.string())

const userTranslationFiles = import.meta.glob<string>(
  ["/src/translations/*.(yml|yaml)"],
  { query: "?raw", import: "default" },
)

const userTranslations = Object.fromEntries(
  Object.entries(userTranslationFiles).map(([path, translationImport]) => {
    const [fileName] = path.split("/").slice(-1)
    const lang = fileName.replace(/\.ya?ml/, "")
    return [lang, translationImport]
  }),
)

const staleOverrides = lazy(async () => {
  const english = await loadBuiltInTranslations(builtInTranslations, "en")
  await writeStaleTranslationOverrides(
    await findStaleTranslationOverrides(english, userTranslationFiles),
  )
})

export async function findStaleTranslationOverrides(
  english: Record<string, string>,
  files: Record<string, () => Promise<string>>,
) {
  const overrides: { key: string; path: string }[] = []
  for (const [path, load] of Object.entries(files)) {
    const translations = translationFileSchema.parse(YAML.parse(await load()))
    for (const key of Object.keys(translations)) {
      if (key.startsWith("ln.") && !Object.hasOwn(english, key)) {
        overrides.push({ key, path: path.replace(/^\//, "") })
      }
    }
  }
  return overrides
}

export const loadTranslations = async (bcp47: string) => {
  if (import.meta.env.PROD) {
    await staleOverrides.get()
  }
  return {
    ...(await loadBuiltInTranslations(builtInTranslations, bcp47)),
    ...(await loadUserTranslations(bcp47)),
  }
}

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
  return translationFileSchema.parse(YAML.parse(yml))
}

const loadUserTranslations = async (bcp47: string) => {
  if (!userTranslations[bcp47]) {
    return {}
  }
  const yml = (await userTranslations[bcp47]()) as string
  return translationFileSchema.parse(YAML.parse(yml))
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
  | "ln.select-language"
  | "ln.home.title"
  | "ln.search.all-categories"
  | "ln.search.all-languages"
  | "ln.search.all-types"
  | "ln.search.no-results"
  | "ln.search.placeholder"
  | "ln.search.title"
  | "ln.share.url-copied-to-clipboard"
  | "ln.footer.powered-by-lightnet"
