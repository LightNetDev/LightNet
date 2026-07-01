// @ts-check

import { execFile } from "node:child_process"
import { access, readdir, readFile, unlink } from "node:fs/promises"
import { join, posix, relative, resolve } from "node:path"
import {
  cwd as processCwd,
  env as processEnv,
  stdin,
  stdout,
} from "node:process"
import { createInterface } from "node:readline/promises"
import { promisify } from "node:util"

import { CliError } from "./support/cli-error.js"
import {
  deleteR2Objects,
  ensureR2Config,
  validateR2ReferencesWithRefresh,
} from "./support/r2.js"

const execFileAsync = promisify(execFile)
const localJunkFileNames = new Set([".DS_Store"])
const supportedScopes = new Set(["content-files", "thumbnails"])

const mediaDir = "src/content/media"
const mediaImagesDir = "src/content/media/images"
const categoriesDir = "src/content/categories"
const categoryImagesDir = "src/content/categories/images"
const publicFilesDir = "public/files"

/**
 * @typedef {{
 *   scope?: string
 *   fix?: boolean
 *   yes?: boolean
 *   r2?: boolean
 * }} CheckFilesOptions
 */

/**
 * @typedef {{
 *   path: string
 *   content: Array<{type: "upload"|"link", url: string}>
 *   image?: string
 * }} ParsedMediaItem
 */

/**
 * @typedef {{
 *   path: string
 *   image?: string
 * }} ParsedCategory
 */

/**
 * @typedef {{
 *   log: (...args: unknown[]) => void
 *   error: (...args: unknown[]) => void
 * }} Logger
 */

/**
 * @typedef {{
 *   path: string
 *   sources: string[]
 * }} MissingReference
 */

/**
 * @typedef {{
 *   cwd?: string
 *   logger?: Logger
 *   isInteractive?: boolean
 *   promptText?: (message: string) => Promise<string>
 *   promptConfirm?: (message: string) => Promise<boolean>
 *   promptSecret?: (message: string) => Promise<string>
 *   runRclone?: (args: string[], cwd: string, env?: NodeJS.ProcessEnv) => Promise<{stdout:string, stderr:string}>
 * }} CheckFilesRuntime
 */

/**
 * @param {CheckFilesOptions} options
 * @param {CheckFilesRuntime} [runtime]
 */
