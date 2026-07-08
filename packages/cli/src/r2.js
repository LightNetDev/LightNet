// @ts-check

import { stat } from "node:fs/promises"
import { basename, join, posix, resolve } from "node:path"
import {
  cwd as processCwd,
  env as processEnv,
  stdin,
  stdout,
} from "node:process"

import { confirm, intro, isCancel, log, outro, text } from "@clack/prompts"

import { CliError } from "./support/cli-error.js"
import { cancelPrompt } from "./support/prompt-cancel.js"
import { createR2Client } from "./support/r2.js"

const remotePathPrefix = "r2:"
const defaultRcloneOptions = {
  checkers: 16,
  transfers: 8,
}

/**
 * @typedef {{
 *   transfers?: number
 *   checkers?: number
 * }} RcloneOptions
 */

/**
 * @typedef {{
 *   force?: boolean
 *   noClobber?: boolean
 *   recursive?: boolean
 * }} R2CopyOptions
 */

/**
 * @typedef {{
 *   force?: boolean
 *   noClobber?: boolean
 * }} R2MoveOptions
 */

/**
 * @typedef {{
 *   remote: boolean
 *   path: string
 * }} CopyPath
 */

/** @typedef {"file"|"directory"|"missing"} CopyPathType */

/**
 * @typedef {{
 *   force?: boolean
 *   recursive?: boolean
 *   longForce?: boolean
 * }} R2RemoveOptions
 */

/**
 * @typedef {{
 *   cwd?: string
 *   invocationCwd?: string
 *   isInteractive?: boolean
 *   promptConfirm?: (message: string) => Promise<boolean>
 *   promptText?: (message: string) => Promise<string>
 *   writeStdout?: (message: string) => void
 * }} R2Runtime
 */

/**
 * @param {string|undefined} path
 * @param {R2Runtime} [runtime]
 */
export async function listR2(path, runtime = {}) {
  const client = createR2CommandClient(runtime)
  const output = await client.list(path)
  const writeStdout =
    runtime.writeStdout ??
    ((message) => {
      stdout.write(message)
    })
  writeStdout(output)
}

/**
 * @param {string|string[]} paths
 * @param {R2RemoveOptions} options
 * @param {R2Runtime} [runtime]
 */
export async function removeR2(paths, options, runtime = {}) {
  intro("r2 rm")
  const removePaths = Array.isArray(paths) ? paths : [paths]
  const rootPaths = removePaths.filter((path) => isR2BucketRootPath(path))
  const hasBucketRoot = rootPaths.length > 0
  if (removePaths.length === 0) {
    throw new CliError("R2 deletion requires at least one path.")
  }
  if (hasBucketRoot && removePaths.length > 1) {
    throw new CliError(
      "Refusing to delete the R2 bucket root with other paths.",
    )
  }
  if (hasBucketRoot && !options.recursive) {
    throw new CliError(
      'Refusing to delete the R2 bucket root without "--recursive".',
    )
  }

  const r2Paths = removePaths.map((path) => normalizeR2Path(path))
  for (const [index, r2Path] of r2Paths.entries()) {
    if (!r2Path && !isR2BucketRootPath(removePaths[index])) {
      throw new CliError("Refusing to delete the R2 bucket root.")
    }
  }

  const interactive = getInteractive(runtime)
  if (hasBucketRoot && options.force && !options.longForce && !interactive) {
    throw new CliError(
      'Ignoring "-f" for R2 bucket-root cleanup. If you are sure you want to delete the entire R2 bucket, use "--force".',
    )
  }
  if (hasBucketRoot && !interactive && !options.longForce) {
    throw new CliError(
      'Cleaning the R2 bucket root requires interactive confirmation. If you are sure you want to delete the entire R2 bucket, use "--force".',
    )
  }
  if (hasBucketRoot && options.force && !options.longForce) {
    log.warn(
      'Ignoring "-f" for R2 bucket-root cleanup. Use "--force" if you are sure you want to delete the entire R2 bucket.',
    )
  }
  if (hasBucketRoot) {
    log.warn(
      "This will delete ALL files in the configured R2 bucket. This cannot be undone.",
    )
  }

  const client = createR2CommandClient(runtime)
  const targets = []
  for (const [index, r2Path] of r2Paths.entries()) {
    const originalPath = removePaths[index]
    const isBucketRoot = isR2BucketRootPath(originalPath)
    const pathType = isBucketRoot
      ? "directory"
      : await getCopyPathType({ remote: true, path: r2Path }, client, runtime)

    if (pathType === "missing") {
      if (options.force) {
        continue
      }
      throw new CliError(`R2 path "${r2Path}" does not exist.`)
    }
    if (pathType === "directory" && !options.recursive) {
      throw new CliError(
        `R2 path "${r2Path}" is a directory. Re-run with "--recursive" to delete directories.`,
      )
    }
    targets.push({
      isBucketRoot,
      path: r2Path,
      recursive: pathType === "directory",
    })
  }

  if (targets.length > 0 && !options.force && !interactive) {
    throw new CliError(
      'R2 deletion requires confirmation. Re-run with "--force" in non-interactive environments.',
    )
  }

  for (const target of targets) {
    const shouldDelete = target.isBucketRoot
      ? options.longForce ||
        (await getPromptConfirm(runtime)(
          "Delete all files in the R2 bucket? [y/N] ",
        ))
      : options.force ||
        (await getPromptConfirm(runtime)(
          `Delete R2 path "${target.path}"? [y/N] `,
        ))

    if (!shouldDelete) {
      cancelPrompt()
    }

    await client.remove(target.path, {
      recursive: target.recursive,
      rcloneOptions: target.recursive ? defaultRcloneOptions : undefined,
    })
  }
  outro("R2 delete complete.")
}

