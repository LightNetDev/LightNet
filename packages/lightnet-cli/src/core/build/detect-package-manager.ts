import { access } from "node:fs/promises"
import { dirname, resolve } from "node:path"

import { LightnetCliError } from "../errors.js"
import { readProjectPackage } from "../project/read-project-package.js"

export type SupportedPackageManager = "npm" | "pnpm"

const getSearchRoots = (root: string) => {
  const roots = [root]
  let currentRoot = root

  while (dirname(currentRoot) !== currentRoot) {
    currentRoot = dirname(currentRoot)
    roots.push(currentRoot)
  }

  return roots
}

const detectLockfile = async (root: string, fileName: string) => {
  try {
    await access(resolve(root, fileName))
    return true
  } catch {
    return false
  }
}

export const detectPackageManager = async (
  root: string,
): Promise<SupportedPackageManager> => {
  for (const candidateRoot of getSearchRoots(root)) {
    const projectPackage = await readProjectPackage(candidateRoot, {
      optional: true,
    })
    const packageManager = projectPackage?.packageManager?.split("@")[0]

    if (packageManager === "pnpm" || packageManager === "npm") {
      return packageManager
    }

    if (await detectLockfile(candidateRoot, "pnpm-lock.yaml")) {
      return "pnpm"
    }

    if (await detectLockfile(candidateRoot, "package-lock.json")) {
      return "npm"
    }
  }

  throw new LightnetCliError(
    "Could not detect a supported package manager. Install dependencies first. Supported package managers: pnpm and npm.",
  )
}