export async function checkFiles(options, runtime = {}) {
  const cwd = runtime.cwd ?? processCwd()
  const logger = runtime.logger ?? console
  const interactive =
    runtime.isInteractive ?? Boolean(stdin.isTTY && stdout.isTTY)
  const promptText =
    runtime.promptText ??
    (async (message) =>
      defaultPromptText(message, { input: stdin, output: stdout }))
  const promptConfirm =
    runtime.promptConfirm ??
    (async (message) =>
      defaultPromptConfirm(message, { input: stdin, output: stdout }))
  const promptSecret = runtime.promptSecret
  const runRclone =
    runtime.runRclone ??
    ((args, commandCwd, commandEnv) =>
      execFileAsync("rclone", args, {
        cwd: commandCwd,
        env: commandEnv ?? processEnv,
      }))

  const scopes = parseScopes(options.scope)
  const includeContentFiles = scopes.has("content-files")
  const includeThumbnails = scopes.has("thumbnails")

  await assertLightNetSiteRoot(cwd)

  const mediaItems = await readMediaItems(cwd)
  const categories = await readCategories(cwd)

  /** @type {MissingReference[]} */
  let missingContentFiles = []
  /** @type {string[]} */
  let orphanedContentFiles = []
  /** @type {string[]} */
  let orphanedMediaThumbnails = []
  /** @type {string[]} */
  let orphanedCategoryThumbnails = []
  /** @type {string[]} */
  let removedItems = []
  /** @type {string[]} */
  const warnings = []

  let r2Config = undefined

  if (includeContentFiles) {
    if (options.r2) {
      r2Config = await ensureR2Config({
        cwd,
        interactive,
        logger,
        promptText,
      })
      const r2Result = await validateR2ReferencesWithRefresh({
        cwd,
        interactive,
        logger,
        promptConfirm,
        promptText,
        promptSecret,
        config: r2Config,
        references: collectR2ContentReferences(mediaItems, r2Config.publicUrl),
        runRclone,
      })
      r2Config = r2Result.config
      missingContentFiles = r2Result.missingReferences
      orphanedContentFiles = r2Result.orphanedObjects
      if (r2Result.referenceCount === 0) {
        warnings.push(
          'No R2-backed content file references found. Use "--scope=thumbnails" or check your "--r2" setup.',
        )
      }
    } else {
      const localContentResult = await validateLocalContentFiles(
        cwd,
        mediaItems,
      )
      missingContentFiles = localContentResult.missingReferences
      orphanedContentFiles = localContentResult.orphanedFiles
      if (localContentResult.referenceCount === 0) {
        warnings.push(
          'No local "/files" content file references found. Use "--scope=thumbnails" or run with "--r2".',
        )
      }
    }
  }

  if (includeThumbnails) {
    const thumbnailsResult = await validateThumbnails(
      cwd,
      mediaItems,
      categories,
    )
    orphanedMediaThumbnails = thumbnailsResult.orphanedMediaThumbnails
    orphanedCategoryThumbnails = thumbnailsResult.orphanedCategoryThumbnails
  }

  if (options.fix) {
    /** @type {{displayPath:string, kind:"local-file"|"r2-object", target:string}[]} */
    const deletions = []
    for (const filePath of orphanedContentFiles) {
      if (options.r2) {
        deletions.push({
          displayPath: filePath,
          kind: "r2-object",
          target: filePath,
        })
      } else {
        deletions.push({
          displayPath: filePath,
          kind: "local-file",
          target: resolve(cwd, filePath),
        })
      }
    }
    for (const filePath of orphanedMediaThumbnails) {
      deletions.push({
        displayPath: filePath,
        kind: "local-file",
        target: resolve(cwd, filePath),
      })
    }
    for (const filePath of orphanedCategoryThumbnails) {
      deletions.push({
        displayPath: filePath,
        kind: "local-file",
        target: resolve(cwd, filePath),
      })
    }

    if (deletions.length > 0) {
      if (!options.yes && !interactive) {
        throw new CliError(
          'Deletion requires confirmation. Re-run with "--fix --yes" in non-interactive environments.',
        )
      }
      const shouldDelete =
        options.yes ||
        (await confirmDeletion({
          deletions,
          logger,
          promptConfirm,
        }))

      if (shouldDelete) {
        removedItems = await deleteItems({
          cwd,
          logger,
          r2Config,
          deletions,
          options,
          promptSecret,
          runRclone,
        })
        orphanedContentFiles = orphanedContentFiles.filter(
          (item) => !removedItems.includes(item),
        )
        orphanedMediaThumbnails = orphanedMediaThumbnails.filter(
          (item) => !removedItems.includes(item),
        )
        orphanedCategoryThumbnails = orphanedCategoryThumbnails.filter(
          (item) => !removedItems.includes(item),
        )
      }
    }
  }

  const hasIssues =
    warnings.length > 0 ||
    missingContentFiles.length > 0 ||
    orphanedContentFiles.length > 0 ||
    orphanedMediaThumbnails.length > 0 ||
    orphanedCategoryThumbnails.length > 0

  if (!hasIssues && removedItems.length === 0) {
    return true
  }

  for (const warning of warnings) {
    logger.error(warning)
  }

  printMissingReferenceSection(
    logger,
    "Missing referenced content files",
    missingContentFiles,
  )
  printSection(
    logger,
    options.r2 ? "Orphaned R2 objects" : "Orphaned local content files",
    orphanedContentFiles,
  )
  printSection(logger, "Orphaned media thumbnails", orphanedMediaThumbnails)
  printSection(
    logger,
    "Orphaned category thumbnails",
    orphanedCategoryThumbnails,
  )
  printSection(logger, "Removed items", removedItems)

  return !hasIssues
}

/**
 * @param {Logger} logger
 * @param {string} title
 * @param {string[]} items
 */
function printSection(logger, title, items) {
  if (items.length === 0) {
    return
  }
  logger.error("")
  logger.error(`${title} (${items.length})`)
  for (const item of items) {
    logger.error(`- ${item}`)
  }
}

/**
 * @param {Logger} logger
 * @param {string} title
 * @param {MissingReference[]} items
 */
function printMissingReferenceSection(logger, title, items) {
  if (items.length === 0) {
    return
  }
  logger.error("")
  logger.error(`${title} (${items.length})`)
  for (const item of items) {
    logger.error(
      `- ${item.path} (referenced by ${item.sources.toSorted().join(", ")})`,
    )
  }
}

