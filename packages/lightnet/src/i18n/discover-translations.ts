import { readdir, readFile } from "node:fs/promises"
import { dirname, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import YAML from "yaml"

import type { ExtendedLightnetConfig } from "../astro-integration/config"
import { isTranslationDiscoveryEnabled } from "./discovery-mode"
import { recordTranslation } from "./record-translation"
import { setTranslationProvenance } from "./translation-provenance"

const packageRoot = dirname(fileURLToPath(import.meta.url))

const translationFileSchema = {
  parse(value: unknown) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(
        "Expected translation YAML to contain a flat key-value map.",
      )
    }

    const entries = Object.entries(value)
    if (
      entries.some(
        ([key, innerValue]) =>
          typeof key !== "string" || typeof innerValue !== "string",
      )
    ) {
      throw new Error(
        "Expected translation YAML to contain only string values.",
      )
    }

    return Object.fromEntries(entries) as Record<string, string>
  },
}

const loadYamlFile = async (filePath: string) =>
  translationFileSchema.parse(YAML.parse(await readFile(filePath, "utf-8")))

const tryLoadYamlFile = async (filePaths: string[]) => {
  for (const filePath of filePaths) {
    try {
      return await loadYamlFile(filePath)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        continue
      }
      throw error
    }
  }

  return {}
}

const loadDiscoveryBuiltInTranslationFile = async (locale: string) =>
  tryLoadYamlFile([
    resolve(packageRoot, "translations", `${locale}.yml`),
    resolve(packageRoot, "translations", `${locale}.yaml`),
  ])

const getDiscoveryUserTranslationLocales = async () => {
  try {
    const entries = await readdir(resolve(process.cwd(), "src", "translations"))
    return entries
      .filter((entry) => /\.ya?ml$/.test(entry))
      .map((entry) => entry.replace(/\.ya?ml$/, ""))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return []
    }
    throw error
  }
}

const loadDiscoveryUserTranslationFile = async (locale: string) =>
  tryLoadYamlFile([
    resolve(process.cwd(), "src", "translations", `${locale}.yml`),
    resolve(process.cwd(), "src", "translations", `${locale}.yaml`),
  ])

const isInlineTranslationMap = (
  value: unknown,
  locales: string[],
): value is Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const entries = Object.entries(value)
  if (!entries.length) {
    return false
  }

  const localeKeys = entries.filter(([key]) => locales.includes(key))
  if (!localeKeys.length) {
    return false
  }

  return entries.every(
    ([key, innerValue]) =>
      locales.includes(key) && typeof innerValue === "string",
  )
}

export const walkInlineTranslations = (
  value: unknown,
  locales: string[],
  sourceFile: string,
  path: string[] = [],
) => {
  if (!value || typeof value !== "object") {
    return
  }

  if (isInlineTranslationMap(value, locales)) {
    const translationMap = setTranslationProvenance(value, {
      sourceFile,
      objectPath: path,
    })
    recordTranslation({
      type: "inline",
      key: path.join("."),
      values: translationMap,
      sourceFile,
      objectPath: path,
    })
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      walkInlineTranslations(item, locales, sourceFile, [...path, `${index}`]),
    )
    return
  }

  for (const [key, child] of Object.entries(value)) {
    walkInlineTranslations(child, locales, sourceFile, [...path, key])
  }
}

export const discoverConfigTranslations = (config: ExtendedLightnetConfig) => {
  if (!isTranslationDiscoveryEnabled()) {
    return
  }

  walkInlineTranslations(config, config.locales, "astro.config")
}

const contentCollectionDirectories = {
  categories: resolve(process.cwd(), "src", "content", "categories"),
  media: resolve(process.cwd(), "src", "content", "media"),
  "media-collections": resolve(
    process.cwd(),
    "src",
    "content",
    "media-collections",
  ),
  "media-types": resolve(process.cwd(), "src", "content", "media-types"),
} as const

const readJsonFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true })
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(directory, entry.name)

      if (entry.isDirectory()) {
        return readJsonFiles(entryPath)
      }

      if (entry.isFile() && entry.name.endsWith(".json")) {
        return [entryPath]
      }

      return []
    }),
  )

  return paths.flat()
}

const recordBuiltInTranslations = async (locales: string[]) => {
  const canonicalTranslations = await loadDiscoveryBuiltInTranslationFile("en")
  const localeValues: [string, Record<string, string>][] = await Promise.all(
    ["en", ...locales.filter((locale) => locale !== "en")].map(
      async (locale): Promise<[string, Record<string, string>]> => [
        locale,
        await loadDiscoveryBuiltInTranslationFile(locale),
      ],
    ),
  )

  for (const key of Object.keys(canonicalTranslations)) {
    recordTranslation({
      type: "built-in",
      key,
      values: Object.fromEntries(
        localeValues.map(([locale, translations]) => [
          locale,
          translations[key],
        ]),
      ),
    })
  }
}

const recordUserTranslations = async (
  defaultLocale: string,
  locales: string[],
) => {
  const availableLocales = new Set(await getDiscoveryUserTranslationLocales())

  if (!availableLocales.has(defaultLocale)) {
    throw new Error(
      `Missing default translation file for locale "${defaultLocale}" under src/translations/.`,
    )
  }

  const canonicalTranslations =
    await loadDiscoveryUserTranslationFile(defaultLocale)
  const localeValues: [string, Record<string, string>][] = await Promise.all(
    locales.map(
      async (locale): Promise<[string, Record<string, string>]> => [
        locale,
        availableLocales.has(locale)
          ? await loadDiscoveryUserTranslationFile(locale)
          : {},
      ],
    ),
  )

  for (const key of Object.keys(canonicalTranslations)) {
    recordTranslation({
      type: "user",
      key,
      values: Object.fromEntries(
        localeValues.map(([locale, translations]) => [
          locale,
          translations[key],
        ]),
      ),
    })
  }
}

const recordCollectionTranslations = async (locales: string[]) => {
  for (const directory of Object.values(contentCollectionDirectories)) {
    const filePaths = await readJsonFiles(directory)

    for (const filePath of filePaths) {
      const sourceFile = relative(process.cwd(), filePath)
      const content = JSON.parse(await readFile(filePath, "utf-8"))
      walkInlineTranslations(content, locales, sourceFile)
    }
  }
}

export const discoverBuildTranslations = async (
  config: ExtendedLightnetConfig,
) => {
  if (!isTranslationDiscoveryEnabled()) {
    return
  }

  await recordBuiltInTranslations(config.locales)
  await recordUserTranslations(config.defaultLocale, config.locales)
  await recordCollectionTranslations(config.locales)
}
