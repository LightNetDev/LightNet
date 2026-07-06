#!/usr/bin/env node
// @ts-check

import { Command } from "commander"

import pkg from "../package.json" with { type: "json" }
import { checkFiles } from "./check-files.js"
import { checkLinks } from "./check-links.js"
import { checkTranslations } from "./check-translations.js"
import { CliError } from "./support/cli-error.js"
import { PromptCancelled } from "./support/prompt-cancel.js"
const { version } = pkg

const program = new Command()
let commandExitCode = 0

program
  .name("lightnet-cli")
  .description("CLI for managing LightNet projects")
  .version(version)

program
  .command("check-translations")
  .description("check if last build has been missing any translations")
  .option("--build", "run pnpm build before checking translations")
  .option("--no-build", "skip the build prompt and use the latest dist/ output")
  .action(async (options) => {
    try {
      const checkSuccessful = await checkTranslations(options)
      commandExitCode = checkSuccessful ? 0 : 1
    } catch (error) {
      handleCommandError(error)
    }
  })

program
  .command("check-files")
  .description(
    "check for missing and orphaned content files and thumbnails in a LightNet site",
  )
  .option("--fix", "remove orphaned files")
  .option("--fix-without-confirm", "remove orphaned files without confirmation")
  .option(
    "--r2",
    "validate remote content files in Cloudflare R2 instead of public/files",
  )
  .option(
    "--scope <values>",
    "comma-separated scopes: content-files,thumbnails",
  )
  .action(async (options) => {
    try {
      const checkSuccessful = await checkFiles(options)
      commandExitCode = checkSuccessful ? 0 : 1
    } catch (error) {
      handleCommandError(error)
    }
  })

program
  .command("check-links")
  .description("check media content links in a LightNet site")
  .option("--timeout <ms>", "request timeout per link in milliseconds")
  .action(async (options) => {
    try {
      const checkSuccessful = await checkLinks(options)
      commandExitCode = checkSuccessful ? 0 : 1
    } catch (error) {
      handleCommandError(error)
    }
  })

await program.parseAsync()
process.exitCode = commandExitCode

/**
 * @param {unknown} error
 */
function handleCommandError(error) {
  if (error instanceof PromptCancelled) {
    commandExitCode = 0
    return
  }
  if (error instanceof CliError) {
    console.error(error.message)
    commandExitCode = 1
    return
  }
  throw error
}
