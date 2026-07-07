// @ts-check

import { resolve } from "node:path"
import {
  cwd as processCwd,
  env as processEnv,
  stdin,
  stdout,
} from "node:process"

import { confirm, isCancel, text } from "@clack/prompts"

import { CliError } from "./support/cli-error.js"
import { cancelPrompt } from "./support/prompt-cancel.js"
import { createR2Client } from "./support/r2.js"

const remotePathPrefix = "r2:"

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
  if (!r2Path) {
    throw new CliError("Refusing to delete the R2 bucket root.")
  }

  const interactive = getInteractive(runtime)
  if (!options.force && !interactive) {
    throw new CliError(
      'R2 deletion requires confirmation. Re-run with "--force" in non-interactive environments.',
    )
  }

  const shouldDelete =
    options.force ||
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
 * @param {R2Runtime} [runtime]
 */
export async function copyR2(source, destination, runtime = {}) {
  const sourcePath = parseCopyPath(source)
  const destinationPath = parseCopyPath(destination)
  if (sourcePath.remote === destinationPath.remote) {
    throw new CliError(
      `R2 copy requires exactly one R2 path. Prefix the remote side with "${remotePathPrefix}".`,
    )
  }

  const client = createR2CommandClient(runtime)
  const rcloneSource = sourcePath.remote
    ? await client.toRemotePath(sourcePath.path)
    : resolveLocalPath(sourcePath.path, runtime)
  const rcloneDestination = destinationPath.remote
    ? await client.toRemotePath(destinationPath.path)
    : resolveLocalPath(destinationPath.path, runtime)

  await client.copy(rcloneSource, rcloneDestination)
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
