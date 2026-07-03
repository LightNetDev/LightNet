// @ts-check

import { posix, relative, resolve } from "node:path"

import { CliError } from "./cli-error.js"
import { jsonFiles, pathExists, readJsonFile } from "./filesystem.js"

const mediaDir = "src/content/media"
const categoriesDir = "src/content/categories"

/**
 * @typedef {{
 *   type: "upload"|"link"
 *   url: string
 * }} MediaContent
 */

/**
 * @typedef {{
 *   path: string
 *   id: string
 *   image: string
 *   content: MediaContent[]
 * }} MediaItem
 */

/**
 * @typedef {{
 *   path: string
 *   id: string
 *   image?: string
 * }} Category
 */

/**
 * @typedef {{
 *   getMediaItems: () => Promise<MediaItem[]>
 *   getCategories: () => Promise<Category[]>
 * }} ContentCollections
 */

/**
 * @param {string} cwd
 * @returns {ContentCollections}
 */
export function contentCollections(cwd) {
  return {
    async getMediaItems() {
      const files = await jsonFiles(resolve(cwd, mediaDir))
      /** @type {MediaItem[]} */
      const items = []
      for (const filePath of files) {
        items.push(await readMediaItem(cwd, filePath))
      }
      return items
    },
    async getCategories() {
      const absoluteDir = resolve(cwd, categoriesDir)
      if (!(await pathExists(absoluteDir))) {
        return []
      }
      const files = await jsonFiles(absoluteDir)
      /** @type {Category[]} */
      const items = []
      for (const filePath of files) {
        items.push(await readCategory(cwd, filePath))
      }
      return items
    },
  }
}

/**
 * @param {string} cwd
 * @param {string} filePath
 * @returns {Promise<MediaItem>}
 */
async function readMediaItem(cwd, filePath) {
  const value = await readJsonFile(filePath)
  if (!isPlainObject(value)) {
    throw new CliError(
      `Invalid media item in "${filePath}": expected an object.`,
    )
  }

  const image = readRequiredImageReference(value.image, filePath)
  const content = readContentArray(value.content, filePath)

  return {
    path: filePath,
    id: toCollectionId(cwd, mediaDir, filePath),
    content,
    image,
  }
}

/**
 * @param {string} cwd
 * @param {string} filePath
 * @returns {Promise<Category>}
 */
async function readCategory(cwd, filePath) {
  const value = await readJsonFile(filePath)
  if (!isPlainObject(value)) {
    throw new CliError(`Invalid category in "${filePath}": expected an object.`)
  }

  return {
    path: filePath,
    id: toCollectionId(cwd, categoriesDir, filePath),
    image: readOptionalImageReference(value.image, filePath),
  }
}

/**
 * @param {string} cwd
 * @param {string} collectionDir
 * @param {string} filePath
 */
function toCollectionId(cwd, collectionDir, filePath) {
  const relativePath = posix.normalize(
    toPosixPath(relative(resolve(cwd, collectionDir), filePath)),
  )
  return relativePath.replace(/\.json$/, "")
}

/**
 * @param {unknown} value
 * @param {string} filePath
 */
function readRequiredImageReference(value, filePath) {
  if (typeof value !== "string") {
    throw new CliError(`Invalid "image" in "${filePath}": expected a string.`)
  }
  return value
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
 * @returns {MediaContent[]}
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
function toPosixPath(filePath) {
  return filePath.split("\\").join("/")
}
