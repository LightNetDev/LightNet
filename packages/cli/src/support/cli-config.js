// @ts-check

import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

import { CliError } from "./cli-error.js"
import { pathExists } from "./filesystem.js"

export const cliConfigFileName = ".lightnet-cli.config.json"

const gitIgnoreEntry = `${cliConfigFileName}\n`

/**
 * @param {string} cwd
 */
export async function readCliConfig(cwd) {
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
 * @param {string} cwd
 * @param {Record<string, unknown>} config
 */
export async function writeCliConfig(cwd, config) {
  await writeFile(
    resolve(cwd, cliConfigFileName),
    `${JSON.stringify(config, null, 2)}\n`,
    "utf8",
  )
  await ensureGitignoreContainsConfig(cwd)
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
