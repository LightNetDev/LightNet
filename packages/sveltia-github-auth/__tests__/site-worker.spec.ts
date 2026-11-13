import { describe, expect, it, vi } from "vitest"

import * as siteWorkerModule from "../src/site-worker"
import siteWorker, { type SiteWorkerEnv } from "../src/site-worker"

const env: SiteWorkerEnv = {
  ALLOWED_ORIGINS: "cms.example.org",
  GITHUB_CLIENT_ID: "client-id",
  GITHUB_CLIENT_SECRET: "client-secret",
}

const request = (path: string) => new Request(`https://cms.example.org${path}`)

describe("siteWorker", () => {
  it("only has a default export", () => {
    // Workers treat every export of the main module as an entrypoint.
    expect(Object.keys(siteWorkerModule)).toEqual(["default"])
  })

  it("serves the authentication routes under /_auth", async () => {
    const response = await siteWorker.fetch(
      request("/_auth/auth?provider=github&site_id=cms.example.org"),
      env,
    )
    expect(response.status).toBe(302)
    expect(response.headers.get("Location")).toMatch(
      /^https:\/\/github\.com\/login\/oauth\/authorize\?/,
    )
  })

  it("does not serve the authentication routes at the root", async () => {
    const assets = vi.fn(async () => new Response("asset"))
    const response = await siteWorker.fetch(request("/auth"), {
      ...env,
      ASSETS: { fetch: assets },
    })
    expect(await response.text()).toBe("asset")
  })

  it("passes other requests to the static assets", async () => {
    const assets = vi.fn(async () => new Response("not found", { status: 404 }))
    const unknown = request("/_auth/unknown")
    const response = await siteWorker.fetch(unknown, {
      ...env,
      ASSETS: { fetch: assets },
    })
    expect(assets).toHaveBeenCalledWith(unknown)
    expect(await response.text()).toBe("not found")
  })

  it("responds with 404 without an assets binding", async () => {
    const response = await siteWorker.fetch(request("/_auth/unknown"), env)
    expect(response.status).toBe(404)
  })
})
