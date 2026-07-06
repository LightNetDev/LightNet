// @ts-check

import { execFile } from "node:child_process"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { env as processEnv } from "node:process"
import { promisify } from "node:util"

import { isCancel, log, password } from "@clack/prompts"

import {
  cliConfigFileName,
  readCliConfig,
  writeCliConfig,
} from "./cli-config.js"
import { CliError } from "./cli-error.js"
import { cancelPrompt } from "./prompt-cancel.js"

const execFileAsync = promisify(execFile)
const sessionSecretEnvName = "LIGHTNET_R2_SECRET_ACCESS_KEY"
const r2DeleteBatchSize = 1000

/**
 * @typedef {{
 *   publicUrl: string
 *   accountId: string
 *   accessKeyId: string
 *   bucket: string
 * }} R2Config
 */

/**
 * @param {{
 *   cwd: string
 *   interactive: boolean
 *   promptText: (message: string) => Promise<string>
 * }} args
 */
async function initR2Config({ cwd, interactive, promptText }) {
  const config = await readCliConfig(cwd)
  const parsed = parseR2Config(config)
  if (parsed) {
    return parsed
  }

  if (!interactive) {
    throw new CliError(
      `Missing valid ${cliConfigFileName} with "r2.publicUrl", "r2.accountId", "r2.accessKeyId", and "r2.bucket".`,
    )
  }

  log.error(`Missing R2 config in "${cliConfigFileName}".`)
  return promptForR2Config({ cwd, promptText })
}

/**
 * @param {{
 *   cwd: string
 *   interactive: boolean
 *   promptConfirm: (message: string) => Promise<boolean>
 *   promptText: (message: string) => Promise<string>
 * }} args
 */
export function createR2FileStorage({
  cwd,
  interactive,
  promptConfirm,
  promptText,
}) {
  /** @type {R2Config|undefined} */
  let config
  /** @type {string|undefined} */
  let secretAccessKey

  /** @returns {Promise<R2Config>} */
  const getConfig = async () => {
    if (config) {
      return config
    }
    const initializedConfig = await initR2Config({
      cwd,
      interactive,
      promptText,
    })
    config = initializedConfig
    return initializedConfig
  }

  /** @returns {Promise<string>} */
  const getSecretAccessKey = async () => {
    if (!secretAccessKey) {
      secretAccessKey = await promptRequiredSecret()
    }
    return secretAccessKey
  }

  /**
   * @template T
   * @param {(config: R2Config) => Promise<T>} operation
   */
  const runWithRefresh = async (operation) => {
    try {
      return await operation(await getConfig())
    } catch (error) {
      if (!interactive) {
        throw error
      }
      log.error(error instanceof Error ? error.message : "R2 operation failed.")
      const shouldRefresh = await promptConfirm(
        "Refresh saved R2 settings and try again? [y/N] ",
      )
      if (!shouldRefresh) {
        throw error
      }
      const refreshedConfig = await promptForR2Config({ cwd, promptText })
      config = refreshedConfig
      return operation(refreshedConfig)
    }
  }

  const storage = {
    async init() {
      await getConfig()
      await getSecretAccessKey()
      return storage
    },
    async list() {
      return runWithRefresh(async (config) => {
        const bucketObjects = await listR2Objects({
          cwd,
          config,
          secretAccessKey: await getSecretAccessKey(),
        })
        return bucketObjects.map((item) => item.key).sort()
      })
    },
    /**
     * @param {string[]} paths
     */
    async delete(paths) {
      const r2Config = await getConfig()
      const secretAccessKey = await getSecretAccessKey()
      return deleteR2Objects({
        config: r2Config,
        cwd,
        paths,
        secretAccessKey,
      })
    },
    /**
     * @param {string} url
     */
    toPath(url) {
      if (!config) {
        throw new CliError("R2 storage must be initialized before use.")
      }
      const normalizedBase = config.publicUrl.replace(/\/+$/, "")
      if (!url.startsWith(normalizedBase)) {
        return undefined
      }
      const path = url.slice(normalizedBase.length).replace(/^\/+/, "")
      return decodeR2ObjectPath(path) || undefined
    },
  }
  return storage
}

