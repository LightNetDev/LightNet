import { runMigrateToV4 } from "../src/migrate-to-v4.mjs"

/**
 * @param {string[]} argv
 */
export async function runMigrateToV4Command(argv = []) {
  if (argv.includes("--help") || argv.includes("-h")) {
    printMigrateToV4Help()
    return
  }

  const unsupported = ["project", "add-locale", "source-locale"]
    .filter((key) => hasOption(argv, key))
    .map((key) => `--${key}`)
  if (unsupported.length) {
    console.error(
      `Unsupported option(s) for migrate-to-v4: ${unsupported.join(", ")}.`,
    )
    console.error(
      "Run `lightnet add-site-locale --locale <code> --source-locale <code>` for locale expansion.",
    )
    process.exitCode = 1
    return
  }

  const unknown = collectUnknownOptions(argv, new Set(["locales"]))
  if (unknown.length) {
    console.error(`Unknown option(s): ${unknown.join(", ")}`)
    process.exitCode = 1
    return
  }

  try {
    await runMigrateToV4(argv)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Migration command failed."
    console.error(message)
    process.exitCode = 1
  }
}

function printMigrateToV4Help() {
  console.log(`Usage: lightnet migrate-to-v4 [options]

Options:
  --locales <list>         Comma-separated site locales (defaults to src/translations/*)

Notes:
  - Run from your LightNet site root.
  - Locale expansion is handled by: lightnet add-site-locale --locale <code> [--source-locale <code>]
`)
}

function hasOption(argv, key) {
  return argv.some(
    (item) => item === `--${key}` || item.startsWith(`--${key}=`),
  )
}

function collectUnknownOptions(argv, knownOptions) {
  const unknown = []
  for (const item of argv) {
    if (!item.startsWith("--")) {
      continue
    }
    const key = item.slice(2).split("=")[0]
    if (key === "help" || key === "h" || knownOptions.has(key)) {
      continue
    }
    unknown.push(`--${key}`)
  }
  return [...new Set(unknown)]
}
