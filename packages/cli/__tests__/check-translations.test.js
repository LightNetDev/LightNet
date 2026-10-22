import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { expect, test } from "vitest"

import { checkTranslations } from "../src/check-translations.js"

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
