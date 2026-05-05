#!/usr/bin/env node

import { Command } from "commander"
import { checkTranslations } from "./check-translations.ts"
import { exit } from "node:process"

import pkg from "../package.json" with { type: "json" }
const { version } = pkg

const program = new Command()

program
  .name("lightnet-cli")
  .description("CLI for managing LightNet projects")
  .version(version)

program
  .command("check-translations")
  .description("check if last build has been missing any translations")
  .action(async () => {
    const checkSuccessful = await checkTranslations()
    exit(checkSuccessful ? 0 : 1)
  })

await program.parseAsync()
