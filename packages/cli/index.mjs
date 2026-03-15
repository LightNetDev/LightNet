#!/usr/bin/env node
// @ts-check
/// <reference path="./types.d.ts" />

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

console.error(`Unknown command: ${command}`)
printHelp()
process.exit(1)

function printHelp() {
  console.log(`Usage: lightnet <command> [options]

Commands:
  translation-status           Report missing and obsolete built-in translation keys
`)
}
