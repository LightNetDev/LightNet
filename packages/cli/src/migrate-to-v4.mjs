import fs from "node:fs/promises"
import path from "node:path"

import YAML from "yaml"

import { resolveProjectPathsFromCwd } from "./project-root.mjs"

/**
 * @param {string[]} argv
 */
export async function runMigrateToV4(argv) {
  const args = parseArgs(argv)
  const { projectDir, translationsDir, contentDir, astroConfigPath } =
    await resolveProjectPathsFromCwd()
  const builtInTranslationsDir = await resolveBuiltInTranslationsDir(projectDir)

  const filesChanged = new Set()
  /** @type {string[]} */
  const unresolvedKeys = []
  const consumedTranslationKeys = new Set()
  const stepsExecuted = []

  const locales = await resolveLocales(args.locales, translationsDir)
  const translationsByLocale = await loadTranslations(locales, translationsDir)
  const builtInTranslationsByLocale = await loadTranslations(
    locales,
    builtInTranslationsDir,
  )

  await migrateLocalizedLabels({
    contentDir,
    astroConfigPath,
    locales,
    translationsByLocale,
    builtInTranslationsByLocale,
    filesChanged,
    unresolvedKeys,
    consumedTranslationKeys,
    translationKeysBySignature: buildTranslationKeysBySignature(
      locales,
      translationsByLocale,
    ),
  })
  stepsExecuted.push("localized-label-migration")

  const cleanupCandidates = [...consumedTranslationKeys].sort()
  const stillUsedKeys = await findStillUsedTranslationKeys(
    projectDir,
    new Set(cleanupCandidates),
  )
  const keptBecauseStillUsed = cleanupCandidates.filter((key) =>
    stillUsedKeys.has(key),
  )
  const deletableKeys = new Set(
    cleanupCandidates.filter((key) => !stillUsedKeys.has(key)),
  )
  const removedTranslationKeys = await cleanupTranslationFiles({
    translationsDir,
    locales,
    deletableKeys,
    filesChanged,
  })
  stepsExecuted.push("translation-key-cleanup")

  const report = {
    filesChanged: [...filesChanged].sort(),
    unresolvedKeys: unresolvedKeys.sort(),
    emptyValuesCreated: 0,
    cleanupCandidates,
    keptBecauseStillUsed,
    removedTranslationKeys,
    stepsExecuted,
  }

  if (report.unresolvedKeys.length) {
    console.error("Unresolved translation keys:")
    for (const item of report.unresolvedKeys) {
      console.error(`- ${item}`)
    }
  }

  console.log(JSON.stringify(report, null, 2))

  if (report.unresolvedKeys.length) {
    process.exitCode = 1
  }
}

async function migrateLocalizedLabels({
  contentDir,
  astroConfigPath,
  locales,
  translationsByLocale,
  builtInTranslationsByLocale,
  filesChanged,
  unresolvedKeys,
  consumedTranslationKeys,
  translationKeysBySignature,
}) {
  const targets = [
    path.join(contentDir, "categories"),
    path.join(contentDir, "media-collections"),
    path.join(contentDir, "media-types"),
    path.join(contentDir, "media"),
  ]

  for (const dir of targets) {
    const entries = await fs.readdir(dir)
    for (const fileName of entries.filter((file) => file.endsWith(".json"))) {
      const filePath = path.join(dir, fileName)
      const original = await fs.readFile(filePath, "utf8")
      const json = JSON.parse(original)
      let changed = false
      const relPath = path.relative(process.cwd(), filePath)

      if (typeof json.label === "string") {
        json.label = toLocalizedMap(
          json.label,
          locales,
          translationsByLocale,
          builtInTranslationsByLocale,
          `${relPath}:label`,
          unresolvedKeys,
          consumedTranslationKeys,
        )
        changed = true
      } else if (isLabelMap(json.label)) {
        trackInferredConsumedKey(
          json.label,
          locales,
          translationKeysBySignature,
          consumedTranslationKeys,
        )
      }

      if (typeof json.detailsPage?.openActionLabel === "string") {
        json.detailsPage.openActionLabel = toLocalizedMap(
          json.detailsPage.openActionLabel,
          locales,
          translationsByLocale,
          builtInTranslationsByLocale,
          `${relPath}:detailsPage.openActionLabel`,
          unresolvedKeys,
          consumedTranslationKeys,
        )
        changed = true
      } else if (isLabelMap(json.detailsPage?.openActionLabel)) {
        trackInferredConsumedKey(
          json.detailsPage.openActionLabel,
          locales,
          translationKeysBySignature,
          consumedTranslationKeys,
        )
      }

      if (Array.isArray(json.content)) {
        json.content = json.content.map((entry, index) => {
          if (typeof entry.label !== "string") {
            if (isLabelMap(entry.label)) {
              trackInferredConsumedKey(
                entry.label,
                locales,
                translationKeysBySignature,
                consumedTranslationKeys,
              )
            }
            return entry
          }
          changed = true
          return {
            ...entry,
            label: toLocalizedMap(
              entry.label,
              locales,
              translationsByLocale,
              builtInTranslationsByLocale,
              `${relPath}:content[${index}].label`,
              unresolvedKeys,
              consumedTranslationKeys,
            ),
          }
        })
      }

      if (changed) {
        await fs.writeFile(filePath, `${JSON.stringify(json, null, 2)}\n`)
        filesChanged.add(relPath)
      }
    }
  }

  const original = await fs.readFile(astroConfigPath, "utf8")
  const relPath = path.relative(process.cwd(), astroConfigPath)
  let text = original

  const replacers = [
    {
      pattern: /(\btitle\s*:\s*)"([^"]*)"/g,
      pathPrefix: "title",
    },
    {
      pattern: /(\balt\s*:\s*)"([^"]*)"/g,
      pathPrefix: "logo.alt",
    },
    {
      pattern: /(\blabel\s*:\s*)"([^"]*)"/g,
      pathPrefix: "label",
    },
  ]

  for (const { pattern, pathPrefix } of replacers) {
    text = text.replace(pattern, (_match, before, value) => {
      const map = toLocalizedMap(
        value,
        locales,
        translationsByLocale,
        builtInTranslationsByLocale,
        `${relPath}:${pathPrefix}`,
        unresolvedKeys,
        consumedTranslationKeys,
      )
      return `${before}${toInlineJsObject(map)}`
    })
  }

  const mapPattern = /(?:title|alt|label)\s*:\s*\{([^{}]*)\}/g
  for (const match of text.matchAll(mapPattern)) {
    const inlineMap = parseInlineMap(match[1])
    if (isLabelMap(inlineMap)) {
      trackInferredConsumedKey(
        inlineMap,
        locales,
        translationKeysBySignature,
        consumedTranslationKeys,
      )
    }
  }

  if (text !== original) {
    await fs.writeFile(astroConfigPath, text)
    filesChanged.add(relPath)
  }
}

