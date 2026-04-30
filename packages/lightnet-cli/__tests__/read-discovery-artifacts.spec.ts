import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterEach, expect, test } from "vitest"

import { readDiscoveryArtifacts } from "../src/core/discovery/read-discovery-artifacts"
import { LightnetCliError } from "../src/core/errors"

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(
    tempDirs.map(async (dir) => rm(dir, { recursive: true, force: true })),
  )
  tempDirs.length = 0
})

const createCacheDir = async () => {
  const root = await mkdtemp(join(tmpdir(), "lightnet-artifacts-"))
  tempDirs.push(root)
  const cacheDir = join(root, "node_modules", ".cache", "lightnet")
  await mkdir(cacheDir, { recursive: true })
  return { cacheDir, root }
}

test("Should fail clearly when discovery artifacts are missing", async () => {
  const root = await mkdtemp(join(tmpdir(), "lightnet-artifacts-"))
  tempDirs.push(root)

  await expect(readDiscoveryArtifacts(root)).rejects.toThrow(
    new LightnetCliError(
      "Missing translation discovery artifacts. Run without --no-build first.",
    ),
  )
})

test("Should fail clearly when discovery artifacts are invalid", async () => {
  const { cacheDir, root } = await createCacheDir()

  await writeFile(join(cacheDir, "languages.json"), "{")
  await writeFile(join(cacheDir, "translations.jsonl"), "")

  await expect(readDiscoveryArtifacts(root)).rejects.toThrow(
    new LightnetCliError(
      "Invalid translation discovery artifacts. Re-run without --no-build.",
    ),
  )
})

test("Should fail when discovery produced no records", async () => {
  const { cacheDir, root } = await createCacheDir()

  await writeFile(
    join(cacheDir, "languages.json"),
    JSON.stringify({ defaultLocale: "en", locales: ["en", "de"] }),
  )
  await writeFile(join(cacheDir, "translations.jsonl"), "")

  await expect(readDiscoveryArtifacts(root)).rejects.toThrow(
    new LightnetCliError(
      "Discovery build completed without any translation records.",
    ),
  )
})

test("Should read discovery metadata and records", async () => {
  const { cacheDir, root } = await createCacheDir()

  await writeFile(
    join(cacheDir, "languages.json"),
    JSON.stringify({ defaultLocale: "en", locales: ["en", "de"] }),
  )
  await writeFile(
    join(cacheDir, "translations.jsonl"),
    `${JSON.stringify({
      type: "user",
      key: "home.title",
      values: { en: "Home", de: "Startseite" },
    })}\n`,
  )

  await expect(readDiscoveryArtifacts(root)).resolves.toEqual({
    metadata: { defaultLocale: "en", locales: ["en", "de"] },
    records: [
      {
        type: "user",
        key: "home.title",
        values: { en: "Home", de: "Startseite" },
      },
    ],
  })
})
