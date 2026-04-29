import { createWriteStream, type WriteStream } from "node:fs"
import { access, mkdir, unlink, writeFile } from "node:fs/promises"
import { relative, resolve } from "node:path"
import process from "node:process"

import { isTranslationDiscoveryEnabled } from "./discovery-mode"
import type { TranslationRecord } from "./translation-record"

const lightnetCachePath = resolve(
  process.cwd(),
  "node_modules",
  ".cache",
  "lightnet",
)

const recordedTranslations = new Set<string>()

let translationStore: WriteStream | undefined = undefined
let discoveryInitialized = false

type TranslationDiscoveryMetadata = {
  defaultLocale: string
  locales: string[]
}

const normalizePath = (path: string | undefined) => {
  if (!path) {
    return
  }

  if (!path.startsWith("/") && !path.startsWith("file://")) {
    return path
  }

  return relative(process.cwd(), path.replace(/^file:\/\//, ""))
}

const writeLanguagesManifest = async (
  metadata: TranslationDiscoveryMetadata,
) => {
  const manifestPath = resolve(lightnetCachePath, "languages.json")
  await writeFile(manifestPath, JSON.stringify(metadata), "utf-8")
}

export const initializeTranslationDiscovery = async (
  metadata: TranslationDiscoveryMetadata,
) => {
  if (!isTranslationDiscoveryEnabled() || discoveryInitialized) {
    return
  }

  const translationStorePath = resolve(lightnetCachePath, "translations.jsonl")

  recordedTranslations.clear()
  translationStore?.end()
  translationStore = undefined

  await mkdir(lightnetCachePath, { recursive: true })
  try {
    await unlink(translationStorePath)
  } catch {
    // catch error if file has not been existing
  }
  try {
    await unlink(resolve(lightnetCachePath, "languages.json"))
  } catch {
    // catch error if file has not been existing
  }

  await writeLanguagesManifest(metadata)

  discoveryInitialized = true
}

const getTranslationStore = async () => {
  if (translationStore) {
    return translationStore
  }

  if (!discoveryInitialized) {
    await access(resolve(lightnetCachePath, "languages.json"))
    discoveryInitialized = true
  }

  const translationStorePath = resolve(lightnetCachePath, "translations.jsonl")
  translationStore = createWriteStream(translationStorePath, {
    flags: "a",
    encoding: "utf8",
  })

  process.on("exit", () => translationStore?.end())
  process.on("SIGINT", () => translationStore?.end())
  return translationStore
}

export function recordTranslation(translation: TranslationRecord) {
  if (!isTranslationDiscoveryEnabled()) {
    return
  }

  const key = [
    translation.type,
    translation.key,
    translation.sourceFile,
    translation.callsite,
  ].join(":")
  if (recordedTranslations.has(key)) {
    return
  }
  recordedTranslations.add(key)

  getTranslationStore()
    .then((store) => {
      store.write(
        JSON.stringify({
          ...translation,
          sourceFile: normalizePath(translation.sourceFile),
          type: translation.type,
        }) + "\n",
      )
    })
    .catch((e) => console.error(e))
}
