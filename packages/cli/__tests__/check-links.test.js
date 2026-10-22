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
    expect.objectContaining({ method: "GET" }),
  )
})

test.each([200, 206])(
  "checkLinks reads a body chunk and cancels a %i response",
  async (status) => {
    const projectDir = await createSite({
      "media.json": ["https://example.com/media"],
    })
    const cancel = vi.fn()
    const fetch = vi.fn(
      async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(new Uint8Array(0))
              controller.enqueue(new Uint8Array([42]))
            },
            cancel,
          }),
          { status },
        ),
    )

    try {
      await expect(
        checkLinks({}, { cwd: projectDir, fetch, isInteractive: false }),
      ).resolves.toBe(true)
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith(
        "https://example.com/media",
        expect.objectContaining({
          method: "GET",
          redirect: "follow",
          headers: expect.objectContaining({
            range: "bytes=0-0",
            "accept-encoding": "identity",
          }),
        }),
      )
      expect(cancel).toHaveBeenCalledTimes(1)
    } finally {
      await removeSite(projectDir)
    }
  },
)

test("checkLinks retries an unsatisfiable range with a plain GET", async () => {
  const projectDir = await createSite({
    "empty.json": ["https://example.com/empty"],
  })
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response(null, { status: 416 }))
    .mockResolvedValueOnce(
      new Response(null, { status: 200, headers: { "content-length": "0" } }),
    )

  try {
    await expect(
      checkLinks({}, { cwd: projectDir, fetch, isInteractive: false }),
    ).resolves.toBe(true)
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch.mock.calls[0][1].headers.range).toBe("bytes=0-0")
    expect(fetch.mock.calls[1][1].method).toBe("GET")
    expect(fetch.mock.calls[1][1].headers).not.toHaveProperty("range")
  } finally {
    await removeSite(projectDir)
  }
})

test.each([
  [
    "a failed body",
    () =>
      new Response(
        new ReadableStream({
          start(controller) {
            controller.error(new Error("Body failed"))
          },
        }),
      ),
  ],
  ["an empty partial response", () => new Response(null, { status: 206 })],
  [
    "a missing advertised body",
    () =>
      new Response(null, {
        headers: { "content-length": "12" },
      }),
  ],
])("checkLinks rejects %s", async (_label, response) => {
  const projectDir = await createSite({
    "media.json": ["https://example.com/media"],
  })
  const fetch = vi.fn(async () => response())

  try {
    await expect(
      checkLinks({}, { cwd: projectDir, fetch, isInteractive: false }),
    ).resolves.toBe(false)
    expect(fetch).toHaveBeenCalledTimes(1)
  } finally {
    await removeSite(projectDir)
  }
})

test("checkLinks keeps the timeout active while waiting for body bytes", async () => {
  const projectDir = await createSite({
    "media.json": ["https://example.com/media"],
  })
  const fetch = vi.fn(
    async (_url, options) =>
      new Response(
        new ReadableStream({
          start(controller) {
            options.signal.addEventListener(
              "abort",
              () => {
                controller.error(new Error("Body timed out"))
              },
              { once: true },
            )
          },
        }),
      ),
  )

  try {
    await expect(
      checkLinks(
        { timeout: "20" },
        { cwd: projectDir, fetch, isInteractive: false },
      ),
    ).resolves.toBe(false)
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true)
  } finally {
    await removeSite(projectDir)
  }
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
    expect.objectContaining({ method: "GET" }),
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
