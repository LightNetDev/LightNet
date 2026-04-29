import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import { LightnetCliError } from "../errors.js"
import { readProjectPackage } from "./read-project-package.js"

const readVersion = async (packagePath: string) => {
  const content = await readFile(packagePath, "utf-8")
  const pkg = JSON.parse(content) as { version?: string }
  if (!pkg.version) {
    throw new LightnetCliError(`Missing version in ${packagePath}`)
  }
  return pkg.version
}

const major = (version: string) => version.split(".")[0]

export const assertLightnetVersion = async (root: string, cliRoot: string) => {
  const projectPackageJson = await readProjectPackage(root)
  const declaredLightnetVersion =
    projectPackageJson?.dependencies?.lightnet ??
    projectPackageJson?.devDependencies?.lightnet

  if (!declaredLightnetVersion) {
    throw new LightnetCliError(
      "Could not find `lightnet` in the target project's dependencies.",
    )
  }

  const projectLightnetPackage = resolve(
    root,
    "node_modules",
    "lightnet",
    "package.json",
  )
  const cliPackage = resolve(cliRoot, "package.json")

  let projectVersion: string
  let cliVersion: string

  try {
    ;[projectVersion, cliVersion] = await Promise.all([
      readVersion(projectLightnetPackage),
      readVersion(cliPackage),
    ])
  } catch {
    throw new LightnetCliError(
      "Could not read the installed `lightnet` package. Install dependencies first.",
    )
  }

  if (major(projectVersion) !== major(cliVersion)) {
    throw new LightnetCliError(
      `Expected lightnet major version ${major(cliVersion)} but found ${projectVersion}.`,
    )
  }
}
