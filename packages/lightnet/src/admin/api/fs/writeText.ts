import { mkdir, writeFile } from "node:fs/promises"
import { dirname, isAbsolute, relative, resolve } from "node:path"

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

  const targetDir = dirname(targetPath)
  await mkdir(targetDir, { recursive: true })
  await writeFile(targetPath, await request.text(), "utf-8")

  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
