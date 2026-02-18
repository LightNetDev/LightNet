#!/usr/bin/env node
// @ts-check
/// <reference path="./types.d.ts" />

import { runMigrateToV4Command } from "./commands/migrate-to-v4.mjs"
import { runTranslationStatusCommand } from "./commands/translation-status.mjs"

const [command, ...args] = process.argv.slice(2)

if (!command || command === "--help" || command === "-h") {
  printHelp()
  process.exit()
}

if (command === "translation-status") {
  await runTranslationStatusCommand(args)
  process.exit(process.exitCode ?? 0)
}

if (command === "migrate-to-v4") {
  await runMigrateToV4Command(args)
  process.exit(process.exitCode ?? 0)
}

console.error(`Unknown command: ${command}`)
printHelp()
process.exit(1)

function printHelp() {
  console.log(`Usage: lightnet <command> [options]

Commands:
  translation-status           Report missing and obsolete built-in translation keys
  migrate-to-v4                Run LightNet v4 migration (includes safe YAML key cleanup)
`)
}
