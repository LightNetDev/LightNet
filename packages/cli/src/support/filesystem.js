// @ts-check

import { access, readdir, readFile, unlink } from "node:fs/promises"
import { join, posix, relative, resolve } from "node:path"

import { CliError } from "./cli-error.js"

const localJunkFileNames = new Set([".DS_Store"])
const publicFilesDir = "public/files"

/**
 * @typedef {{
 *   init: () => Promise<FileStorage>
 *   list: () => Promise<string[]>
 *   delete: (paths: string[]) => Promise<string[]>
 *   toPath: (url: string) => string|undefined
 * }} FileStorage
 */

/**
 * @param {string} cwd
 * @returns {FileStorage}
 */
export function contentFiles(cwd) {
  return files(cwd, {
    displayPath: (path) =>
      `/${toPosixPath(relative(resolve(cwd, "public"), resolve(cwd, path)))}`,
    rootDir: publicFilesDir,
    toAbsolutePath: toLocalContentFilePath,
    toPath: (url) => (url.startsWith("/files/") ? url : undefined),
  })
}

/**
 * @param {string} cwd
 * @param {{
 *   displayPath?: (path:string) => string
 *   ignoreJunk?: boolean
 *   rootDir: string
 *   toAbsolutePath?: (path:string) => string
 *   toPath?: (url:string) => string|undefined
 * }} options
 * @returns {FileStorage}
 */
export function files(cwd, options) {
  const storage = {
    async init() {
      return storage
    },
    async list() {
      return collectLocalFiles(resolve(cwd, options.rootDir), {
        displayPath: options.displayPath ?? ((path) => path),
        ignoreJunk: options.ignoreJunk ?? true,
        rootDir: options.rootDir,
      })
    },
    /**
     * @param {string[]} paths
     */
    async delete(paths) {
      const removals = await Promise.all(
        paths.map(async (path) => {
          try {
            await unlink(
              resolve(
                cwd,
                options.toAbsolutePath?.(path) ??
                  toLocalFilePath(options.rootDir, path),
              ),
            )
            return path
          } catch {
            // The caller prints per-file failures based on the returned paths.
            return undefined
          }
        }),
      )
      return removals.filter((path) => path !== undefined)
    },
    /**
     * @param {string} url
     */
    toPath(url) {
      return options.toPath?.(url)
    },
  }
  return storage
}

/**
 * @param {string} dirPath
 */
export async function jsonFiles(dirPath) {
  if (!(await pathExists(dirPath))) {
    return []
  }
  const files = await walkFiles(dirPath)
  return files.filter((filePath) => filePath.endsWith(".json")).sort()
}

/**
 * @param {string} filePath
 */
export async function readJsonFile(filePath) {
  const text = await readFile(filePath, "utf8")
  try {
    return JSON.parse(text)
  } catch {
    throw new CliError(`Invalid JSON in "${filePath}".`)
  }
}

/**
 * @param {string} filePath
 */
export async function pathExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * @param {string} path
 */
export function toLocalContentDisplayPath(path) {
  if (!path.startsWith("/files/")) {
    return path
  }
  return toPosixPath(join(publicFilesDir, path.slice("/files/".length)))
}

/**
 * @param {string} absoluteDir
 * @param {{displayPath:(path:string)=>string, ignoreJunk:boolean, rootDir:string}} options
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
      options.displayPath(
        toPosixPath(join(options.rootDir, relative(absoluteDir, filePath))),
      ),
    )
    .sort()
}

/**
 * @param {string} dirPath
 */
async function walkFiles(dirPath) {
  /** @type {string[]} */
  const files = []
  const entries = await readdir(dirPath, { withFileTypes: true })
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(dirPath, entry.name)
      if (entry.isDirectory()) {
        return walkFiles(entryPath)
      }
      return entry.isFile() ? [entryPath] : []
    }),
  )
  for (const item of nestedFiles) {
    files.push(...item)
  }
  return files
}

/**
 * @param {string} path
 */
function toLocalContentFilePath(path) {
  if (!path.startsWith("/files/")) {
    throw new CliError(`Unexpected local content file path "${path}".`)
  }
  const relativePath = path.slice("/files/".length)
  if (
    !relativePath ||
    relativePath.startsWith("/") ||
    relativePath.includes("../")
  ) {
    throw new CliError(`Unexpected local content file path "${path}".`)
  }
  return toPosixPath(join(publicFilesDir, relativePath))
}

/**
 * @param {string} rootDir
 * @param {string} path
 */
function toLocalFilePath(rootDir, path) {
  if (!path.startsWith(`${rootDir}/`) && path !== rootDir) {
    throw new CliError(`Unexpected local file path "${path}".`)
  }
  if (path.includes("../")) {
    throw new CliError(`Unexpected local file path "${path}".`)
  }
  return path
}

/**
 * @param {string} filePath
 */
function toPosixPath(filePath) {
  return filePath.split("\\").join("/")
}

/**
 * @param {string} filePath
 */
