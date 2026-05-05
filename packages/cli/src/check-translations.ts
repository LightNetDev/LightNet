import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { cwd } from "node:process"

type Translation = {
  type: "built-in" | "user" | "map"
  key: string
  values: Record<string, string | undefined>
}

type Languages = {
  defaultLocale: string
  locales: string[]
}

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

async function readTranslations() {
  try {
    const translationsText = await readFile(
      resolve(lightnetCachePath, "translations.jsonl"),
      "utf-8",
    )
    return translationsText
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line) as Translation)
  } catch {
    console.error(
      "Can not read translations from last build, make sure to run `npm run build` before running this command.",
    )
    return undefined
  }
}

async function readLanguages() {
  try {
    const languagesText = await readFile(
      resolve(lightnetCachePath, "languages.json"),
      "utf-8",
    )
    return JSON.parse(languagesText) as Languages
  } catch {
    console.error(
      "Can not read languages from last build, make sure to run `npm run build` before running this command.",
    )
    return undefined
  }
}