/**
 * @param {string|string[]} paths
 * @param {R2CopyOptions} [options]
 * @param {R2Runtime} [runtime]
 */
export async function copyR2(paths, options = {}, runtime = {}) {
  intro("r2 cp")
  const { sources, destination } = parseCopyArguments(paths)
  if (options.force && options.noClobber) {
    throw new CliError('Cannot use "--force" with "--no-clobber".')
  }
  const sourcePaths = sources.map((source) => parseCopyPath(source))
  const destinationPath = parseCopyPath(destination)
  if (
    !destinationPath.remote &&
    sourcePaths.every((sourcePath) => !sourcePath.remote)
  ) {
    throw new CliError(
      `R2 copy requires at least one R2 path. Prefix R2 paths with "${remotePathPrefix}".`,
    )
  }

  const client = createR2CommandClient(runtime)
  const destinationType = await getCopyPathType(
    destinationPath,
    client,
    runtime,
  )
  if (
    sourcePaths.length > 1 &&
    destinationType !== "directory" &&
    !isDirectoryLikeCopyPath(destinationPath)
  ) {
    throw new CliError(
      "Copying multiple sources requires a directory destination.",
    )
  }

  for (const [index, sourcePath] of sourcePaths.entries()) {
    const source = sources[index]
    const sourceType = await getCopyPathType(sourcePath, client, runtime)
    if (sourceType === "missing") {
      throw new CliError(`Copy source "${source}" does not exist.`)
    }
    if (sourceType === "directory" && !options.recursive) {
      throw new CliError(
        `Copy source "${source}" is a directory. Re-run with "--recursive" to copy directories.`,
      )
    }

    const targetPath = getCopyTargetPath({
      destination: destinationPath,
      destinationType,
      runtime,
      source: sourcePath,
      sourceType,
    })
    const targetType = await getCopyPathType(targetPath, client, runtime)
    const shouldUseCopyTo =
      sourceType === "file" &&
      (targetType !== "directory" || isDirectoryLikeCopyPath(destinationPath))

    await confirmCopyOverwrite({
      destination,
      force: options.force === true,
      noClobber: options.noClobber === true,
      runtime,
      sourceType,
      targetPath,
      targetType,
    })

    await client.copy(
      await toRcloneCopyPath(sourcePath, client, runtime),
      await toRcloneCopyPath(targetPath, client, runtime),
      {
        ignoreExisting: options.noClobber === true,
        rcloneOptions: defaultRcloneOptions,
        to: shouldUseCopyTo,
      },
    )
  }
  outro("R2 copy complete.")
}

/**
 * @param {string|string[]} paths
 * @param {R2MoveOptions} options
 * @param {R2Runtime} [runtime]
 */
