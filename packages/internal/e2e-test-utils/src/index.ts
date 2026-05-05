import { mkdir, rm } from "node:fs/promises"
import { createServer } from "node:net"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import type { Page } from "@playwright/test"
import { build, preview } from "astro"

process.env.ASTRO_TELEMETRY_DISABLED = "true"
process.env.ASTRO_DISABLE_UPDATE_CHECK = "true"

type Server = Awaited<ReturnType<typeof preview>>

const servers = new Map<string, Server>()
const ports = new Map<string, number>()

const getAvailablePort = () =>
  new Promise<number>((resolve, reject) => {
    const probe = createServer()

    probe.once("error", reject)
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address()

      if (!address || typeof address === "string") {
        probe.close(() => reject(new Error("Could not resolve a preview port")))
        return
      }

      probe.close((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve(address.port)
      })
    })
  })

const ensureServer = async (root: string) => {
  let server = servers.get(root)

  if (!server) {
    // Pick a concrete free port up front so Astro preview doesn't fall back
    // from its default port during startup and send tests to the wrong app.
    const port = ports.get(root) ?? (await getAvailablePort())
    ports.set(root, port)

    const config = {
      logLevel: "error" as const,
      root,
      server: {
        host: "127.0.0.1",
        port,
      },
    }

    await Promise.all([
      rm(join(root, "dist"), { force: true, recursive: true }),
      rm(join(root, ".astro"), { force: true, recursive: true }),
      mkdir(join(root, ".astro"), { recursive: true }),
      mkdir(join(root, "node_modules", ".astro"), { recursive: true }),
    ])

    await build(config)
    server = await preview(config)
    servers.set(root, server)
  }

  return server
}

class AstroFixturePage {
  constructor(
    protected readonly server: Server,
    readonly page: Page,
  ) {}

  goto(path: string) {
    return this.page.goto(this.resolveURL(path))
  }

  resolveURL(path: string) {
    return `http://${this.server.host}:${this.server.port}${path.replace(/^\/?/, "/")}`
  }
}

const createAstroFixturePage = async (root: string, page: Page) => {
  const server = await ensureServer(root)
  return new AstroFixturePage(server, page)
}

const resolveFixturePath = (baseUrl: string, relativePath: string) =>
  fileURLToPath(new URL(relativePath, baseUrl))

const teardownAstroFixtures = async () => {
  await Promise.all([...servers.values()].map((server) => server.stop()))
  servers.clear()
  ports.clear()
}

export {
  AstroFixturePage,
  createAstroFixturePage,
  resolveFixturePath,
  teardownAstroFixtures,
}
