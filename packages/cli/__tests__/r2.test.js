import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { expect, test } from "vitest"

import { copyR2, moveR2 } from "../src/r2.js"

test("copyR2 does not confirm a directory copy to R2 root when no files overlap", async () => {
  const sourceDir = await createTempDirectory({
    "fresh.txt": "fresh",
  })
  const prompts = []
  const client = createFakeR2Client({
    lists: {
      "": "existing.txt\n",
    },
  })

  try {
    await copyR2(
      [`${sourceDir}/.`, "r2:/"],
      { recursive: true },
      {
        createR2Client: () => client,
        isInteractive: true,
        promptConfirm: async (message) => {
          prompts.push(message)
          return true
        },
      },
    )
  } finally {
    await rm(sourceDir, { force: true, recursive: true })
  }

  expect(prompts).toEqual([])
  expect(client.copies).toHaveLength(1)
})

test("copyR2 confirms a directory copy to R2 root when files overlap", async () => {
  const sourceDir = await createTempDirectory({
    "fresh.txt": "fresh",
    "nested/replace.txt": "replace",
  })
  const prompts = []
  const client = createFakeR2Client({
    lists: {
      "": "nested/replace.txt\nunrelated.txt\n",
    },
  })

  try {
    await copyR2(
      [`${sourceDir}/.`, "r2:/"],
      { recursive: true },
      {
        createR2Client: () => client,
        isInteractive: true,
        promptConfirm: async (message) => {
          prompts.push(message)
          return true
        },
      },
    )
  } finally {
    await rm(sourceDir, { force: true, recursive: true })
  }

  expect(prompts).toEqual([
    'Overwrite any existing files under destination "r2:/"? [y/N] ',
  ])
  expect(client.copies).toHaveLength(1)
})

test("copyR2 uses the same overwrite behavior for R2 subfolders", async () => {
  const sourceDir = await createTempDirectory({
    "fresh.txt": "fresh",
    "replace.txt": "replace",
  })
  const prompts = []
  const client = createFakeR2Client({
    lists: {
      folder: "replace.txt\n",
    },
  })

  try {
    await copyR2(
      [`${sourceDir}/.`, "r2:/folder/"],
      { recursive: true },
      {
        createR2Client: () => client,
        isInteractive: true,
        promptConfirm: async (message) => {
          prompts.push(message)
          return true
        },
      },
    )
  } finally {
    await rm(sourceDir, { force: true, recursive: true })
  }

  expect(prompts).toEqual([
    'Overwrite any existing files under destination "r2:/folder/"? [y/N] ',
  ])
  expect(client.copies).toHaveLength(1)
})

test("moveR2 uses the same overwrite behavior for R2 subfolders", async () => {
  const prompts = []
  const client = createFakeR2Client({
    lists: {
      source: "fresh.txt\nreplace.txt\n",
      target: "replace.txt\n",
    },
  })

  await moveR2(
    ["r2:/source/.", "r2:/target/"],
    {},
    {
      createR2Client: () => client,
      isInteractive: true,
      promptConfirm: async (message) => {
        prompts.push(message)
        return true
      },
    },
  )

  expect(prompts).toEqual([
    'Overwrite any existing files under destination "r2:/target/"? [y/N] ',
  ])
  expect(client.moves).toHaveLength(1)
})

/**
 * @param {{[relativePath: string]: string}} files
 */
async function createTempDirectory(files) {
  const directory = await mkdtemp(join(tmpdir(), "lightnet-r2-test-"))
  for (const [relativePath, content] of Object.entries(files)) {
    const filePath = join(directory, relativePath)
    await mkdir(join(filePath, ".."), { recursive: true })
    await writeFile(filePath, content)
  }
  return directory
}

/**
 * @param {{lists: Record<string, string>}} options
 */
function createFakeR2Client(options) {
  return {
    copies: [],
    moves: [],
    async copy(source, destination, copyOptions) {
      this.copies.push({ copyOptions, destination, source })
    },
    async getPathType(path) {
      return normalizeFakeR2Path(path) in options.lists
        ? "directory"
        : "missing"
    },
    async list(path) {
      return options.lists[normalizeFakeR2Path(path)] ?? ""
    },
    async move(source, destination, moveOptions) {
      this.moves.push({ destination, moveOptions, source })
    },
    async toRemotePath(path) {
      return `remote:${path}`
    },
  }
}

/**
 * @param {string} path
 */
function normalizeFakeR2Path(path) {
  return path.replace(/\/\.$/, "").replace(/\/+$/, "")
}