function toLocalizedMap(
  value,
  locales,
  translationsByLocale,
  builtInTranslationsByLocale,
  context,
  unresolvedKeys,
  consumedTranslationKeys,
) {
  const isBuiltInKey = value.match(/^ln\./i)
  const isProjectKey =
    value.match(/^x\./i) ||
    locales.some((locale) => Object.hasOwn(translationsByLocale[locale], value))

  if (!isBuiltInKey && !isProjectKey) {
    return Object.fromEntries(locales.map((locale) => [locale, value]))
  }
  consumedTranslationKeys.add(value)

  const localizedMap = {}
  for (const locale of locales) {
    const translated = isBuiltInKey
      ? builtInTranslationsByLocale[locale]?.[value]
      : translationsByLocale[locale][value]
    if (!translated) {
      unresolvedKeys.push(`${context} -> ${locale}:${value}`)
      localizedMap[locale] = value
      continue
    }
    localizedMap[locale] = translated
  }
  return localizedMap
}

function toInlineJsObject(labelMap) {
  const entries = Object.entries(labelMap).map(
    ([locale, value]) => `${locale}: ${JSON.stringify(value)}`,
  )
  return `{ ${entries.join(", ")} }`
}

async function resolveLocales(localesArg, translationsDir) {
  if (localesArg) {
    return localesArg
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  }

  const entries = await fs.readdir(translationsDir)
  return entries
    .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
    .map((file) => file.replace(/\.ya?ml$/i, ""))
    .sort()
}

async function loadTranslations(locales, translationsDir) {
  const result = {}
  for (const locale of locales) {
    const filePath = path.join(translationsDir, `${locale}.yml`)
    const content = await fs.readFile(filePath, "utf8")
    result[locale] = parseFlatYaml(content)
  }
  return result
}

function parseFlatYaml(input) {
  const result = {}
  const lines = input.split("\n")
  let skipIndentedBlock = false

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) {
      continue
    }

    if (skipIndentedBlock) {
      if (line.match(/^\s+/)) {
        continue
      }
      skipIndentedBlock = false
    }

    const match = line.match(/^([A-Za-z0-9._-]+):\s*(.*)$/)
    if (!match) {
      continue
    }

    const [, key, rawValue] = match
    if (
      rawValue === ">" ||
      rawValue === "|" ||
      rawValue === "|-" ||
      rawValue === ">-"
    ) {
      skipIndentedBlock = true
      continue
    }
    result[key] = rawValue.replace(/^['"]|['"]$/g, "")
  }

  return result
}

function buildTranslationKeysBySignature(locales, translationsByLocale) {
  const keys = new Set()
  for (const locale of locales) {
    for (const key of Object.keys(translationsByLocale[locale] ?? {})) {
      keys.add(key)
    }
  }

  const keysBySignature = new Map()
  for (const key of keys) {
    const labelMap = Object.fromEntries(
      locales.map((locale) => [locale, translationsByLocale[locale]?.[key]]),
    )
    const signature = createLocaleMapSignature(labelMap, locales)
    if (!signature) {
      continue
    }
    const existing = keysBySignature.get(signature) ?? []
    existing.push(key)
    keysBySignature.set(signature, existing)
  }
  return keysBySignature
}

