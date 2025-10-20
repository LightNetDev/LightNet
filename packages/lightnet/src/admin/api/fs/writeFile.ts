import { root } from "astro:config/server"
import { fileURLToPath } from "node:url"
import { join, parse } from "node:path"
import { mkdir, writeFile } from "node:fs/promises"
import type { APIRoute } from "astro"

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  const rootDirPath = fileURLToPath(root)
  const path = new URL(request.url).searchParams.get("path")
  if (!path) {
    throw new Error("'path' search param is undefined.")
  }
  const { dir, base } = parse(path)
  const outDirPath = join(rootDirPath, dir)
  const outFilePath = join(outDirPath, base)

  await mkdir(outDirPath, { recursive: true })
  const body = await request.text()
  await writeFile(outFilePath, body, "utf-8")

  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}
