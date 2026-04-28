import { createWriteStream, type WriteStream } from "node:fs"
import { mkdir, unlink, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import process from "node:process"

import { root } from "astro:config/server"
import config from "virtual:lightnet/config"

type Translation = {
  type: "map" | "user" | "built-in"
  key: string
  values: Record<string, string | undefined>
}

const lightnetCachePath = resolve(
  root.pathname,
  "node_modules",
  ".cache",
  "lightnet",
)

const recordedTranslations = new Set<string>()

let translationStore: WriteStream | undefined = undefined

const writeLanguagesManifest = async () => {
  const manifestPath = resolve(lightnetCachePath, "languages.json")
  const { defaultLocale, locales } = config
  const manifest = {
    defaultLocale,
    locales,
  }
  await writeFile(manifestPath, JSON.stringify(manifest), "utf-8")
}

const getTranslationStore = async () => {
  if (translationStore) {
    return translationStore
  }

  const translationStorePath = resolve(lightnetCachePath, "translations.jsonl")

  await mkdir(lightnetCachePath, { recursive: true })
  try {
    await unlink(translationStorePath)
  } catch {
    // catch error if file has not been existing
  }

  translationStore = createWriteStream(translationStorePath, {
    flags: "a",
    encoding: "utf8",
  })

  await writeLanguagesManifest()

  process.on("exit", () => translationStore?.end())
  process.on("SIGINT", () => translationStore?.end())
  return translationStore
}

export function recordTranslation(translation: Translation) {
  if (import.meta.env.DEV) {
    // do not record translations when running DEV server
    return
  }

  const key = translation.type + translation.key
  if (recordedTranslations.has(key)) {
    return
  }
  recordedTranslations.add(key)

  getTranslationStore()
    .then((store) => {
      store.write(JSON.stringify(translation) + "\n")
    })
    .catch((e) => console.error(e))
}
