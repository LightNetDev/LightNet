// @ts-check

import { join, posix, resolve } from "node:path"
import { cwd as processCwd, stdin, stdout } from "node:process"

import {
  confirm,
  intro,
  isCancel,
  log,
  outro,
  spinner,
  text,
} from "@clack/prompts"

import { CliError } from "./support/cli-error.js"
import { contentCollections } from "./support/content-collections.js"
import {
  contentFiles,
  files,
  pathExists,
  toLocalContentDisplayPath,
} from "./support/filesystem.js"
import { cancelPrompt } from "./support/prompt-cancel.js"
import { createR2FileStorage } from "./support/r2.js"

const supportedScopes = new Set(["content-files", "images"])

const mediaDir = "src/content/media"
const mediaImagesDir = "src/content/media/images"
const categoryImagesDir = "src/content/categories/images"

/**
 * @typedef {{
 *   scope?: string
 *   fix?: boolean
 *   fixWithoutConfirm?: boolean
 *   r2?: boolean
 * }} CheckFilesOptions
 */

/** @typedef {import("./support/content-collections.js").MediaItem} MediaItem */
/** @typedef {import("./support/content-collections.js").Category} Category */
/** @typedef {import("./support/filesystem.js").FileStorage} FileStorage */

/**
 * @typedef {{
 *   path: string
 *   sources: string[]
 * }} MissingReference
 */

/**
 * @typedef {{
 *   displayPath: string
 *   sources: Set<string>
 * }} FileReference
 */

/** @typedef {MissingReference} WrongTypeReference */

/**
 * @typedef {{
 *   cwd?: string
 *   isInteractive?: boolean
 *   promptText?: (message: string) => Promise<string>
 *   promptConfirm?: (message: string) => Promise<boolean>
 * }} CheckFilesRuntime
 */

/**
 * @param {CheckFilesOptions} options
 * @param {CheckFilesRuntime} [runtime]
 */
