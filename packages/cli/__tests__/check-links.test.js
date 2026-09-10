import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { expect, test, vi } from "vitest"

import { checkLinks } from "../src/check-links.js"

test("checkLinks preserves link checking when no exclusions are provided", async () => {
  const projectDir = await createSite({
    "public.json": ["https://example.com/public"],
  })
  const fetch = vi.fn(async () => new Response(null, { status: 404 }))

  try {
    await expect(
      checkLinks({}, { cwd: projectDir, fetch, isInteractive: false }),
    ).resolves.toBe(false)
  } finally {
    await removeSite(projectDir)
  }

  expect(fetch).toHaveBeenCalledWith(
    "https://example.com/public",
    expect.objectContaining({ method: "HEAD" }),
  )
})

test("checkLinks does not fetch an excluded root-relative URL", async () => {
  const projectDir = await createSite({
    "private.json": ["/articles/private"],
  })
  const fetch = vi.fn()

  try {
    await expect(
      checkLinks(
        { exclude: ["/articles/**"] },
        { cwd: projectDir, fetch, isInteractive: false },
      ),
    ).resolves.toBe(true)
  } finally {
    await removeSite(projectDir)
  }

  expect(fetch).not.toHaveBeenCalled()
})

test("checkLinks applies every exclusion pattern", async () => {
  const projectDir = await createSite({
    "links.json": [
      "/articles/private",
      "https://internal.example/document",
      "https://example.com/public",
    ],
  })
  const fetch = vi.fn(async () => new Response(null, { status: 204 }))

  try {
    await expect(
      checkLinks(
        {
          exclude: ["/articles/**", "https://internal.example/**"],
        },
        {
          cwd: projectDir,
          fetch,
          isInteractive: false,
        },
      ),
    ).resolves.toBe(true)
  } finally {
    await removeSite(projectDir)
  }

  expect(fetch).toHaveBeenCalledTimes(1)
  expect(fetch).toHaveBeenCalledWith(
    "https://example.com/public",
    expect.objectContaining({ method: "HEAD" }),
  )
})

test("checkLinks deduplicates excluded URLs and reports every source", async () => {
  const projectDir = await createSite({
    "first.json": ["/articles/private"],
    "second.json": ["/articles/private"],
  })
  const output = []
  const write = vi
    .spyOn(process.stdout, "write")
    .mockImplementation((chunk) => {
      output.push(String(chunk))
      return true
    })

  try {
    await expect(
      checkLinks(
        { exclude: ["/articles/**"] },
        { cwd: projectDir, fetch: vi.fn(), isInteractive: false },
      ),
    ).resolves.toBe(true)
  } finally {
    write.mockRestore()
    await removeSite(projectDir)
  }

  const report = output.join("")
  expect(report).toContain("Excluded links (1)")
  expect(report).toContain("/articles/private")
  expect(report).toContain('Excluded by: "/articles/**"')
  expect(report).toContain("first.json")
  expect(report).toContain("second.json")
})

test("checkLinks leaves unmatched exclusions without effect", async () => {
  const projectDir = await createSite({
    "public.json": ["https://example.com/public"],
  })
  const fetch = vi.fn(async () => new Response(null, { status: 404 }))

  try {
    await expect(
      checkLinks(
        { exclude: ["/articles/**"] },
        { cwd: projectDir, fetch, isInteractive: false },
      ),
    ).resolves.toBe(false)
  } finally {
    await removeSite(projectDir)
  }

  expect(fetch).toHaveBeenCalledTimes(1)
})

test("checkLinks reports invalid exclusion patterns clearly", async () => {
  const projectDir = await createSite({
    "public.json": ["https://example.com/public"],
  })

  try {
    await expect(
      checkLinks(
        { exclude: ["/articles/["] },
        { cwd: projectDir, fetch: vi.fn(), isInteractive: false },
      ),
    ).rejects.toThrow('Invalid "--exclude" glob pattern "/articles/[".')
  } finally {
    await removeSite(projectDir)
  }
})

/**
 * @param {Record<string, string[]>} mediaFiles
 */
async function createSite(mediaFiles) {
  const projectDir = await mkdtemp(join(tmpdir(), "lightnet-check-links-test-"))
  const mediaDir = join(projectDir, "src/content/media")
  await mkdir(mediaDir, { recursive: true })
  await Promise.all(
    Object.entries(mediaFiles).map(async ([fileName, urls]) => {
      await writeFile(
        join(mediaDir, fileName),
        JSON.stringify({
          content: urls.map((url) => ({ type: "link", url })),
          image: "/images/example.jpg",
        }),
      )
    }),
  )
  return projectDir
}

/**
 * @param {string} projectDir
 */
async function removeSite(projectDir) {
  await rm(projectDir, { force: true, recursive: true })
}