/**
 * @param {string} path
 */
function decodeR2ObjectPath(path) {
  try {
    return decodeURIComponent(path)
  } catch {
    return path
  }
}

/**
 * @param {{
 *   config: R2Config
 *   cwd: string
 *   paths: string[]
 *   secretAccessKey: string
 * }} args
 */
async function deleteR2Objects({ config, cwd, paths, secretAccessKey }) {
  /** @type {string[]} */
  const removed = []
  const batchablePaths = paths.filter((path) => !path.includes("\n"))
  const singleDeletePaths = paths.filter((path) => path.includes("\n"))

  for (
    let index = 0;
    index < batchablePaths.length;
    index += r2DeleteBatchSize
  ) {
    const batch = batchablePaths.slice(index, index + r2DeleteBatchSize)
    try {
      await deleteR2ObjectBatch({ config, cwd, paths: batch, secretAccessKey })
      removed.push(...batch)
    } catch {
      removed.push(
        ...(await deleteR2ObjectsIndividually({
          config,
          cwd,
          paths: batch,
          secretAccessKey,
        })),
      )
    }
  }

  removed.push(
    ...(await deleteR2ObjectsIndividually({
      config,
      cwd,
      paths: singleDeletePaths,
      secretAccessKey,
    })),
  )

  return removed
}

/**
 * @param {{
 *   config: R2Config
 *   cwd: string
 *   paths: string[]
 *   secretAccessKey: string
 * }} args
 */
async function deleteR2ObjectBatch({ config, cwd, paths, secretAccessKey }) {
  if (paths.length === 0) {
    return
  }

  const tempDir = await mkdtemp(join(tmpdir(), "lightnet-r2-delete-"))
  const fileListPath = join(tempDir, "files.txt")
  try {
    await writeFile(fileListPath, `${paths.join("\n")}\n`, "utf8")
    await runConfiguredRclone({
      args: [
        "delete",
        makeR2Path(config),
        "--files-from-raw",
        fileListPath,
        "--fast-list",
      ],
      cwd,
      config,
      secretAccessKey,
    })
  } finally {
    await rm(tempDir, { force: true, recursive: true })
  }
}

/**
 * @param {{
 *   config: R2Config
 *   cwd: string
 *   paths: string[]
 *   secretAccessKey: string
 * }} args
 */
async function deleteR2ObjectsIndividually({
  config,
  cwd,
  paths,
  secretAccessKey,
}) {
  /** @type {string[]} */
  const removed = []
  for (const path of paths) {
    try {
      await runConfiguredRclone({
        args: ["deletefile", makeR2Path(config, path)],
        cwd,
        config,
        secretAccessKey,
      })
      removed.push(path)
    } catch {
      // The caller prints per-file failures based on the returned paths.
    }
  }
  return removed
}

/**
 * @param {{
 *   cwd: string
 *   config: R2Config
 *   secretAccessKey: string
 * }} args
 */
async function listR2Objects(args) {
  let listJson
  try {
    const result = await runConfiguredRclone({
      args: [
        "lsjson",
        makeR2Path(args.config),
        "--recursive",
        "--files-only",
        "--fast-list",
        "--no-mimetype",
        "--no-modtime",
      ],
      ...args,
    })
    listJson = result.stdout
  } catch (error) {
    throw new CliError(
      error instanceof Error
        ? `Unable to access R2 bucket "${args.config.bucket}": ${error.message}`
        : `Unable to access R2 bucket "${args.config.bucket}".`,
    )
  }

  let parsed
  try {
    parsed = JSON.parse(listJson)
  } catch {
    throw new CliError(
      `Unable to parse rclone listing for bucket "${args.config.bucket}".`,
    )
  }
  if (!Array.isArray(parsed)) {
    throw new CliError(
      `Unexpected rclone listing output for bucket "${args.config.bucket}".`,
    )
  }

  return parsed
    .filter((item) => isPlainObject(item) && typeof item.Path === "string")
    .map((item) => ({ key: item.Path }))
}

/**
 * @param {{
 *   args: string[]
 *   cwd: string
 *   config: R2Config
 *   secretAccessKey: string
 * }} args
 */