/**
 * @param {string|undefined} rawScope
 */
function parseScopes(rawScope) {
  const values = (rawScope ?? "content-files,thumbnails")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)

  if (values.length === 0) {
    throw new CliError(
      // intentionally kept as a CLI-facing validation error
      'Expected "--scope" to include at least one of "content-files" or "thumbnails".',
    )
  }

  const scopes = new Set(values)
  for (const scope of scopes) {
    if (!supportedScopes.has(scope)) {
      throw new CliError(
        `Unsupported scope "${scope}". Allowed values: content-files, thumbnails.`,
      )
    }
  }

  return scopes
}

/**
 * @param {string} cwd
 */
async function assertLightNetSiteRoot(cwd) {
  if (!(await pathExists(resolve(cwd, mediaDir)))) {
    throw new CliError(
      'Expected a LightNet site root with "src/content/media". Run this command inside a LightNet site project.',
    )
  }
}

/**
 * @param {string} cwd
 */
async function readMediaItems(cwd) {
  const files = await listJsonFiles(resolve(cwd, mediaDir))
  /** @type {ParsedMediaItem[]} */
  const items = []
  for (const filePath of files) {
    items.push(await readMediaItem(filePath))
  }
  return items
}

/**
 * @param {string} cwd
 */
async function readCategories(cwd) {
  const absoluteDir = resolve(cwd, categoriesDir)
  if (!(await pathExists(absoluteDir))) {
    return []
  }
  const files = await listJsonFiles(absoluteDir)
  /** @type {ParsedCategory[]} */
  const items = []
  for (const filePath of files) {
    items.push(await readCategory(filePath))
  }
  return items
}

/**
 * @param {string} filePath
 * @returns {Promise<ParsedMediaItem>}
 */
async function readMediaItem(filePath) {
  const value = await readJsonFile(filePath)
  if (!isPlainObject(value)) {
    throw new CliError(
      `Invalid media item in "${filePath}": expected an object.`,
    )
  }

  const image = readOptionalImageReference(value.image, filePath)
  const content = readContentArray(value.content, filePath)

  return {
    path: filePath,
    content,
    image,
  }
}

/**
 * @param {string} filePath
 * @returns {Promise<ParsedCategory>}
 */
async function readCategory(filePath) {
  const value = await readJsonFile(filePath)
  if (!isPlainObject(value)) {
    throw new CliError(`Invalid category in "${filePath}": expected an object.`)
  }

  return {
    path: filePath,
    image: readOptionalImageReference(value.image, filePath),
  }
}

/**
 * @param {string} cwd
 * @param {ParsedMediaItem[]} mediaItems
 */
async function validateLocalContentFiles(cwd, mediaItems) {
  const references = collectLocalContentReferences(mediaItems)
  const files = await collectLocalContentFiles(cwd)

  const missingReferences = [...references.entries()]
    .filter(([path]) => !files.urlSet.has(path))
    .map(([path, sources]) => ({
      path,
      sources: [...sources].toSorted(),
    }))
    .sort((a, b) => a.path.localeCompare(b.path))
  const orphanedFiles = [...files.pathByUrl.entries()]
    .filter(([url]) => !references.has(url))
    .map(([, filePath]) => filePath)
    .sort()

  return {
    missingReferences,
    orphanedFiles,
    referenceCount: references.size,
  }
}

/**
 * @param {string} cwd
 * @param {ParsedMediaItem[]} mediaItems
 * @param {ParsedCategory[]} categories
 */
async function validateThumbnails(cwd, mediaItems, categories) {
  const mediaReferences = new Set(
    mediaItems
      .map((item) => toThumbnailPath("media", item.image))
      .filter((value) => value !== undefined),
  )
  const categoryReferences = new Set(
    categories
      .map((item) => toThumbnailPath("categories", item.image))
      .filter((value) => value !== undefined),
  )

  const mediaFiles = await collectLocalFiles(resolve(cwd, mediaImagesDir), {
    includeRootPrefix: mediaImagesDir,
    ignoreJunk: true,
  })
  const categoryFiles = await collectLocalFiles(
    resolve(cwd, categoryImagesDir),
    {
      includeRootPrefix: categoryImagesDir,
      ignoreJunk: true,
    },
  )

  return {
    orphanedMediaThumbnails: mediaFiles.filter(
      (file) => !mediaReferences.has(file),
    ),
    orphanedCategoryThumbnails: categoryFiles.filter(
      (file) => !categoryReferences.has(file),
    ),
  }
}

