import { createWriteStream } from "node:fs"
import { mkdir, rename, rm } from "node:fs/promises"
import { dirname, isAbsolute, relative, resolve } from "node:path"
import { Writable } from "node:stream"
import { fileURLToPath } from "node:url"

import type { APIRoute } from "astro"
import { root } from "astro:config/server"

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  const rootDirPath = fileURLToPath(root)
  const requestedPath = new URL(request.url).searchParams.get("path")
  if (!requestedPath) {
    throw new Error("'path' search param is undefined.")
  }
  if (isAbsolute(requestedPath)) {
    throw new Error("Absolute paths are not allowed.")
  }

  const targetPath = resolve(rootDirPath, requestedPath)
  const relativeToRoot = relative(rootDirPath, targetPath)
  if (
    relativeToRoot.startsWith("..") ||
    relativeToRoot === "" ||
    isAbsolute(relativeToRoot)
  ) {
    throw new Error("Path escapes project root.")
  }
  const { body } = request
  if (!body) {
    throw new Error("Request body missing.")
  }

  const targetDir = dirname(targetPath)
  await mkdir(targetDir, { recursive: true })

  const tmpPath = `${targetPath}.tmp-${Date.now()}`
  try {
    await body.pipeTo(Writable.toWeb(createWriteStream(tmpPath)))
    await rename(tmpPath, targetPath)
  } finally {
    await rm(tmpPath, { force: true }).catch(() => { })
  }

  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