export async function moveR2(paths, options = {}, runtime = {}) {
  intro("r2 mv")
  const { sources, destination } = parseCopyArguments(paths)
  if (options.force && options.noClobber) {
    throw new CliError('Cannot use "--force" with "--no-clobber".')
  }
  const sourcePaths = sources.map((source) =>
    parseR2OnlyPath(source, "Move source"),
  )
  const destinationPath = parseR2OnlyPath(destination, "Move destination")
  if (
    sources.some((source) => isR2BucketRootPath(source)) ||
    isR2BucketRootPath(destination)
  ) {
    throw new CliError("Refusing to move the R2 bucket root.")
  }

  const client = createR2CommandClient(runtime)
  const destinationType = await getCopyPathType(
    destinationPath,
    client,
    runtime,
  )
  if (
    sourcePaths.length > 1 &&
    destinationType !== "directory" &&
    !isDirectoryLikeCopyPath(destinationPath)
  ) {
    throw new CliError(
      "Moving multiple sources requires a directory destination.",
    )
  }

  for (const [index, sourcePath] of sourcePaths.entries()) {
    const source = sources[index]
    const sourceType = await getCopyPathType(sourcePath, client, runtime)
    if (sourceType === "missing") {
      throw new CliError(`Move source "${source}" does not exist.`)
    }

    const targetPath = getCopyTargetPath({
      destination: destinationPath,
      destinationType,
      runtime,
      source: sourcePath,
      sourceType,
    })
    const targetType = await getCopyPathType(targetPath, client, runtime)
    const shouldUseMoveTo =
      sourceType === "file" &&
      (targetType !== "directory" || isDirectoryLikeCopyPath(destinationPath))

    await confirmCopyOverwrite({
      destination,
      force: options.force === true,
      noClobber: options.noClobber === true,
      runtime,
      sourceType,
      targetPath,
      targetType,
    })

    await client.move(
      await toRcloneCopyPath(sourcePath, client, runtime),
      await toRcloneCopyPath(targetPath, client, runtime),
      {
        ignoreExisting: options.noClobber === true,
        rcloneOptions: defaultRcloneOptions,
        to: shouldUseMoveTo,
      },
    )
  }
  outro("R2 move complete.")
}

/**
 * @param {R2Runtime} runtime
 */
function createR2CommandClient(runtime) {
  return createR2Client({
    cwd: runtime.cwd ?? processCwd(),
    interactive: getInteractive(runtime),
    promptText: getPromptText(runtime),
  })
}

/**
 * @param {R2Runtime} runtime
 */
function getInteractive(runtime) {
  return runtime.isInteractive ?? Boolean(stdin.isTTY && stdout.isTTY)
}

/**
 * @param {R2Runtime} runtime
 */
function getPromptText(runtime) {
  return runtime.promptText ?? defaultPromptText
}

/**
 * @param {R2Runtime} runtime
 */
function getPromptConfirm(runtime) {
  return runtime.promptConfirm ?? defaultPromptConfirm
}

/**
 * @param {string} value
 */
function parseCopyPath(value) {
  if (!value.startsWith(remotePathPrefix)) {
    return { remote: false, path: value }
  }
  return { remote: true, path: normalizeR2Path(value) }
}

/**
 * @param {string|string[]} paths
 * @returns {{sources: string[], destination: string}}
 */
function parseCopyArguments(paths) {
  const copyPaths = Array.isArray(paths) ? paths : [paths]
  if (copyPaths.length < 2) {
    throw new CliError(
      "R2 copy requires at least one source and a destination.",
    )
  }
  return {
    sources: copyPaths.slice(0, -1),
    destination: copyPaths[copyPaths.length - 1],
  }
}

/**
 * @param {string} value
 * @param {string} label
 * @returns {CopyPath}
 */
function parseR2OnlyPath(value, label) {
  if (value.startsWith(remotePathPrefix)) {
    return { remote: true, path: normalizeR2Path(value) }
  }
  if (value.startsWith("/") || value.startsWith("./") || value === ".") {
    throw new CliError(`${label} must be an R2 path, not a local path.`)
  }
  return { remote: true, path: normalizeR2Path(value) }
}

/**
 * @param {{
 *   destination: CopyPath,
 *   destinationType: CopyPathType,
 *   runtime: R2Runtime,
 *   source: CopyPath,
 *   sourceType: CopyPathType
 * }} args
 * @returns {CopyPath}
 */
function getCopyTargetPath({
  destination,
  destinationType,
  runtime,
  source,
  sourceType,
}) {
  if (sourceType === "directory") {
    if (destinationType === "file") {
      throw new CliError("Cannot copy a directory to an existing file.")
    }
    if (isCopyPathContentsOnly(source)) {
      return destination
    }
    if (
      destinationType === "directory" ||
      isDirectoryLikeCopyPath(destination)
    ) {
      return {
        ...destination,
        path: joinCopyPath(destination, getCopyPathName(source, runtime)),
      }
    }
    return destination
  }

  if (
    destinationType === "directory" ||
    (destinationType === "missing" && isDirectoryLikeCopyPath(destination))
  ) {
    return {
      ...destination,
      path: joinCopyPath(destination, getCopyPathName(source, runtime)),
    }
  }

  return destination
}

