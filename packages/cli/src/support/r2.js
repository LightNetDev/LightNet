// @ts-check

import { access, readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { env as processEnv, stdin, stdout } from "node:process"

import { CliError } from "./cli-error.js"

const cliConfigFileName = ".lightnet-cli.config.json"
const gitIgnoreEntry = `${cliConfigFileName}\n`
const sessionSecretEnvName = "LIGHTNET_R2_SECRET_ACCESS_KEY"

/**
 * @typedef {{
 *   publicUrl: string
 *   accountId: string
 *   accessKeyId: string
 *   bucket: string
 * }} R2Config
 */

/**
 * @typedef {{
 *   path: string
 *   sources: string[]
 * }} MissingReference
 */

/**
 * @typedef {Map<string, {key: string, sources: Set<string>}>} R2ReferenceMap
 */

/**
 * @param {{
 *   cwd: string
 *   interactive: boolean
 *   logger: {error: (...args: unknown[]) => void}
 *   promptText: (message: string) => Promise<string>
 * }} args
 */
export async function ensureR2Config({ cwd, interactive, logger, promptText }) {
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

  logger.error(`Missing R2 config in "${cliConfigFileName}".`)
  return promptForR2Config({ cwd, promptText })
}

/**
 * @param {{
 *   cwd: string
 *   interactive: boolean
 *   logger: {error: (...args: unknown[]) => void}
 *   promptConfirm: (message: string) => Promise<boolean>
 *   promptText: (message: string) => Promise<string>
 *   promptSecret?: (message: string) => Promise<string>
 *   config: R2Config
 *   references: R2ReferenceMap
 *   runRclone: (args: string[], cwd: string, env?: NodeJS.ProcessEnv) => Promise<{stdout:string, stderr:string}>
 * }} args
 */
export async function validateR2ReferencesWithRefresh(args) {
  try {
    return {
      ...(await validateR2References(args)),
      config: args.config,
    }
  } catch (error) {
    if (!args.interactive) {
      throw error
    }
    args.logger.error(
      error instanceof Error ? error.message : "R2 validation failed.",
    )
    const shouldRefresh = await args.promptConfirm(
      "Refresh saved R2 settings and try again? [y/N] ",
    )
    if (!shouldRefresh) {
      throw error
    }
    const refreshedConfig = await promptForR2Config({
      cwd: args.cwd,
      promptText: args.promptText,
    })
    return {
      ...(await validateR2References({
        ...args,
        config: refreshedConfig,
      })),
      config: refreshedConfig,
    }
  }
}

/**
 * @param {{
 *   cwd: string
 *   config: R2Config
 *   objectKeys: string[]
 *   promptSecret?: (message: string) => Promise<string>
 *   runRclone: (args: string[], cwd: string, env?: NodeJS.ProcessEnv) => Promise<{stdout:string, stderr:string}>
 * }} args
 */
export async function deleteR2Objects({
  cwd,
  config,
  objectKeys,
  promptSecret,
  runRclone,
}) {
  /** @type {string} */
  const secretAccessKey = await promptRequiredSecret(promptSecret)
  /** @type {string[]} */
  const removed = []

  for (const objectKey of objectKeys) {
    try {
      await runConfiguredRclone({
        args: ["deletefile", makeR2Path(config, objectKey)],
        config,
        cwd,
        promptSecret: async () => secretAccessKey,
        runRclone,
      })
      removed.push(objectKey)
    } catch {
      // caller prints a per-file failure message
    }
  }

  return removed
}

/**
 * @param {{
 *   cwd: string
 *   config: R2Config
 *   references: R2ReferenceMap
 *   promptSecret?: (message: string) => Promise<string>
 *   runRclone: (args: string[], cwd: string, env?: NodeJS.ProcessEnv) => Promise<{stdout:string, stderr:string}>
 * }} args
 */
async function validateR2References({
  cwd,
  config,
  references,
  promptSecret,
  runRclone,
}) {
  if (references.size === 0) {
    return {
      missingReferences: /** @type {MissingReference[]} */ ([]),
      orphanedObjects: /** @type {string[]} */ ([]),
      referenceCount: 0,
    }
  }

  /** @type {string} */
  const secretAccessKey = await promptRequiredSecret(promptSecret)
  await assertR2Access({
    cwd,
    config,
    promptSecret: async () => secretAccessKey,
    runRclone,
  })
  const bucketObjects = await listR2Objects({
    cwd,
    config,
    promptSecret: async () => secretAccessKey,
    runRclone,
  })

  const objectKeys = new Set(bucketObjects.map((item) => item.key))
  const referencedKeys = new Set(
    [...references.values()].map((reference) => reference.key),
  )

  const missingReferences = [...references.entries()]
    .filter(([, reference]) => !objectKeys.has(reference.key))
    .map(([url, { sources }]) => ({
      path: url,
      sources: [...sources].toSorted(),
    }))
    .sort((a, b) => a.path.localeCompare(b.path))

  const orphanedObjects = bucketObjects
    .filter((item) => !referencedKeys.has(item.key))
    .map((item) => item.key)
    .sort()

  return {
    missingReferences,
    orphanedObjects,
    referenceCount: references.size,
  }
}

/**
 * @param {{
 *   cwd: string
 *   config: R2Config
 *   promptSecret: (message: string) => Promise<string>
 *   runRclone: (args: string[], cwd: string, env?: NodeJS.ProcessEnv) => Promise<{stdout:string, stderr:string}>
 * }} args
 */
async function assertR2Access(args) {
  try {
    await runConfiguredRclone({
      args: ["lsjson", makeR2Path(args.config), "--files-only"],
      ...args,
    })
  } catch (error) {
    throw new CliError(
      error instanceof Error
        ? `Unable to access R2 bucket "${args.config.bucket}": ${error.message}`
        : `Unable to access R2 bucket "${args.config.bucket}".`,
    )
  }
}

/**
 * @param {{
 *   cwd: string
 *   config: R2Config
 *   promptSecret: (message: string) => Promise<string>
 *   runRclone: (args: string[], cwd: string, env?: NodeJS.ProcessEnv) => Promise<{stdout:string, stderr:string}>
 * }} args
 */
async function listR2Objects(args) {
  const { stdout: listJson } = await runConfiguredRclone({
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
 *   promptSecret: (message: string) => Promise<string>
 *   runRclone: (args: string[], cwd: string, env?: NodeJS.ProcessEnv) => Promise<{stdout:string, stderr:string}>
 * }} args
 */
async function runConfiguredRclone({
  args,
  cwd,
  config,
  promptSecret,
  runRclone,
}) {
  const secretAccessKey = await promptSecret("R2 secretAccessKey: ")
  const env = {
    ...processEnv,
    RCLONE_S3_SECRET_ACCESS_KEY: secretAccessKey,
  }

  try {
    return await runRclone(
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

  await writeFile(
    resolve(cwd, cliConfigFileName),
    `${JSON.stringify(nextConfig, null, 2)}\n`,
    "utf8",
  )
  await ensureGitignoreContainsConfig(cwd)

  return nextConfig.r2
}

/**
 * @param {((message:string)=>Promise<string>) | undefined} promptSecret
 * @returns {Promise<string>}
 */
async function promptRequiredSecret(promptSecret) {
  const sessionSecret = processEnv[sessionSecretEnvName]
  if (typeof sessionSecret === "string" && sessionSecret.trim()) {
    return sessionSecret
  }

  /** @type {(message:string)=>Promise<string>} */
  const prompt =
    promptSecret ??
    ((message) =>
      defaultPromptSecret(message, {
        input: stdin,
        output: stdout,
      }))

  while (true) {
    const value = await prompt("R2 secretAccessKey: ")
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
 * @param {string} cwd
 */
async function readCliConfig(cwd) {
  const filePath = resolve(cwd, cliConfigFileName)
  if (!(await pathExists(filePath))) {
    return undefined
  }
  const contents = await readFile(filePath, "utf8")
  try {
    return JSON.parse(contents)
  } catch {
    throw new CliError(`Invalid JSON in "${cliConfigFileName}".`)
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
 * @param {string} cwd
 */
async function ensureGitignoreContainsConfig(cwd) {
  const filePath = resolve(cwd, ".gitignore")
  const contents = (await pathExists(filePath))
    ? await readFile(filePath, "utf8")
    : ""
  if (contents.includes(cliConfigFileName)) {
    return
  }
  const next = contents
    ? `${contents}${contents.endsWith("\n") ? "" : "\n"}${gitIgnoreEntry}`
    : gitIgnoreEntry
  await writeFile(filePath, next, "utf8")
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
 * @param {unknown} value
 */
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * @param {string} message
 * @param {{input: NodeJS.ReadStream, output: NodeJS.WriteStream}} io
 */
async function defaultPromptSecret(message, io) {
  if (
    !io.input.isTTY ||
    !io.output.isTTY ||
    typeof io.input.setRawMode !== "function"
  ) {
    throw new CliError(
      "Secret access key prompt requires an interactive terminal.",
    )
  }

  return await new Promise((resolve, reject) => {
    let value = ""
    const wasRaw = io.input.isRaw

    io.output.write(message)
    io.input.resume()
    io.input.setEncoding("utf8")
    io.input.setRawMode(true)

    /**
     * @param {string} chunk
     */
    const onData = (chunk) => {
      for (const character of chunk) {
        if (character === "\r" || character === "\n") {
          cleanup()
          io.output.write("\n")
          resolve(value)
          return
        }
        if (character === "\u0003" || character === "\u0004") {
          cleanup()
          io.output.write("\n")
          reject(new CliError("Secret access key prompt cancelled."))
          return
        }
        if (
          character === "\u007f" ||
          character === "\b" ||
          character === "\x08"
        ) {
          value = value.slice(0, -1)
          continue
        }
        value += character
      }
    }

    const cleanup = () => {
      io.input.off("data", onData)
      io.input.setRawMode(Boolean(wasRaw))
      io.input.pause()
    }

    io.input.on("data", onData)
  })
}
