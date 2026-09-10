import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { expect, test } from "vitest"

import { checkTranslations } from "../src/check-translations.js"

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
