import { resolve } from "node:path"

import type { Command } from "commander"

import { runValidateCommand } from "./validate-command.js"

type ValidateCliOptions = {
  build: boolean
  lightnetBuiltins: boolean
  root: string
  verbose?: boolean
}

export const registerValidateCommand = (translations: Command) => {
  translations
    .command("validate")
    .option("--no-lightnet-builtins", "Ignore built-in LightNet translations")
    .option("--no-build", "Reuse existing discovery artifacts")
    .option("--root <path>", "Project root", process.cwd())
    .option("--verbose", "Show underlying build output")
    .action(async (options: ValidateCliOptions) => {
      const report = await runValidateCommand({
        root: resolve(options.root),
        build: options.build,
        verbose: Boolean(options.verbose),
        lightnetBuiltins: options.lightnetBuiltins,
      })

      process.stdout.write(report.text + "\n")
      if (report.hasMissingTranslations) {
        process.exitCode = 1
      }
    })
}
