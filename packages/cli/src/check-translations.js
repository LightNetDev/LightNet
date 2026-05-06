// @ts-check

import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { cwd } from "node:process"

const lightnetCachePath = resolve(cwd(), "node_modules", ".cache", "lightnet")

export async function checkTranslations() {
  const translations = await readTranslations()
  const languages = await readLanguages()
  if (!translations || !languages || translations.length === 0) {
    return false
  }
  const incompleteTranslations = translations
    .map((translation) => ({
      ...translation,
      missingLocales: getMissingLocales(translation, languages),
    }))
    .filter((translation) => translation.missingLocales.length > 0)

  if (incompleteTranslations.length === 0) {
    return true
  }

  const grouped = Object.groupBy(
    incompleteTranslations,
    (translation) => translation.type,
  )

  console.log("Translations are missing inside last build")

  printMissingTranslations("LightNet built-in translations", grouped.lightnet)
  printMissingTranslations(
    "User defined translation files from /src/translations/*.yaml",
    grouped.user,
  )
  printMissingTranslations("Inline translation maps", grouped.map)

  console.log("translation count", translations.length, languages)
  return false
}

/**
 *
 * @param {string} title
 * @param {(Translation & {missingLocales:string[]})[]|undefined} translations
 */
function printMissingTranslations(title, translations) {
  if (!translations || translations.length === 0) {
    return
  }
  console.log()
  console.log(title)
  translations
    .toSorted((t1, t2) => t1.key.localeCompare(t2.key))
    .forEach(({ key, missingLocales }) =>
      console.log(`- ${key}: ${missingLocales.join(", ")}`),
    )
  console.log()
}

/**
 *
 * @param {Translation} translation
 * @param {Languages} languages
 * @returns {string[]}
 */
function getMissingLocales(translation, languages) {
  return languages.locales.filter((locale) => !translation.values[locale])
}

/**
 * @returns {Promise<Translation[]|undefined>}
 */
async function readTranslations() {
  try {
    const translationsText = await readFile(
      resolve(lightnetCachePath, "translations.jsonl"),
      "utf-8",
    )
    return translationsText
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line))
  } catch {
    console.error(
      "Can not read translations from last build, make sure to run `npm run build` before running this command.",
    )
    return undefined
  }
}

/**
 * @returns {Promise<Languages|undefined>}
 */
async function readLanguages() {
  try {
    const languagesText = await readFile(
      resolve(lightnetCachePath, "languages.json"),
      "utf-8",
    )
    return JSON.parse(languagesText)
  } catch {
    console.error(
      "Can not read languages from last build, make sure to run `npm run build` before running this command.",
    )
    return undefined
  }
}