/**
 * @param {{
 *   destination: string,
 *   force: boolean,
 *   noClobber: boolean,
 *   runtime: R2Runtime,
 *   sourceType: CopyPathType,
 *   targetPath: CopyPath,
 *   targetType: CopyPathType
 * }} args
 */
async function confirmCopyOverwrite({
  destination,
  force,
  noClobber,
  runtime,
  sourceType,
  targetPath,
  targetType,
}) {
  if (targetType === "missing") {
    return
  }
  if (sourceType === "directory" && targetType === "file") {
    throw new CliError("Cannot transfer a directory to an existing file.")
  }
  if (
    sourceType === "file" &&
    targetType === "directory" &&
    !isDirectoryLikeCopyPath(targetPath)
  ) {
    throw new CliError("Cannot overwrite an existing directory with a file.")
  }
  if (force) {
    return
  }
  if (noClobber) {
    return
  }
  if (!getInteractive(runtime)) {
    throw new CliError(
      'Transfer would overwrite existing files. Re-run with "--force" in non-interactive environments.',
    )
  }
  const message =
    sourceType === "directory"
      ? `Overwrite any existing files under destination "${destination}"? [y/N] `
      : `Overwrite existing destination "${destination}"? [y/N] `
  const shouldOverwrite = await getPromptConfirm(runtime)(message)
  if (!shouldOverwrite) {
    cancelPrompt()
  }
}

/**
 * @param {CopyPath} copyPath
 * @param {ReturnType<typeof createR2CommandClient>} client
 * @param {R2Runtime} runtime
 * @returns {Promise<CopyPathType>}
 */
async function getCopyPathType(copyPath, client, runtime) {
  if (copyPath.remote) {
    return client.getPathType(copyPath.path)
  }
  try {
    const stats = await stat(resolveLocalPath(copyPath.path, runtime))
    return stats.isDirectory() ? "directory" : "file"
  } catch (error) {
    if (isLocalNotFoundError(error)) {
      return "missing"
    }
    throw error
  }
}

/**
 * @param {CopyPath} copyPath
 * @param {ReturnType<typeof createR2CommandClient>} client
 * @param {R2Runtime} runtime
 */
async function toRcloneCopyPath(copyPath, client, runtime) {
  return copyPath.remote
    ? await client.toRemotePath(copyPath.path)
    : resolveLocalPath(copyPath.path, runtime)
}

/**
 * @param {CopyPath} copyPath
 */
function isDirectoryLikeCopyPath(copyPath) {
  return copyPath.path === "." || copyPath.path.endsWith("/")
}

/**
 * @param {CopyPath} copyPath
 */
function isCopyPathContentsOnly(copyPath) {
  const path = copyPath.remote
    ? copyPath.path
    : copyPath.path.replaceAll("\\", "/")
  return path === "." || path.endsWith("/.")
}

/**
 * @param {CopyPath} parent
 * @param {string} child
 */
function joinCopyPath(parent, child) {
  if (parent.remote) {
    return parent.path ? posix.join(parent.path, child) : child
  }
  return join(parent.path, child)
}

/**
 * @param {CopyPath} copyPath
 * @param {R2Runtime} runtime
 */
function getCopyPathName(copyPath, runtime) {
  return copyPath.remote
    ? posix.basename(copyPath.path.replace(/\/+$/, ""))
    : basename(resolveLocalPath(copyPath.path, runtime))
}

/**
 * @param {string} path
 * @param {R2Runtime} runtime
 */
function resolveLocalPath(path, runtime) {
  return resolve(getInvocationCwd(runtime), path)
}

/**
 * @param {R2Runtime} runtime
 */
function getInvocationCwd(runtime) {
  return runtime.invocationCwd ?? processEnv.INIT_CWD ?? processCwd()
}

/**
 * @param {string|undefined} path
 */
function normalizeR2Path(path) {
  return path?.replace(/^r2:/, "").replace(/^\/+/, "") ?? ""
}

/**
 * @param {string} path
 */
function isR2BucketRootPath(path) {
  return path.trim() === "/"
}

/**
 * @param {unknown} error
 */
function isLocalNotFoundError(error) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  )
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
  return answer
}
