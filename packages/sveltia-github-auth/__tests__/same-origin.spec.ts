import { runInNewContext } from "node:vm"

import { afterEach, describe, expect, it, vi } from "vitest"

import { type Env, handleAuth, handleCallback, handleRefresh } from "../src"

// No ALLOWED_ORIGINS: the authenticator runs on the CMS site's own origin.
const env: Env = {
  GITHUB_CLIENT_ID: "client-id",
  GITHUB_CLIENT_SECRET: "client-secret",
}

const site = "https://cms.example.org"

const authorize = (siteId = "cms.example.org", origin = site, config = env) =>
  handleAuth(
    new Request(`${origin}/_auth/auth?provider=github&site_id=${siteId}`),
    config,
  )

const refresh = (origin: string, method = "POST") =>
  handleRefresh(
    new Request(`${site}/_auth/auth`, {
      method,
      headers: { Origin: origin, "Content-Type": "application/json" },
      body:
        method === "POST"
          ? JSON.stringify({
              grant_type: "refresh_token",
              refresh_token: "ghr_refresh",
            })
          : undefined,
    }),
    env,
  )

afterEach(() => vi.unstubAllGlobals())

describe("without ALLOWED_ORIGINS", () => {
  it.each([undefined, "", "  "])(
    "allows the request's own origin when ALLOWED_ORIGINS is %j",
    async (allowedOrigins) => {
      const response = await authorize(undefined, undefined, {
        ...env,
        ALLOWED_ORIGINS: allowedOrigins,
      })
      expect(response.status).toBe(302)
    },
  )

  it("rejects other site IDs", async () => {
    const response = await authorize("evil.example.org")
    expect(await response.text()).toContain("UNSUPPORTED_DOMAIN")
  })

  it("rejects requests that do not use HTTPS", async () => {
    const response = await authorize(undefined, "http://cms.example.org")
    expect(await response.text()).toContain("MISCONFIGURED_ORIGINS")
  })

  it("delivers the token only to an opener on its own origin", async () => {
    const auth = await authorize()
    const state = new URL(auth.headers.get("Location")!).searchParams.get(
      "state",
    )
    const cookie = auth.headers.get("Set-Cookie")!.split(";")[0]
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ access_token: "ghu_access" })),
    )
    const response = await handleCallback(
      new Request(`${site}/_auth/callback?code=code&state=${state}`, {
        headers: { Cookie: cookie },
      }),
      env,
    )
    const postMessage = vi.fn()
    let listener: (event: { data: string; origin: string }) => void = () => {}
    runInNewContext(
      (await response.text()).match(/<script>([\s\S]*)<\/script>/i)![1],
      {
        window: {
          opener: { postMessage },
          addEventListener: (_name: string, handler: typeof listener) => {
            listener = handler
          },
        },
      },
    )
    postMessage.mockClear()
    listener({ data: "authorizing:github", origin: "https://evil.example.org" })
    expect(postMessage).not.toHaveBeenCalled()
    listener({ data: "authorizing:github", origin: site })
    expect(postMessage).toHaveBeenCalledWith(
      expect.stringContaining("ghu_access"),
      site,
    )
  })

  it("refreshes tokens for the request's own origin", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ access_token: "ghu_new" })),
    )
    const response = await refresh(site)
    expect(response.status).toBe(200)
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(site)
  })

  it.each([
    ["POST", "https://evil.example.org"],
    ["OPTIONS", "https://evil.example.org"],
  ])("rejects %s refresh requests from %s", async (method, origin) => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    expect((await refresh(origin, method)).status).toBe(403)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe("with ALLOWED_ORIGINS", () => {
  it("does not also allow the request's own origin", async () => {
    const response = await authorize(
      "auth.example.org",
      "https://auth.example.org",
      {
        ...env,
        ALLOWED_ORIGINS: "cms.example.org",
      },
    )
    expect(await response.text()).toContain("UNSUPPORTED_DOMAIN")
  })
})
