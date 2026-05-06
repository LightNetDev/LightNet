// @ts-check

import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { cwd } from "node:process"

const lightnetCachePath = resolve(cwd(), "node_modules", ".cache", "lightnet")

/** @type {{type:Translation["type"], title:string, action:string}[]} */
const translationSources = [
  {
    type: "lightnet",
    title: "LightNet built-in translations",
    action: "Add the missing entries in your /src/translations/*.yaml files.",
  },
  {
    type: "user",
    title: "User translation files",
    action: "Add the missing entries in your /src/translations/*.yaml files.",
  },
  {
    type: "map",
    title: "Inline translation maps",
    action:
      "Update the inline translation map to include values for every configured site language.",
  },
]

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

  console.log("Translation check failed")
  for (const source of translationSources) {
    printMissingTranslations(source, grouped[source.type])
  }

  console.log("\n\n")
  return false
}

/**
 *
 * @param {{title:string, action:string}} source
 * @param {(Translation & {missingLocales:string[]})[]|undefined} translations
 */
function printMissingTranslations(source, translations) {
  if (!translations || translations.length === 0) {
    return
  }

  console.log()
  console.log(source.title)
  translations
    .toSorted(
      (t1, t2) =>
        t2.missingLocales.length - t1.missingLocales.length ||
        t1.key.localeCompare(t2.key),
    )
    .forEach(({ key, missingLocales }) => {
      console.log(`- ${key}`)
      console.log(`  Missing locales: ${missingLocales.join(", ")}`)
    })

  console.log(`Action: ${source.action}`)
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
    console.error("No translation build cache found.")
    console.error(
      "Action: Run build and try lightnet check-translations again.",
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
    console.error("No language manifest found from the last build.")
    console.error(
      "Action: Run build and try lightnet check-translations again.",
    )
    return undefined
  }
}
