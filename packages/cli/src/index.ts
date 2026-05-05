#!/usr/bin/env node

import { createRequire } from "node:module"

import { Command } from "commander"
import { checkTranslations } from "./check-translations.ts"
import { exit } from "node:process"

const require = createRequire(import.meta.url)
const { version } = require("../package.json")

const program = new Command()

program
  .name("lightnet-cli")
  .description("CLI for managing LightNet projects")
  .version(version)

program
  .command("check-translations")
  .description("Check if last build has been missing any translations")
  .action(async () => {
    const checkSuccessful = await checkTranslations()
    exit(checkSuccessful ? 0 : 1)
  })

await program.parseAsync()