/**
 * @param {ParsedMediaItem[]} mediaItems
 */
function collectLocalContentReferences(mediaItems) {
  const references = new Map()
  for (const item of mediaItems) {
    const sourceFileName = posix.basename(toPosixPath(item.path))
    for (const contentItem of item.content) {
      if (
        contentItem.type === "upload" &&
        contentItem.url.startsWith("/files")
      ) {
        const sources = references.get(contentItem.url) ?? new Set()
        sources.add(sourceFileName)
        references.set(contentItem.url, sources)
      }
    }
  }
  return references
}

/**
 * @param {ParsedMediaItem[]} mediaItems
 * @param {string} publicUrl
 */
function collectR2ContentReferences(mediaItems, publicUrl) {
  const references = new Map()
  const normalizedBase = publicUrl.replace(/\/+$/, "")
  for (const item of mediaItems) {
    const sourceFileName = posix.basename(toPosixPath(item.path))
    for (const contentItem of item.content) {
      if (
        contentItem.type !== "upload" ||
        !contentItem.url.startsWith(normalizedBase)
      ) {
        continue
      }
      const relativePath = contentItem.url
        .slice(normalizedBase.length)
        .replace(/^\/+/, "")
      const current = references.get(contentItem.url)
      if (current) {
        current.sources.add(sourceFileName)
      } else {
        references.set(contentItem.url, {
          key: relativePath,
          sources: new Set([sourceFileName]),
        })
      }
    }
  }
  return references
}

/**
 * @param {string} cwd
 */
async function collectLocalContentFiles(cwd) {
  const files = await collectLocalFiles(resolve(cwd, publicFilesDir), {
    includeRootPrefix: publicFilesDir,
    ignoreJunk: true,
  })
  const pathByUrl = new Map(
    files.map((filePath) => [
      `/${toPosixPath(relative(resolve(cwd, "public"), resolve(cwd, filePath)))}`,
      filePath,
    ]),
  )
  return {
    pathByUrl,
    urlSet: new Set(pathByUrl.keys()),
  }
}

/**
 * @param {string} absoluteDir
 * @param {{includeRootPrefix:string, ignoreJunk:boolean}} options
 */
async function collectLocalFiles(absoluteDir, options) {
  if (!(await pathExists(absoluteDir))) {
    return []
  }
  const files = await walkFiles(absoluteDir)
  return files
    .filter((filePath) =>
      options.ignoreJunk
        ? !localJunkFileNames.has(posix.basename(filePath))
        : true,
    )
    .map((filePath) =>
      toPosixPath(
        join(options.includeRootPrefix, relative(absoluteDir, filePath)),
      ),
    )
    .sort()
}

/**
 * @param {"media"|"categories"} kind
 * @param {string|undefined} image
 */
function toThumbnailPath(kind, image) {
  if (typeof image !== "string" || !image.startsWith("./images/")) {
    return undefined
  }
  const relativePath = image.slice("./images/".length)
  if (
    !relativePath ||
    relativePath.startsWith("/") ||
    relativePath.includes("../")
  ) {
    return undefined
  }
  return kind === "media"
    ? toPosixPath(join(mediaImagesDir, relativePath))
    : toPosixPath(join(categoryImagesDir, relativePath))
}

/**
 * @param {{
 *   deletions: {displayPath:string, kind:"local-file"|"r2-object", target:string}[]
 *   logger: Logger
 *   promptConfirm: (message:string)=>Promise<boolean>
 * }} args
 */
async function confirmDeletion({ deletions, logger, promptConfirm }) {
  logger.error("")
  logger.error(`Files to remove (${deletions.length})`)
  for (const deletion of deletions) {
    logger.error(`- ${deletion.displayPath}`)
  }
  return promptConfirm("Delete these files? [y/N] ")
}

/**
 * @param {{
 *   cwd: string
 *   logger: Logger
 *   r2Config: import("./support/r2.js").R2Config|undefined
 *   deletions: {displayPath:string, kind:"local-file"|"r2-object", target:string}[]
 *   options: CheckFilesOptions
 *   promptSecret?: (message: string) => Promise<string>
 *   runRclone: (args: string[], cwd: string, env?: NodeJS.ProcessEnv) => Promise<{stdout:string, stderr:string}>
 * }} args
 */