export async function checkFiles(options, runtime = {}) {
  const cwd = runtime.cwd ?? processCwd()
  const interactive =
    runtime.isInteractive ?? Boolean(stdin.isTTY && stdout.isTTY)
  const promptText =
    runtime.promptText ?? (async (message) => defaultPromptText(message))
  const promptConfirm =
    runtime.promptConfirm ?? (async (message) => defaultPromptConfirm(message))

  const scopes = parseScopes(options.scope)
  const includeContentFiles = scopes.has("content-files")
  const includeImages = scopes.has("images")

  intro("check-files")

  await assertLightNetSiteRoot(cwd)

  const collections = contentCollections(cwd)
  const [mediaItems, categories] = await Promise.all([
    collections.getMediaItems(),
    collections.getCategories(),
  ])

  /** @type {MissingReference[]} */
  let missingContentFiles = []
  /** @type {WrongTypeReference[]} */
  let wrongTypeR2ContentFiles = []
  /** @type {string[]} */
  let orphanedContentFiles = []
  /** @type {string[]} */
  let orphanedMediaImages = []
  /** @type {string[]} */
  let orphanedCategoryImages = []
  /** @type {string[]} */
  let removedItems = []
  /** @type {string[]} */
  const warnings = []

  /** @type {FileStorage|undefined} */
  let contentFileStorage = undefined
  const mediaImageStorage = files(cwd, { rootDir: mediaImagesDir })
  const categoryImageStorage = files(cwd, { rootDir: categoryImagesDir })

  if (includeContentFiles) {
    contentFileStorage = options.r2
      ? createR2FileStorage({
          cwd,
          interactive,
          promptConfirm,
          promptText,
        })
      : contentFiles(cwd)
    contentFileStorage = await contentFileStorage.init()
  }

  log.message(
    `Checking ${mediaItems.length} media items and ${categories.length} categories.`,
  )

  if (includeContentFiles) {
    if (!contentFileStorage) {
      throw new CliError("Missing file storage for content validation.")
    }
    const initializedContentFileStorage = contentFileStorage
    if (options.r2) {
      const r2Result = await runSpinner({
        error: "Content file check failed.",
        start: "Listing R2 objects and checking content file references",
        stop: (result) => formatContentCheckSummary(result),
        task: () =>
          validateContentFiles({
            includeLinkReferences: true,
            mediaItems,
            storage: initializedContentFileStorage,
          }),
      })
      missingContentFiles = r2Result.missingReferences
      wrongTypeR2ContentFiles = r2Result.wrongTypeReferences
      orphanedContentFiles = r2Result.orphanedFiles
      if (r2Result.referenceCount === 0) {
        warnings.push(
          'No R2-backed content file references found. Use "--scope=images" or check your "--r2" setup.',
        )
      }
    } else {
      const localContentResult = await runSpinner({
        error: "Content file check failed.",
        start: "Checking local content files",
        stop: (result) => formatContentCheckSummary(result),
        task: () =>
          validateContentFiles({
            mediaItems,
            storage: initializedContentFileStorage,
          }),
      })
      missingContentFiles = localContentResult.missingReferences
      orphanedContentFiles = localContentResult.orphanedFiles
      if (localContentResult.referenceCount === 0) {
        warnings.push(
          'No local "/files" content file references found. If your content files are stored in R2, consider re-running with "--r2".',
        )
      }
    }
  }

  if (includeImages) {
    const imagesResult = await runSpinner({
      error: "Image check failed.",
      start: "Checking images",
      stop: (result) => formatImageCheckSummary(result),
      task: () =>
        validateImages(
          mediaItems,
          categories,
          mediaImageStorage,
          categoryImageStorage,
        ),
    })
    orphanedMediaImages = imagesResult.orphanedMediaImages
    orphanedCategoryImages = imagesResult.orphanedCategoryImages
  }

  if (options.fix || options.fixWithoutConfirm) {
    /** @type {{displayPath:string, target:string}[]} */
    const deletions = []
    /** @type {{displayPath:string, target:string}[]} */
    const contentDeletions = []
    /** @type {{displayPath:string, target:string}[]} */
    const localDeletions = []
    for (const filePath of orphanedContentFiles) {
      if (!contentFileStorage) {
        throw new CliError("Missing file storage for content deletion.")
      }
      const deletion = {
        displayPath: formatContentFilePath(filePath, options),
        target: filePath,
      }
      contentDeletions.push(deletion)
      deletions.push(deletion)
    }
    for (const filePath of orphanedMediaImages) {
      const deletion = {
        displayPath: filePath,
        target: filePath,
      }
      localDeletions.push(deletion)
      deletions.push(deletion)
    }
    for (const filePath of orphanedCategoryImages) {
      const deletion = {
        displayPath: filePath,
        target: filePath,
      }
      localDeletions.push(deletion)
      deletions.push(deletion)
    }

    if (deletions.length > 0) {
      const shouldSkipConfirmation = options.fixWithoutConfirm === true
      if (!shouldSkipConfirmation && !interactive) {
        throw new CliError(
          'Deletion requires confirmation. Re-run with "--fix-without-confirm" in non-interactive environments.',
        )
      }
      const shouldDelete =
        shouldSkipConfirmation ||
        (await confirmDeletion({
          deletions,
          promptConfirm,
        }))

      if (shouldDelete) {
        const { deletedContentTargets, deletedLocalTargets } = await runSpinner(
          {
            error: "File deletion failed.",
            start: formatDeletionProgress("Deleting", deletions.length),
            stop: (result) => {
              const deletedCount =
                result.deletedContentTargets.length +
                result.deletedLocalTargets.length
              return formatDeletionProgress("Deleted", deletedCount)
            },
            task: async () => {
              const [
                deletedContentTargets,
                deletedMediaImageTargets,
                deletedCategoryImageTargets,
              ] = await Promise.all([
                contentFileStorage
                  ? contentFileStorage.delete(
                      contentDeletions.map((deletion) => deletion.target),
                    )
                  : [],
                mediaImageStorage.delete(
                  localDeletions
                    .filter((deletion) =>
                      deletion.target.startsWith(mediaImagesDir),
                    )
                    .map((deletion) => deletion.target),
                ),
                categoryImageStorage.delete(
                  localDeletions
                    .filter((deletion) =>
                      deletion.target.startsWith(categoryImagesDir),
                    )
                    .map((deletion) => deletion.target),
                ),
              ])
              return {
                deletedContentTargets,
                deletedLocalTargets: [
                  ...deletedMediaImageTargets,
                  ...deletedCategoryImageTargets,
                ],
              }
            },
          },
        )
        const deletedTargets = new Set([
          ...deletedContentTargets,
          ...deletedLocalTargets,
        ])
        for (const deletion of [...contentDeletions, ...localDeletions]) {
          if (deletedTargets.has(deletion.target)) {
            removedItems.push(deletion.displayPath)
          } else {
            log.error(`Failed to delete "${deletion.displayPath}".`)
          }
        }
        orphanedContentFiles = orphanedContentFiles.filter(
          (item) => !deletedTargets.has(item),
        )
        orphanedMediaImages = orphanedMediaImages.filter(
          (item) => !deletedTargets.has(item),
        )
        orphanedCategoryImages = orphanedCategoryImages.filter(
          (item) => !deletedTargets.has(item),
        )
      }
    }
  }

  const hasIssues =
    missingContentFiles.length > 0 ||
    wrongTypeR2ContentFiles.length > 0 ||
    orphanedContentFiles.length > 0 ||
    orphanedMediaImages.length > 0 ||
    orphanedCategoryImages.length > 0

  for (const warning of warnings) {
    log.warn(warning)
  }

  if (!hasIssues && removedItems.length === 0) {
    outro("No issues found. 🎉")
    return true
  }

  printMissingReferenceSection(
    "Missing referenced content files",
    missingContentFiles,
  )
  printWrongTypeReferenceSection(
    "R2 objects referenced as links",
    wrongTypeR2ContentFiles,
  )
  printSection(
    options.r2 ? "Orphaned R2 objects" : "Orphaned local content files",
    orphanedContentFiles.map((filePath) =>
      formatContentFilePath(filePath, options),
    ),
  )
  printSection("Orphaned media images", orphanedMediaImages)
  printSection("Orphaned category images", orphanedCategoryImages)
  printSection("Removed items", removedItems)

  outro(hasIssues ? "Issues found. 🚧" : "Cleanup complete. 🧹")

  return !hasIssues
}

