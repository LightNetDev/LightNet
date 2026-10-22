import { spawnSync } from "node:child_process"
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import { expect, test } from "vitest"

import { checkTranslations } from "../src/check-translations.js"

const incompleteKeys = ["ln.details.edit", "custom.title", "config.button"]

async function withIncompleteTranslations(run) {
  const projectDir = await mkdtemp(join(tmpdir(), "lightnet-exclude-test-"))
  const cacheDir = join(projectDir, "node_modules/.cache/lightnet")
  try {
    await mkdir(cacheDir, { recursive: true })
    await writeFile(
      join(cacheDir, "languages.json"),
      JSON.stringify({ defaultLocale: "en", locales: ["en", "de"] }),
    )
    await writeFile(
      join(cacheDir, "translations.jsonl"),
      incompleteKeys
        .map((key, i) =>
          JSON.stringify({
            key,
            type: ["lightnet", "user", "map"][i],
            values: { en: "Example" },
          }),
        )
        .join("\n") + "\n",
    )
    await writeFile(
      join(cacheDir, "stale-translation-overrides.json"),
      JSON.stringify([{ key: "ln.removed", path: "src/translations/de.yml" }]),
    )
    await run(projectDir, cacheDir)
  } finally {
    await rm(projectDir, { recursive: true, force: true })
  }
}

test.each([
  { exclude: [], remaining: incompleteKeys },
  {
    exclude: ["ln.details.edit"],
    remaining: ["custom.title", "config.button"],
  },
  { exclude: incompleteKeys, remaining: [] },
  {
    exclude: [...incompleteKeys, "ln.details.edit", "unknown", "ln.removed"],
    remaining: [],
  },
  {
    exclude: ["ln.details.*", "custom", "CONFIG.BUTTON"],
    remaining: incompleteKeys,
  },
])("excludes exact translation keys: %j", async ({ exclude, remaining }) => {
  await withIncompleteTranslations(async (projectDir) => {
    const output = []
    expect(
      await checkTranslations(
        { build: false, exclude },
        {
          cwd: projectDir,
          isInteractive: false,
          write: (message) => output.push(message),
        },
      ),
    ).toBe(remaining.length === 0)

    for (const key of incompleteKeys) {
      expect(output.includes(`• ${key} > Missing: de`)).toBe(
        remaining.includes(key),
      )
    }
    expect(output).toContain("• ln.removed — src/translations/de.yml")
    if (remaining.length === 0) {
      expect(output).toContain(
        "No missing translations. Stale overrides found.",
      )
    }
  })
})

test.each(["empty", "missing"])(
  "exclusions do not bypass %s cache validation",
  async (cacheState) => {
    await withIncompleteTranslations(async (projectDir, cacheDir) => {
      if (cacheState === "empty") {
        await writeFile(join(cacheDir, "translations.jsonl"), "")
      } else {
        await rm(join(cacheDir, "translations.jsonl"))
      }
      expect(
        await checkTranslations(
          { build: false, exclude: incompleteKeys },
          {
            cwd: projectDir,
            isInteractive: false,
            write: () => {},
          },
        ),
      ).toBe(false)
    })
  },
)

test.each([
  ["--exclude", ...incompleteKeys, "--no-build"],
  [
    "--no-build",
    "--exclude",
    "ln.details.edit",
    "--exclude",
    "custom.title",
    "config.button",
  ],
])("CLI accepts exclusion lists and repeated flags: %j", async (...args) => {
  await withIncompleteTranslations(async (projectDir) => {
    const result = spawnSync(
      process.execPath,
      [
        fileURLToPath(new URL("../src/index.js", import.meta.url)),
        "check-translations",
        ...args,
      ],
      { cwd: projectDir, encoding: "utf8", timeout: 10000 },
    )

    expect(result.error).toBeUndefined()
    expect(result.stderr).toBe("")
    expect(result.status).toBe(0)
    expect(result.stdout).not.toContain("> Missing:")
    expect(result.stdout).toContain(
      "No missing translations. Stale overrides found.",
    )
  })
})

test.each([
  { missing: false, stale: true },
  { missing: true, stale: true },
  { missing: false, stale: false },
])(
  "stale override warnings preserve completeness result: %j",
  async ({ missing, stale }) => {
    const projectDir = await mkdtemp(join(tmpdir(), "lightnet-stale-test-"))
    const cacheDir = join(projectDir, "node_modules/.cache/lightnet")
    const output = []

    try {
      await mkdir(cacheDir, { recursive: true })
      await writeFile(
        join(cacheDir, "languages.json"),
        JSON.stringify({ defaultLocale: "en", locales: ["en", "de"] }),
      )
      await writeFile(
        join(cacheDir, "translations.jsonl"),
        JSON.stringify({
          type: "lightnet",
          key: "ln.search.title",
          values: { en: "Search", de: missing ? undefined : "Suche" },
        }) + "\n",
      )
      await writeFile(
        join(cacheDir, "stale-translation-overrides.json"),
        JSON.stringify(
          stale
            ? [
                { key: "ln.removed", path: "src/translations/de.yml" },
                { key: "ln.removed", path: "src/translations/en.yaml" },
              ]
            : [],
        ),
      )

      expect(
        await checkTranslations(
          { build: false },
          {
            cwd: projectDir,
            isInteractive: false,
            write: (message) => output.push(message),
          },
        ),
      ).toBe(!missing)

      if (stale) {
        expect(output).toContain("Stale LightNet translation overrides")
        expect(output).toContain("• ln.removed — src/translations/de.yml")
        expect(output).toContain("• ln.removed — src/translations/en.yaml")
        expect(output).not.toContain("No issues found. 🎉")
      } else {
        expect(output).not.toContain("Stale LightNet translation overrides")
        expect(output).toContain("No issues found. 🎉")
      }
      if (missing) {
        expect(output).toContain("• ln.search.title > Missing: de")
      }
    } finally {
      await rm(projectDir, { recursive: true, force: true })
    }
  },
)

test("checkTranslations uses plain output and skips the build prompt when non-interactive", async () => {
  const projectDir = await mkdtemp(
    join(tmpdir(), "lightnet-translations-test-"),
  )
  const cacheDir = join(projectDir, "node_modules/.cache/lightnet")
  const output = []

  await mkdir(cacheDir, { recursive: true })
  await writeFile(
    join(cacheDir, "languages.json"),
    JSON.stringify({ defaultLocale: "en", locales: ["en"] }),
  )
  await writeFile(
    join(cacheDir, "translations.jsonl"),
    `${JSON.stringify({
      key: "example.title",
      type: "user",
      values: { en: "Example" },
    })}\n`,
  )

  try {
    await expect(
      checkTranslations(
        {},
        {
          cwd: projectDir,
          isInteractive: false,
          promptRunBuild: async () => {
            throw new Error("A non-interactive command must not prompt")
          },
          write: (message) => output.push(message),
        },
      ),
    ).resolves.toBe(true)
  } finally {
    await rm(projectDir, { force: true, recursive: true })
  }

  expect(output).toEqual(["check-translations", "No issues found. 🎉"])
  expect(output.join("\n")).not.toContain("\u001B")
})
