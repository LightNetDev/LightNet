import { existsSync } from "node:fs"
import { readdir, readFile } from "node:fs/promises"
import { basename, dirname, posix, relative, resolve } from "node:path"

type TestRepoSeedFile = {
  content: string
  encoding: "base64" | "text"
  path: string
}

const TEST_REPO_ROOT_DIR_NAME = "sveltia-cms-test"

const INCLUDED_ROOTS = ["src/content", "public/files"] as const
const INCLUDED_FILES = new Set(["languages.json"])
const TEXT_EXTENSIONS = new Set([
  ".json",
  ".md",
  ".markdown",
  ".toml",
  ".txt",
  ".yaml",
  ".yml",
])

const findWorkspaceRoot = (startDir: string) => {
  let currentDir = resolve(startDir)

  while (true) {
    if (existsSync(resolve(currentDir, "pnpm-workspace.yaml"))) {
      return currentDir
    }

    const parentDir = dirname(currentDir)

    if (parentDir === currentDir) {
      throw new Error(`Could not find workspace root for ${startDir}`)
    }

    currentDir = parentDir
  }
}

const shouldSeedRelativePath = (fixtureRelativePath: string) =>
  INCLUDED_FILES.has(fixtureRelativePath) ||
  INCLUDED_ROOTS.some(
    (includedRoot) =>
      fixtureRelativePath === includedRoot ||
      fixtureRelativePath.startsWith(`${includedRoot}/`),
  )

const collectFixtureFiles = async (rootDir: string): Promise<string[]> => {
  const entries = await readdir(rootDir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(rootDir, entry.name)

      if (entry.isDirectory()) {
        return collectFixtureFiles(entryPath)
      }

      if (entry.isFile()) {
        return [entryPath]
      }

      return []
    }),
  )

  return files.flat()
}

const createSeedFile = async (
  fixtureRoot: string,
  workspaceRoot: string,
  absolutePath: string,
): Promise<TestRepoSeedFile> => {
  const fixtureRelativePath = relative(fixtureRoot, absolutePath).replaceAll(
    "\\",
    "/",
  )
  const repoRelativePath = relative(workspaceRoot, absolutePath).replaceAll(
    "\\",
    "/",
  )
  const extension = posix.extname(fixtureRelativePath).toLowerCase()
  const encoding = TEXT_EXTENSIONS.has(extension) ? "text" : "base64"
  const content = await readFile(
    absolutePath,
    encoding === "text" ? "utf8" : "base64",
  )

  return {
    content,
    encoding,
    path: repoRelativePath,
  }
}

const buildTestRepoSeedManifest = async (fixtureRoot: string) => {
  const workspaceRoot = findWorkspaceRoot(fixtureRoot)
  const fixtureFiles = await collectFixtureFiles(fixtureRoot)
  const includedFiles = fixtureFiles
    .filter((filePath) =>
      shouldSeedRelativePath(
        relative(fixtureRoot, filePath).replaceAll("\\", "/"),
      ),
    )
    .filter((filePath) => !basename(filePath).startsWith("."))
    .sort()

  return Promise.all(
    includedFiles.map((filePath) =>
      createSeedFile(fixtureRoot, workspaceRoot, filePath),
    ),
  )
}

const toTestRepositoryPath = (absolutePath: string) => {
  const workspaceRoot = findWorkspaceRoot(dirname(absolutePath))

  return relative(workspaceRoot, absolutePath).replaceAll("\\", "/")
}

const seedTestRepository = async (
  page: {
    evaluate: <Arg>(
      pageFunction: (arg: Arg) => Promise<void>,
      arg: Arg,
    ) => Promise<void>
  },
  files: TestRepoSeedFile[],
) => {
  await page.evaluate(
    async ({
      files,
      rootDirName,
    }: {
      files: TestRepoSeedFile[]
      rootDirName: string
    }) => {
      const rootHandle = await navigator.storage.getDirectory()
      const repoHandle = await rootHandle.getDirectoryHandle(rootDirName, {
        create: true,
      })

      for await (const [name] of repoHandle.entries()) {
        await repoHandle.removeEntry(name, { recursive: true })
      }

      const decodeBase64 = (value: string) =>
        Uint8Array.from(atob(value), (character) => character.charCodeAt(0))

      for (const file of files) {
        const segments = file.path.split("/").filter(Boolean)
        const fileName = segments.pop()

        if (!fileName) {
          continue
        }

        let directoryHandle = repoHandle

        for (const segment of segments) {
          directoryHandle = await directoryHandle.getDirectoryHandle(segment, {
            create: true,
          })
        }

        const fileHandle = await directoryHandle.getFileHandle(fileName, {
          create: true,
        })
        const writable = await fileHandle.createWritable()

        await writable.write(
          file.encoding === "text" ? file.content : decodeBase64(file.content),
        )
        await writable.close()
      }
    },
    {
      files,
      rootDirName: TEST_REPO_ROOT_DIR_NAME,
    },
  )
}

const readTestRepositoryTextFile = async (
  page: {
    evaluate: <Arg, Result>(
      pageFunction: (arg: Arg) => Promise<Result>,
      arg: Arg,
    ) => Promise<Result>
  },
  path: string,
) =>
  page.evaluate(
    async ({ path, rootDirName }: { path: string; rootDirName: string }) => {
      const rootHandle = await navigator.storage.getDirectory()
      const repoHandle = await rootHandle.getDirectoryHandle(rootDirName)
      const segments = path.split("/").filter(Boolean)
      const fileName = segments.pop()

      if (!fileName) {
        throw new Error(`Invalid test repository path: ${path}`)
      }

      let directoryHandle = repoHandle

      for (const segment of segments) {
        directoryHandle = await directoryHandle.getDirectoryHandle(segment)
      }

      const fileHandle = await directoryHandle.getFileHandle(fileName)
      const file = await fileHandle.getFile()

      return file.text()
    },
    {
      path,
      rootDirName: TEST_REPO_ROOT_DIR_NAME,
    },
  )

export {
  buildTestRepoSeedManifest,
  readTestRepositoryTextFile,
  seedTestRepository,
  TEST_REPO_ROOT_DIR_NAME,
  type TestRepoSeedFile,
  toTestRepositoryPath,
}
