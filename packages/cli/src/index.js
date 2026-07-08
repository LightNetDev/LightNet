#!/usr/bin/env node
// @ts-check

import { Command } from "commander"

import pkg from "../package.json" with { type: "json" }
import { checkFiles } from "./check-files.js"
import { checkLinks } from "./check-links.js"
import { checkTranslations } from "./check-translations.js"
import { copyR2, listR2, moveR2, removeR2 } from "./r2.js"
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

const r2Command = program
  .command("r2")
  .description("manage Cloudflare R2 files with rclone")

r2Command
  .command("ls")
  .description("list R2 objects")
  .argument("[path]", "R2 path or prefix")
  .action(async (path) => {
    try {
      await listR2(path)
    } catch (error) {
      handleCommandError(error)
    }
  })

r2Command
  .command("rm")
  .description(
    'delete an R2 file; use -r to delete a directory/prefix or "/" to clean the bucket',
  )
  .argument(
    "<paths...>",
    'R2 file path(s), directory/prefix paths with -r, or "/" with -r',
  )
  .option("-r, --recursive", "delete a directory/prefix recursively")
  .option("--progress", "show operation progress")
  .option(
    "-f, --force",
    'delete without confirmation; use "--force" to clean the bucket root without confirmation',
  )
  .action(async (paths, options) => {
    try {
      options.longForce = hasLongForceFlag()
      await removeR2(paths, options)
    } catch (error) {
      handleCommandError(error)
    }
  })

r2Command
  .command("cp")
  .description(
    'copy files between R2 and local paths, or inside R2; prefix R2 paths with "r2:"',
  )
  .argument(
    "<paths...>",
    'source path(s) followed by a destination path; use "r2:<path>" for R2',
  )
  .option("-r, --recursive", "copy directories recursively")
  .option("-R", "copy directories recursively")
  .option("-a, --archive", "copy directories recursively")
  .option("-f, --force", "overwrite existing files without confirmation")
  .option("-n, --no-clobber", "skip existing destination files")
  .option("--progress", "show operation progress")
  .action(async (paths, options) => {
    try {
      options.recursive = options.recursive || options.R || options.archive
      await copyR2(paths, options)
    } catch (error) {
      handleCommandError(error)
    }
  })

r2Command
  .command("mv")
  .description("move or rename an R2 file or directory/prefix")
  .argument("<paths...>", "R2 source path(s) followed by a destination path")
  .option("-f, --force", "overwrite existing destination without confirmation")
  .option("-n, --no-clobber", "skip existing destination files")
  .option("--progress", "show operation progress")
  .action(async (paths, options) => {
    try {
      await moveR2(paths, options)
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

function hasLongForceFlag() {
  return process.argv.includes("--force")
}
