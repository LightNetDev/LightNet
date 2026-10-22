// @ts-check

import { spawn } from "node:child_process"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { cwd, stdin, stdout } from "node:process"

import { confirm, intro, isCancel, log, outro, taskLog } from "@clack/prompts"

import { cancelPrompt } from "./support/prompt-cancel.js"

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

/**
 * @typedef {{
 *   build?: boolean
 *   exclude?: string[]
 * }} CheckTranslationsOptions
 */

/**
 * @typedef {{
 *   cwd?: string
 *   isInteractive?: boolean
 *   promptRunBuild?: () => Promise<boolean>
 *   write?: (message: string) => void
 * }} CheckTranslationsRuntime
 */

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

/**
 * @param {CheckTranslationsOptions} [options]
 * @param {CheckTranslationsRuntime} [runtime]
 */
export async function checkTranslations(options = {}, runtime = {}) {
  const lightnetCachePath = resolve(
    runtime.cwd ?? cwd(),
    "node_modules",
    ".cache",
    "lightnet",
  )
  const interactive =
    runtime.isInteractive ?? Boolean(stdin.isTTY && stdout.isTTY)
  const output = createOutput(interactive, runtime.write)

  output.intro("check-translations")

  const buildAvailable = await runBuild(options.build, {
    interactive,
    output,
    promptRunBuild: runtime.promptRunBuild,
  })
  if (!buildAvailable) {
    output.outro("Build failed. 🚧")
    return false
  }

  const translations = await readTranslations(lightnetCachePath, output)
  const languages = await readLanguages(lightnetCachePath, output)
  const staleOverrides = await readStaleOverrides(lightnetCachePath)
  if (staleOverrides.length > 0) {
    output.warn("Stale LightNet translation overrides")
    for (const { key, path } of staleOverrides.toSorted(
      (a, b) => a.key.localeCompare(b.key) || a.path.localeCompare(b.path),
    )) {
      output.message(`• ${key} — ${path}`)
    }
    output.message(
      "Action: Remove these overrides or rename custom keys without the reserved ln. prefix.",
    )
  }
  if (!translations || !languages || translations.length === 0) {
    return false
  }
  const excludedKeys = new Set(options.exclude ?? [])
  const incompleteTranslations = translations
    .filter((translation) => !excludedKeys.has(translation.key))
    .map((translation) => ({
      ...translation,
      missingLocales: getMissingLocales(translation, languages),
    }))
    .filter((translation) => translation.missingLocales.length > 0)

  if (incompleteTranslations.length === 0) {
    output.outro(
      staleOverrides.length > 0
        ? "No missing translations. Stale overrides found."
        : "No issues found. 🎉",
    )
    return true
  }

  const grouped = Object.groupBy(
    incompleteTranslations,
    (translation) => translation.type,
  )

  output.error("Translation check failed")
  for (const source of translationSources) {
    printMissingTranslations(source, grouped[source.type], output)
  }

  output.outro("Issues found. 🚧")

  return false
}

/**
 * @param {boolean|undefined} build
 * @param {{
 *   interactive: boolean
 *   output: ReturnType<typeof createOutput>
 *   promptRunBuild?: () => Promise<boolean>
 * }} runtime
 */
async function runBuild(build, { interactive, output, promptRunBuild }) {
  const shouldRunBuild =
    build ??
    (interactive ? await (promptRunBuild ?? defaultPromptRunBuild)() : false)
  if (!shouldRunBuild) {
    return true
  }
  const buildLog = interactive
    ? taskLog({ title: "Running pnpm build" })
    : {
        error: output.error,
        message: output.message,
        success: output.message,
      }

  if (!interactive) {
    output.message("Running pnpm build")
  }

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

async function defaultPromptRunBuild() {
  const answer = await confirm({
    message:
      "Run pnpm build now? Command requires an up-to-date dist/ directory.",
    initialValue: false,
  })
  if (isCancel(answer)) {
    cancelPrompt()
  }
  return answer
}

/**
 *
 * @param {{title:string, action:string}} source
 * @param {(Translation & {missingLocales:string[]})[]|undefined} translations
 * @param {ReturnType<typeof createOutput>} output
 */
function printMissingTranslations(source, translations, output) {
  if (!translations || translations.length === 0) {
    return
  }

  output.warn(source.title)
  translations
    .toSorted(
      (t1, t2) =>
        t2.missingLocales.length - t1.missingLocales.length ||
        t1.key.localeCompare(t2.key),
    )
    .forEach(({ key, missingLocales }) => {
      output.message(`• ${key} > Missing: ${missingLocales.join(", ")}`)
    })

  output.message(`Action: ${source.action}`)
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
 * @param {string} lightnetCachePath
 * @returns {Promise<{key: string, path: string}[]>}
 */
async function readStaleOverrides(lightnetCachePath) {
  try {
    return JSON.parse(
      await readFile(
        resolve(lightnetCachePath, "stale-translation-overrides.json"),
        "utf-8",
      ),
    )
  } catch (error) {
    // Older builds do not include stale override metadata.
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return []
    }
    throw error
  }
}

/**
 * @param {string} lightnetCachePath
 * @param {ReturnType<typeof createOutput>} output
 * @returns {Promise<Translation[]|undefined>}
 */
async function readTranslations(lightnetCachePath, output) {
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
    output.error("No translation build cache found.")
    output.error("Action: Run build and try lightnet check-translations again.")
    return undefined
  }
}

/**
 * @param {string} lightnetCachePath
 * @param {ReturnType<typeof createOutput>} output
 * @returns {Promise<Languages|undefined>}
 */
async function readLanguages(lightnetCachePath, output) {
  try {
    const languagesText = await readFile(
      resolve(lightnetCachePath, "languages.json"),
      "utf-8",
    )
    return JSON.parse(languagesText)
  } catch {
    output.error("No language manifest found from the last build.")
    output.error("Action: Run build and try lightnet check-translations again.")
    return undefined
  }
}

/**
 * @param {boolean} interactive
 * @param {(message: string) => void | undefined} write
 */
function createOutput(
  interactive,
  write = (message) => {
    stdout.write(`${message}\n`)
  },
) {
  if (interactive) {
    return {
      error: log.error,
      intro,
      message: log.message,
      outro,
      warn: log.warn,
    }
  }

  return {
    error: write,
    intro: write,
    message: write,
    outro: write,
    warn: write,
  }
}