/**
 * @param {string} title
 * @param {string[]} items
 */
function printSection(title, items) {
  if (items.length === 0) {
    return
  }
  log.warn(`${title} (${items.length})`)
  for (const item of items) {
    log.message(`• ${item}`)
  }
}

/**
 * @param {string} title
 * @param {MissingReference[]} items
 */
function printMissingReferenceSection(title, items) {
  if (items.length === 0) {
    return
  }
  log.error(`${title} (${items.length})`)
  for (const item of items) {
    log.message(`• ${item.path}\n${formatReferenceSources(item.sources)}`)
  }
}

/**
 * @param {string} title
 * @param {WrongTypeReference[]} items
 */
function printWrongTypeReferenceSection(title, items) {
  if (items.length === 0) {
    return
  }
  log.warn(`${title} (${items.length})`)
  for (const item of items) {
    log.message(
      `• ${item.path}\n  Expected type: "upload"\n${formatReferenceSources(item.sources)}`,
    )
  }
}

/**
 * @param {string[]} sources
 */
function formatReferenceSources(sources) {
  const sortedSources = sources.toSorted()
  if (sortedSources.length === 1) {
    return `  Referenced by: ${sortedSources[0]}`
  }
  return [
    "  Referenced by:",
    ...sortedSources.map((source) => `  - ${source}`),
  ].join("\n")
}

/**
 * @template T
 * @param {{
 *   error: string
 *   start: string
 *   stop: (result: T) => string
 *   task: () => Promise<T>
 * }} args
 * @returns {Promise<T>}
 */
async function runSpinner({ error, start, stop, task }) {
  const activeSpinner = spinner()
  activeSpinner.start(start)
  try {
    const result = await task()
    activeSpinner.stop(stop(result))
    return result
  } catch (caughtError) {
    activeSpinner.error(error)
    throw caughtError
  }
}

