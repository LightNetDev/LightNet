import { mkdir, rename, open, unlink } from "node:fs/promises"
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

  const tmpPath = `${targetPath}.tmp-${Date.now()}`

  // 1️⃣ Write to a temporary file
  const handle = await open(tmpPath, "w")
  try {
    await handle.writeFile(await request.text(), "utf-8")

    // 2️⃣ Force the write to disk
    await handle.sync()

    // 3️⃣ Close the temp file
    await handle.close()

    // 4️⃣ Atomically replace the original file
    await rename(tmpPath, targetPath)

    // 5️⃣ Optional: flush the directory entry too
    const dirHandle = await open(targetDir, "r")
    await dirHandle.sync()
    await dirHandle.close()
  } catch (err) {
    // Cleanup if something failed
    await handle.close().catch(() => {})
    await unlink(tmpPath).catch(() => {})
    throw err
  }

  // await writeFile(tmpPath, await request.text(), "utf-8")

  // await rename(tmpPath, targetPath)

  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
