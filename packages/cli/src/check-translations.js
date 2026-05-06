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
  console.log("translation count", translations.length, languages)
  return true
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
