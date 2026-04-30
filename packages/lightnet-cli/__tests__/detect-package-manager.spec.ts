import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterEach, expect, test } from "vitest"

import { detectPackageManager } from "../src/core/build/detect-package-manager"

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(
    tempDirs.map(async (dir) => rm(dir, { recursive: true, force: true })),
  )
  tempDirs.length = 0
})

test("Should prefer packageManager field", async () => {
  const dir = await mkdtemp(join(tmpdir(), "lightnet-cli-"))
  tempDirs.push(dir)

  await writeFile(
    join(dir, "package.json"),
    JSON.stringify({ packageManager: "pnpm@10.0.0" }),
  )

  expect(await detectPackageManager(dir)).toBe("pnpm")
})

test("Should fallback to lockfile", async () => {
  const dir = await mkdtemp(join(tmpdir(), "lightnet-cli-"))
  tempDirs.push(dir)

  await writeFile(join(dir, "package.json"), JSON.stringify({}))
  await writeFile(join(dir, "package-lock.json"), "")

  expect(await detectPackageManager(dir)).toBe("npm")
})

test("Should find package manager in a parent workspace root", async () => {
  const dir = await mkdtemp(join(tmpdir(), "lightnet-cli-"))
  tempDirs.push(dir)

  const appDir = join(dir, "apps", "site")
  await mkdir(appDir, { recursive: true })
  await writeFile(
    join(dir, "package.json"),
    JSON.stringify({ packageManager: "pnpm@10.0.0" }),
  )
  await writeFile(join(appDir, "package.json"), JSON.stringify({}))

  expect(await detectPackageManager(appDir)).toBe("pnpm")
})