/**
 * @param {{
 *   fileCount: number
 *   missingReferences: MissingReference[]
 *   orphanedFiles: string[]
 *   referenceCount: number
 * }} result
 */
function formatContentCheckSummary(result) {
  const issues = [
    formatFindingCount(result.missingReferences.length, "missing reference"),
    formatFindingCount(result.orphanedFiles.length, "orphaned file"),
  ]

  if (result.referenceCount === 0 && result.fileCount === 0) {
    return `Content files: none found.`
  }

  return `Content files: ${formatCount(result.referenceCount, "reference")}, ${formatCount(result.fileCount, "file")}; ${issues.join(", ")}.`
}

/**
 * @param {{
 *   fileCount: number
 *   orphanedCategoryImages: string[]
 *   orphanedMediaImages: string[]
 *   referenceCount: number
 * }} result
 */
function formatImageCheckSummary(result) {
  const orphanedImages =
    result.orphanedMediaImages.length + result.orphanedCategoryImages.length

  return `Images: ${formatCount(result.referenceCount, "reference")}, ${formatCount(result.fileCount, "file")}; orphaned: ${orphanedImages} (${result.orphanedMediaImages.length} media, ${result.orphanedCategoryImages.length} categories).`
}

/**
 * @param {number} count
 * @param {string} singular
 */
function formatFindingCount(count, singular) {
  if (count === 0) {
    return `no ${singular}s`
  }
  return formatCount(count, singular)
}

/**
 * @param {number} count
 * @param {string} singular
 */
function formatCount(count, singular) {
  return `${count} ${singular}${count === 1 ? "" : "s"}`
}

/**
 * @param {string} action
 * @param {number} count
 */
function formatDeletionProgress(action, count) {
  return `${action} ${count} orphaned file${count === 1 ? "" : "s"}.`
}

/**
 * @param {string|undefined} rawScope
 */
