// @ts-check

import { rm, stat } from "node:fs/promises"
import { basename, join, posix, resolve } from "node:path"
import {
  cwd as processCwd,
  env as processEnv,
  stdin,
  stdout,
} from "node:process"

import { confirm, isCancel, log, text } from "@clack/prompts"

import { CliError } from "./support/cli-error.js"
import { cancelPrompt } from "./support/prompt-cancel.js"
import { createR2Client } from "./support/r2.js"

const remotePathPrefix = "r2:"

/**
 * @typedef {{
 *   force?: boolean
 * }} R2CopyOptions
 */

/**
 * @typedef {{
 *   force?: boolean
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
 * @param {string} path
 * @param {R2RemoveOptions} options
 * @param {R2Runtime} [runtime]
 */
export async function removeR2(path, options, runtime = {}) {
  const r2Path = normalizeR2Path(path)
  const isBucketRoot = isR2BucketRootPath(path)
  if (isBucketRoot && !options.recursive) {
    throw new CliError(
      'Refusing to delete the R2 bucket root without "--recursive".',
    )
  }
  if (!r2Path && !isBucketRoot) {
    throw new CliError("Refusing to delete the R2 bucket root.")
  }

  const interactive = getInteractive(runtime)
  if (isBucketRoot && !interactive) {
    throw new CliError(
      "Cleaning the R2 bucket root requires interactive confirmation.",
    )
  }
  if (!options.force && !interactive) {
    throw new CliError(
      'R2 deletion requires confirmation. Re-run with "--force" in non-interactive environments.',
    )
  }

  if (isBucketRoot) {
    log.warn(
      "This will delete ALL files in the configured R2 bucket. This cannot be undone.",
    )
  }

  const shouldDelete = isBucketRoot
    ? await getPromptConfirm(runtime)(
        "Delete all files in the R2 bucket? [y/N] ",
      )
    : options.force ||
      (await getPromptConfirm(runtime)(`Delete R2 path "${r2Path}"? [y/N] `))

  if (!shouldDelete) {
    return
  }

  const client = createR2CommandClient(runtime)
  await client.remove(r2Path, {
    recursive: options.recursive === true,
  })
}

/**
 * @param {string} source
 * @param {string} destination
 * @param {R2CopyOptions} [options]
 * @param {R2Runtime} [runtime]
 */
export async function copyR2(source, destination, options = {}, runtime = {}) {
  const sourcePath = parseCopyPath(source)
  const destinationPath = parseCopyPath(destination)
  if (!sourcePath.remote && !destinationPath.remote) {
    throw new CliError(
      `R2 copy requires at least one R2 path. Prefix R2 paths with "${remotePathPrefix}".`,
    )
  }

  const client = createR2CommandClient(runtime)
  const sourceType = await getCopyPathType(sourcePath, client, runtime)
  if (sourceType === "missing") {
    throw new CliError(`Copy source "${source}" does not exist.`)
  }

  const destinationType = await getCopyPathType(
    destinationPath,
    client,
    runtime,
  )
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
    runtime,
    sourceType,
    targetPath,
    targetType,
  })
  await replaceCopyTargetBeforeCopy({
    client,
    runtime,
    sourceType,
    targetPath,
    targetType,
  })

  await client.copy(
    await toRcloneCopyPath(sourcePath, client, runtime),
    await toRcloneCopyPath(targetPath, client, runtime),
    { to: shouldUseCopyTo },
  )
}

/**
 * @param {string} source
 * @param {string} destination
 * @param {R2MoveOptions} options
 * @param {R2Runtime} [runtime]
 */
export async function moveR2(source, destination, options, runtime = {}) {
  const sourcePath = parseR2OnlyPath(source, "Move source")
  const destinationPath = parseR2OnlyPath(destination, "Move destination")
  if (isR2BucketRootPath(source) || isR2BucketRootPath(destination)) {
    throw new CliError("Refusing to move the R2 bucket root.")
  }

  const client = createR2CommandClient(runtime)
  const sourceType = await getCopyPathType(sourcePath, client, runtime)
  if (sourceType === "missing") {
    throw new CliError(`Move source "${source}" does not exist.`)
  }
  const destinationType = await getCopyPathType(
    destinationPath,
    client,
    runtime,
  )
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
    runtime,
    sourceType,
    targetPath,
    targetType,
  })
  await replaceCopyTargetBeforeCopy({
    client,
    runtime,
    sourceType,
    targetPath,
    targetType,
  })

  await client.move(
    await toRcloneCopyPath(sourcePath, client, runtime),
    await toRcloneCopyPath(targetPath, client, runtime),
    { to: shouldUseMoveTo },
  )
}

/**
 * @param {{
 *   client: ReturnType<typeof createR2CommandClient>,
 *   runtime: R2Runtime,
 *   sourceType: CopyPathType,
 *   targetPath: CopyPath,
 *   targetType: CopyPathType
 * }} args
 */
async function replaceCopyTargetBeforeCopy({
  client,
  runtime,
  sourceType,
  targetPath,
  targetType,
}) {
  if (sourceType !== "directory" || targetType !== "directory") {
    return
  }
  if (targetPath.remote) {
    await client.remove(targetPath.path, { recursive: true })
    return
  }
  await rm(resolveLocalPath(targetPath.path, runtime), {
    force: true,
    recursive: true,
  })
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
 *   runtime: R2Runtime,
 *   sourceType: CopyPathType,
 *   targetPath: CopyPath,
 *   targetType: CopyPathType
 * }} args
 */
async function confirmCopyOverwrite({
  destination,
  force,
  runtime,
  sourceType,
  targetPath,
  targetType,
}) {
  if (targetType === "missing") {
    return
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
  if (!getInteractive(runtime)) {
    throw new CliError(
      'Copy would overwrite existing files. Re-run with "--force" in non-interactive environments.',
    )
  }
  const shouldOverwrite = await getPromptConfirm(runtime)(
    `Overwrite existing destination "${destination}"? [y/N] `,
  )
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
