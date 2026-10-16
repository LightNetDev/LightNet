import type { APIContext } from "astro"
import { afterEach, describe, expect, test, vi } from "vitest"

import lightnetSveltiaAdmin from "../src/astro-integration/integration"

afterEach(async () => {
  vi.resetModules()
  vi.unstubAllEnvs()
  vi.clearAllMocks()
  vi.doUnmock("node:fs")
})

describe("standalone admin routes", () => {
  test.each([
    { path: "/tools/content/", url: "/tools/content" },
    { path: "admin", url: "/admin" },
  ])(
    "maps the configured dev URL $url to plain HTML",
    async ({ path, url }) => {
      const { hooks } = lightnetSveltiaAdmin({ path })
      const configure = hooks["astro:config:setup"]!
      const injectRoute = vi.fn()
      await configure({
        command: "dev",
        injectRoute,
        updateConfig: vi.fn(),
      } as unknown as Parameters<typeof configure>[0])
      expect(injectRoute).toHaveBeenCalledWith(
        expect.objectContaining({
          pattern: url.replace(/^\//, ""),
          entrypoint: "@lightnet/sveltia-admin/admin.html.ts",
          prerender: true,
        }),
      )
      expect(hooks["astro:server:setup"]).toBeUndefined()
    },
  )

  test.each(["manage", "tools/content"])(
    "serves plain HTML at path %j with base-aware URLs",
    async (path) => {
      vi.stubEnv("BASE_URL", "/site/")
      vi.doMock("virtual:lightnet/sveltiaAdminConfig", () => ({
        default: { path },
      }))

      const { GET } = await import("../src/admin.html")
      const response = await GET({} as APIContext)
      const html = await response.text()
      const prefix = `/site/${path}`

      expect(response.headers.get("Content-Type")).toContain("text/html")
      expect(html).toContain(`href="${prefix}/config.json"`)
      expect(html).toMatch(
        /import CMS from "https:\/\/unpkg\.com\/@sveltia\/cms@\d+\.\d+\.\d+[^/]*\/dist\/sveltia-cms\.mjs"/,
      )
      expect(html).toContain("CMS.init({})")
      expect(html).not.toContain("/@vite/client")
      expect(html).not.toContain("astro-dev-toolbar")
    },
  )

  test("pins the CDN URL to installed metadata rather than the dependency range", async () => {
    vi.stubEnv("BASE_URL", "/")
    vi.doMock("node:fs", async () => ({
      ...(await vi.importActual("node:fs")),
      readFileSync: vi.fn(() => JSON.stringify({ version: "9.8.7" })),
    }))
    vi.doMock("virtual:lightnet/sveltiaAdminConfig", () => ({
      default: { path: "admin" },
    }))

    const { GET } = await import("../src/admin.html")
    const html = await (await GET({} as APIContext)).text()
    expect(html).toContain(
      "https://unpkg.com/@sveltia/cms@9.8.7/dist/sveltia-cms.mjs",
    )
  })

  test.each(["build", "sync", "preview"] as const)(
    "uses Astro bundling for %s without building development assets",
    async (command) => {
      const { hooks } = lightnetSveltiaAdmin({ path: "tools/content" })
      const configure = hooks["astro:config:setup"]!
      const injectRoute = vi.fn()
      await configure({
        command,
        injectRoute,
        updateConfig: vi.fn(),
      } as unknown as Parameters<typeof configure>[0])
      expect(injectRoute.mock.calls.map(([route]) => route)).toEqual([
        {
          pattern: "tools/content",
          entrypoint: "@lightnet/sveltia-admin/Admin.astro",
          prerender: true,
        },
        {
          pattern: "tools/content/config.json",
          entrypoint: "@lightnet/sveltia-admin/config.json.ts",
          prerender: true,
        },
      ])
    },
  )
})