async function runConfiguredRclone({ args, cwd, config, secretAccessKey }) {
  const env = {
    ...processEnv,
    RCLONE_S3_SECRET_ACCESS_KEY: secretAccessKey,
  }

  try {
    return await defaultRunRclone(
      [
        ...args,
        "--s3-provider",
        "Cloudflare",
        "--s3-access-key-id",
        config.accessKeyId,
        "--s3-region",
        "auto",
        "--s3-endpoint",
        getR2Endpoint(config.accountId),
      ],
      cwd,
      env,
    )
  } catch (error) {
    throw new CliError(getSanitizedRcloneError(error))
  }
}

/**
 * @param {{cwd:string, promptText:(message:string)=>Promise<string>}} args
 */
async function promptForR2Config({ cwd, promptText }) {
  const publicUrl = await promptRequiredText(promptText, "R2 publicUrl: ")
  const accountId = await promptRequiredText(promptText, "R2 accountId: ")
  const accessKeyId = await promptRequiredText(promptText, "R2 accessKeyId: ")
  const bucket = await promptRequiredText(promptText, "R2 bucket: ")

  const nextConfig = {
    ...(await readCliConfig(cwd)),
    r2: {
      publicUrl,
      accountId,
      accessKeyId,
      bucket,
    },
  }

  await writeCliConfig(cwd, nextConfig)

  return nextConfig.r2
}

/**
 * @returns {Promise<string>}
 */
async function promptRequiredSecret() {
  const sessionSecret = processEnv[sessionSecretEnvName]
  if (typeof sessionSecret === "string" && sessionSecret.trim()) {
    return sessionSecret
  }

  while (true) {
    const value = await password({
      message: "R2 secretAccessKey:",
    })
    if (isCancel(value)) {
      cancelPrompt()
    }
    if (value.trim()) {
      processEnv[sessionSecretEnvName] = value
      return value
    }
  }
}

/**
 * @param {(message:string)=>Promise<string>} promptText
 * @param {string} message
 */
async function promptRequiredText(promptText, message) {
  while (true) {
    const value = (await promptText(message)).trim()
    if (value) {
      return value
    }
  }
}

/**
 * @param {unknown} config
 * @returns {R2Config|undefined}
 */
function parseR2Config(config) {
  if (!isPlainObject(config)) {
    return undefined
  }
  const rootConfig = /** @type {Record<string, unknown>} */ (config)
  if (!isPlainObject(rootConfig.r2)) {
    return undefined
  }
  const r2Config = /** @type {Record<string, unknown>} */ (rootConfig.r2)
  const { publicUrl, accountId, accessKeyId, bucket } = r2Config
  if (
    typeof publicUrl !== "string" ||
    typeof accountId !== "string" ||
    typeof accessKeyId !== "string" ||
    typeof bucket !== "string" ||
    !publicUrl ||
    !accountId ||
    !accessKeyId ||
    !bucket
  ) {
    return undefined
  }
  return { publicUrl, accountId, accessKeyId, bucket }
}

/**
 * @param {R2Config} config
 * @param {string} [objectKey]
 */
function makeR2Path(config, objectKey = "") {
  return objectKey
    ? `:s3:${config.bucket}/${objectKey}`
    : `:s3:${config.bucket}`
}

/**
 * @param {string} accountId
 */
function getR2Endpoint(accountId) {
  return `https://${accountId}.r2.cloudflarestorage.com`
}

/**
 * @param {string[]} args
 * @param {string} cwd
 * @param {NodeJS.ProcessEnv} [env]
 */
async function defaultRunRclone(args, cwd, env) {
  return execFileAsync("rclone", args, {
    cwd,
    env: env ?? processEnv,
  })
}

/**
 * @param {unknown} error
 */
function getSanitizedRcloneError(error) {
  if (isPlainObject(error)) {
    const processError = /** @type {{stderr?: unknown, stdout?: unknown}} */ (
      error
    )
    if (typeof processError.stderr === "string" && processError.stderr.trim()) {
      return processError.stderr.trim()
    }
    if (typeof processError.stdout === "string" && processError.stdout.trim()) {
      return processError.stdout.trim()
    }
  }
  return "rclone command failed."
}

/**
 * @param {unknown} value
 */
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
