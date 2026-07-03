// @ts-check

import { spawn } from "node:child_process"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { cwd } from "node:process"

import { confirm, intro, log, outro, taskLog } from "@clack/prompts"

/**
 * @typedef {{
 * type: "lightnet" | "user" | "map"
 * key: string
 * values: Record<string, string | undefined>
 * }} Translation
 */

/**
 * @typedef {{
 *  defaultLocale: string
 *  locales: string[]
 * }} Languages
 */

const lightnetCachePath = resolve(cwd(), "node_modules", ".cache", "lightnet")

/** @type {{type:Translation["type"], title:string, action:string}[]} */
const translationSources = [
  {
    type: "lightnet",
    title: "Missing LightNet built-in translations",
    action: "Add the missing entries in your /src/translations/*.yaml files.",
  },
  {
    type: "user",
    title: "Incomplete user translations",
    action: "Add the missing entries in your /src/translations/*.yaml files.",
  },
  {
    type: "map",
    title: "Incomplete inline translation maps",
    action:
      "Update the inline translation map to include values for every configured site language.",
  },
]

export async function checkTranslations() {
  intro("check-translations")

  const buildAvailable = await runBuild()
  if (!buildAvailable) {
    outro("Build failed. 🚧")
    return false
  }
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
    outro("No issues found. 🎉")
    return true
  }

  const grouped = Object.groupBy(
    incompleteTranslations,
    (translation) => translation.type,
  )

  log.error("Translation check failed")
  for (const source of translationSources) {
    printMissingTranslations(source, grouped[source.type])
  }

  outro("Issues found. 🚧")

  return false
}

async function runBuild() {
  const shouldRunBuild = await confirm({
    message:
      "Run pnpm build now? Command requires an up-to-date dist/ directory.",
    initialValue: false,
  })
  if (!shouldRunBuild) {
    return true
  }
  const buildLog = taskLog({
    title: "Running pnpm build",
  })

  const child = spawn("pnpm", ["build"], {
    shell: process.platform === "win32",
  })

  child.stdout?.setEncoding("utf8")
  child.stderr?.setEncoding("utf8")

  child.stdout?.on("data", (chunk) => {
    for (const line of chunk.trimEnd().split("\n")) {
      if (line) {
        buildLog.message(line)
      }
    }
  })

  child.stderr?.on("data", (chunk) => {
    for (const line of chunk.trimEnd().split("\n")) {
      if (line) {
        buildLog.message(line)
      }
    }
  })

  try {
    await new Promise((resolve, reject) => {
      child.on("error", reject)

      child.on("close", (code) => {
        if (code === 0) {
          resolve(0)
        } else {
          reject(new Error(`pnpm build failed with exit code ${code}`))
        }
      })
    })
    buildLog.success("Build completed")
    return true
  } catch (e) {
    buildLog.message(`${e}`)
    buildLog.error("pnpm build failed")
    return false
  }
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

  log.warn(source.title)
  translations
    .toSorted(
      (t1, t2) =>
        t2.missingLocales.length - t1.missingLocales.length ||
        t1.key.localeCompare(t2.key),
    )
    .forEach(({ key, missingLocales }) => {
      log.message(`· ${key} > Missing: ${missingLocales.join(", ")}`)
    })

  log.message(`Action: ${source.action}`)
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
    log.error("No translation build cache found.")
    log.error("Action: Run build and try lightnet check-translations again.")
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
    log.error("No language manifest found from the last build.")
    log.error("Action: Run build and try lightnet check-translations again.")
    return undefined
  }
}
