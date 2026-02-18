import fs from "node:fs/promises"
import path from "node:path"

export async function resolveProjectPathsFromCwd() {
  const projectDir = process.cwd()
  const paths = {
    projectDir,
    astroConfigPath: path.join(projectDir, "astro.config.mjs"),
    contentDir: path.join(projectDir, "src/content"),
    translationsDir: path.join(projectDir, "src/translations"),
  }

  const missing = await findMissingPaths(paths)
  if (missing.length) {
    throw new Error(
      `Invalid project root (${projectDir}). Missing required paths: ${missing.join(
        ", ",
      )}. Run this command from your LightNet site root.`,
    )
  }

  return paths
}

async function findMissingPaths(paths) {
  const required = [
    ["astro.config.mjs", paths.astroConfigPath],
    ["src/content", paths.contentDir],
    ["src/translations", paths.translationsDir],
  ]
  const missing = []

  for (const [name, absolutePath] of required) {
    try {
      await fs.access(absolutePath)
    } catch {
      missing.push(name)
    }
  }

  return missing
}