function parseScopes(rawScope) {
  const values = (rawScope ?? "content-files,images")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)

  if (values.length === 0) {
    throw new CliError(
      // intentionally kept as a CLI-facing validation error
      'Expected "--scope" to include at least one of "content-files" or "images".',
    )
  }

  const scopes = new Set(values)
  for (const scope of scopes) {
    if (!supportedScopes.has(scope)) {
      throw new CliError(
        `Unsupported scope "${scope}". Allowed values: content-files, images.`,
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
 * @param {MediaItem[]} mediaItems
 * @param {Category[]} categories
 * @param {FileStorage} mediaImageStorage
 * @param {FileStorage} categoryImageStorage
 */
async function validateImages(
  mediaItems,
  categories,
  mediaImageStorage,
  categoryImageStorage,
) {
  const mediaReferences = new Set(
    mediaItems
      .map((item) => toImagePath("media", item.image))
      .filter((value) => value !== undefined),
  )
  const categoryReferences = new Set(
    categories
      .map((item) => toImagePath("categories", item.image))
      .filter((value) => value !== undefined),
  )

  const [initializedMediaStorage, initializedCategoryStorage] =
    await Promise.all([mediaImageStorage.init(), categoryImageStorage.init()])
  const [mediaFiles, categoryFiles] = await Promise.all([
    initializedMediaStorage.list(),
    initializedCategoryStorage.list(),
  ])

  return {
    fileCount: mediaFiles.length + categoryFiles.length,
    orphanedMediaImages: mediaFiles.filter(
      (file) => !mediaReferences.has(file),
    ),
    orphanedCategoryImages: categoryFiles.filter(
      (file) => !categoryReferences.has(file),
    ),
    referenceCount: mediaReferences.size + categoryReferences.size,
  }
}

/**
 * @param {{
 *   includeLinkReferences?: boolean
 *   mediaItems: MediaItem[]
 *   storage: FileStorage
 * }} args
 */
async function validateContentFiles({
  includeLinkReferences = false,
  mediaItems,
  storage,
}) {
  const initializedStorage = await storage.init()
  const { references, wrongTypeReferences } = collectContentReferences(
    mediaItems,
    initializedStorage,
    { includeLinkReferences },
  )
  const files = await initializedStorage.list()
  if (references.size === 0) {
    return {
      fileCount: files.length,
      missingReferences: /** @type {MissingReference[]} */ ([]),
      orphanedFiles: /** @type {string[]} */ ([]),
      referenceCount: 0,
      wrongTypeReferences: /** @type {WrongTypeReference[]} */ ([]),
    }
  }

  const fileSet = new Set(files)

  const missingReferences = [...references.entries()]
    .filter(([path]) => !fileSet.has(path))
    .map(([, reference]) => ({
      path: reference.displayPath,
      sources: [...reference.sources].toSorted(),
    }))
    .sort((a, b) => a.path.localeCompare(b.path))

  const orphanedFiles = files
    .filter((filePath) => !references.has(filePath))
    .sort()

  const existingWrongTypeReferences = [...wrongTypeReferences.entries()]
    .filter(([path]) => fileSet.has(path))
    .map(([, reference]) => ({
      path: reference.displayPath,
      sources: [...reference.sources].toSorted(),
    }))
    .sort((a, b) => a.path.localeCompare(b.path))

  return {
    fileCount: files.length,
    missingReferences,
    orphanedFiles,
    referenceCount: references.size,
    wrongTypeReferences: existingWrongTypeReferences,
  }
}

/**
 * @param {MediaItem[]} mediaItems
 * @param {FileStorage} storage
 * @param {{includeLinkReferences:boolean}} options
 */
function collectContentReferences(mediaItems, storage, options) {
  const references = new Map()
  const wrongTypeReferences = new Map()
  for (const item of mediaItems) {
    const sourceFileName = posix.basename(toPosixPath(item.path))
    for (const contentItem of item.content) {
      const isLinkReference = contentItem.type === "link"
      if (
        contentItem.type !== "upload" &&
        !(options.includeLinkReferences && isLinkReference)
      ) {
        continue
      }
      const filePath = storage.toPath(contentItem.url)
      if (!filePath) {
        continue
      }
      addFileReference(references, filePath, contentItem.url, sourceFileName)
      if (isLinkReference) {
        addFileReference(
          wrongTypeReferences,
          filePath,
          contentItem.url,
          sourceFileName,
        )
      }
    }
  }
  return { references, wrongTypeReferences }
}

/**
 * @param {Map<string, FileReference>} references
 * @param {string} filePath
 * @param {string} displayPath
 * @param {string} sourceFileName
 */
function addFileReference(references, filePath, displayPath, sourceFileName) {
  const current = references.get(filePath)
  if (current) {
    current.sources.add(sourceFileName)
    return
  }
  references.set(filePath, {
    displayPath,
    sources: new Set([sourceFileName]),
  })
}

/**
 * @param {"media"|"categories"} kind
 * @param {string|undefined} image
 */
function toImagePath(kind, image) {
  if (typeof image !== "string") {
    return undefined
  }
  const relativePath = image.startsWith("./images/")
    ? image.slice("./images/".length)
    : image.startsWith("images/")
      ? image.slice("images/".length)
      : undefined
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
 * @param {string} path
 * @param {CheckFilesOptions} options
 */
function formatContentFilePath(path, options) {
  return options.r2 ? path : toLocalContentDisplayPath(path)
}

/**
 * @param {{
 *   deletions: {displayPath:string, target:string}[]
 *   promptConfirm: (message:string)=>Promise<boolean>
 * }} args
 */
async function confirmDeletion({ deletions, promptConfirm }) {
  log.warn(`Files to remove (${deletions.length})`)
  for (const deletion of deletions) {
    log.message(`• ${deletion.displayPath}`)
  }
  return promptConfirm("Delete these files? [y/N] ")
}

/**
 * @param {string} filePath
 */
function toPosixPath(filePath) {
  return filePath.split("\\").join("/")
}

/**
 * @param {string} message
 */
async function defaultPromptText(message) {
  const answer = await text({ message })
  if (isCancel(answer)) {
    cancelPrompt()
  }
  return String(answer)
}

/**
 * @param {string} message
 */
async function defaultPromptConfirm(message) {
  const answer = await confirm({
    message,
    initialValue: false,
  })
  if (isCancel(answer)) {
    cancelPrompt()
  }
  return Boolean(answer)
}