function trackInferredConsumedKey(
  labelMap,
  locales,
  translationKeysBySignature,
  consumedTranslationKeys,
) {
  const signature = createLocaleMapSignature(labelMap, locales)
  if (!signature) {
    return
  }
  const keys = translationKeysBySignature.get(signature) ?? []
  if (keys.length !== 1) {
    return
  }
  consumedTranslationKeys.add(keys[0])
}

function createLocaleMapSignature(labelMap, locales) {
  const values = []
  for (const locale of locales) {
    const value = labelMap[locale]
    if (typeof value !== "string") {
      return undefined
    }
    values.push(value)
  }
  return values.join("\u0000")
}

async function findStillUsedTranslationKeys(projectDir, candidateKeys) {
  const stillUsedKeys = new Set()
  const excludedDirectories = new Set([
    ".git",
    "node_modules",
    "dist",
    ".astro",
    ".next",
    "coverage",
  ])
  const allowedExtensions = new Set([
    ".astro",
    ".ts",
    ".tsx",
    ".js",
    ".mjs",
    ".cjs",
    ".json",
    ".md",
    ".mdx",
    ".yml",
    ".yaml",
  ])
  const filesToScan = []
  const stack = [projectDir]
  const translationsRoot = path.join(projectDir, "src/translations")

  while (stack.length) {
    const current = stack.pop()
    const entries = await fs.readdir(current, { withFileTypes: true })
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (excludedDirectories.has(entry.name)) {
          continue
        }
        stack.push(entryPath)
        continue
      }

      if (!allowedExtensions.has(path.extname(entry.name))) {
        continue
      }
      if (entryPath.startsWith(translationsRoot)) {
        continue
      }
      filesToScan.push(entryPath)
    }
  }

  for (const filePath of filesToScan) {
    if (candidateKeys.size === stillUsedKeys.size) {
      break
    }
    const text = await fs.readFile(filePath, "utf8")
    for (const key of candidateKeys) {
      if (stillUsedKeys.has(key)) {
        continue
      }
      if (
        text.includes(`"${key}"`) ||
        text.includes(`'${key}'`) ||
        text.includes(`\`${key}\``)
      ) {
        stillUsedKeys.add(key)
      }
    }
  }

  return stillUsedKeys
}

async function cleanupTranslationFiles({
  translationsDir,
  locales,
  deletableKeys,
  filesChanged,
}) {
  const removedTranslationKeys = Object.fromEntries(
    locales.map((locale) => [locale, []]),
  )

  for (const locale of locales) {
    const filePath = await resolveTranslationFilePath(translationsDir, locale)
    if (!filePath) {
      continue
    }
    const original = await fs.readFile(filePath, "utf8")
    const parsed = YAML.parse(original) ?? {}
    const removed = []

    for (const key of deletableKeys) {
      if (Object.hasOwn(parsed, key)) {
        delete parsed[key]
        removed.push(key)
      }
    }

    removed.sort()
    removedTranslationKeys[locale] = removed
    if (!removed.length) {
      continue
    }

    await fs.writeFile(filePath, YAML.stringify(parsed))
    filesChanged.add(path.relative(process.cwd(), filePath))
  }

  return removedTranslationKeys
}

async function resolveTranslationFilePath(translationsDir, locale) {
  const ymlPath = path.join(translationsDir, `${locale}.yml`)
  const yamlPath = path.join(translationsDir, `${locale}.yaml`)
  try {
    await fs.access(ymlPath)
    return ymlPath
  } catch {
    // fallback
  }

  try {
    await fs.access(yamlPath)
    return yamlPath
  } catch {
    return undefined
  }
}

async function resolveBuiltInTranslationsDir(projectDir) {
  const candidates = [
    path.join(projectDir, "node_modules/lightnet/src/i18n/translations"),
    path.join(process.cwd(), "node_modules/lightnet/src/i18n/translations"),
    path.resolve("packages/lightnet/src/i18n/translations"),
  ]

  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // keep searching
    }
  }

  throw new Error(
    "Could not locate LightNet built-in translations. Ensure `lightnet` is installed in your project.",
  )
}

function parseInlineMap(input) {
  const entries = {}
  for (const raw of input.split(",")) {
    const item = raw.trim()
    if (!item) {
      continue
    }
    const [keyPart, ...valueParts] = item.split(":")
    if (!keyPart || !valueParts.length) {
      continue
    }
    const key = keyPart.trim().replace(/^["']|["']$/g, "")
    const rawValue = valueParts.join(":").trim()
    try {
      entries[key] = JSON.parse(rawValue)
    } catch {
      entries[key] = rawValue.replace(/^["']|["']$/g, "")
    }
  }
  return entries
}

function isLabelMap(value) {
  return value && typeof value === "object" && !Array.isArray(value)
}

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index++) {
    const item = argv[index]
    if (!item.startsWith("--")) {
      continue
    }
    const key = item.slice(2)
    const value = argv[index + 1]
    args[key] = value
    index++
  }
  return args
}