async function deleteItems({
  cwd,
  logger,
  r2Config,
  deletions,
  options,
  promptSecret,
  runRclone,
}) {
  /** @type {string[]} */
  const removed = []
  const r2ObjectKeys = []
  for (const deletion of deletions) {
    try {
      if (deletion.kind === "local-file") {
        await unlink(deletion.target)
        removed.push(deletion.displayPath)
      } else {
        if (!options.r2 || !r2Config) {
          throw new CliError("Missing R2 config for remote deletion.")
        }
        r2ObjectKeys.push(deletion.target)
      }
    } catch (error) {
      logger.error(
        error instanceof Error
          ? `Failed to delete "${deletion.displayPath}": ${error.message}`
          : `Failed to delete "${deletion.displayPath}".`,
      )
    }
  }
  if (r2ObjectKeys.length > 0) {
    if (!r2Config) {
      throw new CliError("Missing R2 config for remote deletion.")
    }
    const removedRemoteItems = await deleteR2Objects({
      cwd,
      config: r2Config,
      objectKeys: r2ObjectKeys,
      promptSecret,
      runRclone,
    })
    removed.push(...removedRemoteItems)
    const failedRemoteItems = r2ObjectKeys.filter(
      (item) => !removedRemoteItems.includes(item),
    )
    for (const item of failedRemoteItems) {
      logger.error(`Failed to delete "${item}".`)
    }
  }
  return removed
}

/**
 * @param {string} filePath
 */
async function readJsonFile(filePath) {
  const text = await readFile(filePath, "utf8")
  try {
    return JSON.parse(text)
  } catch {
    throw new CliError(`Invalid JSON in "${filePath}".`)
  }
}

/**
 * @param {string} dirPath
 */
async function listJsonFiles(dirPath) {
  if (!(await pathExists(dirPath))) {
    return []
  }
  const files = await walkFiles(dirPath)
  return files.filter((filePath) => filePath.endsWith(".json")).sort()
}

/**
 * @param {string} dirPath
 */
async function walkFiles(dirPath) {
  /** @type {string[]} */
  const files = []
  const entries = await readdir(dirPath, { withFileTypes: true })
  for (const entry of entries) {
    const entryPath = join(dirPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath)))
    } else if (entry.isFile()) {
      files.push(entryPath)
    }
  }
  return files
}

/**
 * @param {unknown} value
 * @param {string} filePath
 */
function readOptionalImageReference(value, filePath) {
  if (value === undefined) {
    return undefined
  }
  if (typeof value !== "string") {
    throw new CliError(
      `Invalid "image" in "${filePath}": expected a string when provided.`,
    )
  }
  return value
}

/**
 * @param {unknown} value
 * @param {string} filePath
 * @returns {Array<{type: "upload"|"link", url: string}>}
 */
function readContentArray(value, filePath) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new CliError(
      `Invalid "content" in "${filePath}": expected a non-empty array.`,
    )
  }

  return value.map((item) => {
    if (!isPlainObject(item)) {
      throw new CliError(
        `Invalid "content" in "${filePath}": expected array items to be objects.`,
      )
    }
    if (item.type !== "upload" && item.type !== "link") {
      throw new CliError(
        `Invalid "content.type" in "${filePath}": expected "upload" or "link".`,
      )
    }
    if (typeof item.url !== "string") {
      throw new CliError(
        `Invalid "content.url" in "${filePath}": expected a string.`,
      )
    }
    return {
      type: item.type,
      url: item.url,
    }
  })
}

/**
 * @param {unknown} value
 */
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * @param {string} filePath
 */
async function pathExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * @param {string} filePath
 */
function toPosixPath(filePath) {
  return filePath.split("\\").join("/")
}

/**
 * @param {string} message
 * @param {{input: NodeJS.ReadableStream, output: NodeJS.WritableStream}} io
 */
async function defaultPromptText(message, io) {
  const rl = createInterface(io)
  try {
    return await rl.question(message)
  } finally {
    rl.close()
  }
}

/**
 * @param {string} message
 * @param {{input: NodeJS.ReadableStream, output: NodeJS.WritableStream}} io
 */
async function defaultPromptConfirm(message, io) {
  const answer = (await defaultPromptText(message, io)).trim().toLowerCase()
  return answer === "y" || answer === "yes"
}
