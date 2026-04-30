#!/usr/bin/env node

import { Command } from "commander"

import { registerExportCommand } from "./commands/translations/export.js"
import { registerValidateCommand } from "./commands/translations/validate.js"
import { LightnetCliError } from "./core/errors.js"

const program = new Command()

program.name("lightnet-cli")

const translations = program.command("translations")

registerExportCommand(translations)
registerValidateCommand(translations)

program.parseAsync(process.argv).catch((error: unknown) => {
  if (error instanceof LightnetCliError) {
    console.error(error.message)
    process.exit(1)
  }

  throw error
})
