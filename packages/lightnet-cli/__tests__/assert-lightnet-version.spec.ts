import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterEach, expect, test } from "vitest"

import { LightnetCliError } from "../src/core/errors"
import { assertLightnetVersion } from "../src/core/project/assert-lightnet-version"

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(
    tempDirs.map(async (dir) => rm(dir, { recursive: true, force: true })),
  )
  tempDirs.length = 0
})

const createCliPackage = async (version: string) => {
  const dir = await mkdtemp(join(tmpdir(), "lightnet-cli-package-"))
  tempDirs.push(dir)
  await writeFile(join(dir, "package.json"), JSON.stringify({ version }))
  return dir
}

test("Should fail when lightnet is not declared in package.json", async () => {
  const root = await mkdtemp(join(tmpdir(), "lightnet-project-"))
  tempDirs.push(root)
  const cliRoot = await createCliPackage("4.0.0")

  await writeFile(
    join(root, "package.json"),
    JSON.stringify({ dependencies: {} }),
  )

  await expect(assertLightnetVersion(root, cliRoot)).rejects.toThrow(
    new LightnetCliError(
      "Could not find `lightnet` in the target project's dependencies.",
    ),
  )
})

test("Should fail when installed lightnet package cannot be read", async () => {
  const root = await mkdtemp(join(tmpdir(), "lightnet-project-"))
  tempDirs.push(root)
  const cliRoot = await createCliPackage("4.0.0")

  await writeFile(
    join(root, "package.json"),
    JSON.stringify({ dependencies: { lightnet: "^4.0.0" } }),
  )

  await expect(assertLightnetVersion(root, cliRoot)).rejects.toThrow(
    new LightnetCliError(
      "Could not read the installed `lightnet` package. Install dependencies first.",
    ),
  )
})

test("Should accept matching major versions", async () => {
  const root = await mkdtemp(join(tmpdir(), "lightnet-project-"))
  tempDirs.push(root)
  const cliRoot = await createCliPackage("4.2.0")

  await writeFile(
    join(root, "package.json"),
    JSON.stringify({ dependencies: { lightnet: "^4.0.0" } }),
  )
  await mkdir(join(root, "node_modules", "lightnet"), { recursive: true })
  await writeFile(
    join(root, "node_modules", "lightnet", "package.json"),
    JSON.stringify({ version: "4.9.1" }),
  )

  await expect(assertLightnetVersion(root, cliRoot)).resolves.toBeUndefined()
})
