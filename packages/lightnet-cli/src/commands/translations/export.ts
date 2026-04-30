import { resolve } from "node:path"

import type { Command } from "commander"

import { runExportCommand } from "./export-command.js"

type ExportCliOptions = {
  build: boolean
  missingOnly?: boolean
  root: string
  verbose?: boolean
}

export const registerExportCommand = (translations: Command) => {
  translations
    .command("export")
    .argument("<locale>")
    .option("--missing-only", "Only export missing keys")
    .option("--no-build", "Reuse existing discovery artifacts")
    .option("--root <path>", "Project root", process.cwd())
    .option("--verbose", "Show underlying build output")
    .action(async (locale: string, options: ExportCliOptions) => {
      const output = await runExportCommand({
        root: resolve(options.root),
        locale,
        build: options.build,
        missingOnly: Boolean(options.missingOnly),
        verbose: Boolean(options.verbose),
      })

      process.stdout.write(output + "\n")
    })
}
