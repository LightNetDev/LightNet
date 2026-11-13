import { beforeEach, describe, expect, it, vi } from "vitest"

import { handleAuth } from "../src/handle-auth"
import { handleCallback } from "../src/handle-callback"
import { handleRefresh } from "../src/handle-refresh"
import { type Env, routeRequest } from "../src/index"

vi.mock("../src/handle-auth", () => ({
  handleAuth: vi.fn(async () => new Response("auth")),
}))
vi.mock("../src/handle-callback", () => ({
  handleCallback: vi.fn(async () => new Response("callback")),
}))
vi.mock("../src/handle-refresh", () => ({
  handleRefresh: vi.fn(async () => new Response("refresh")),
}))

const env: Env = { ALLOWED_ORIGINS: "cms.example.org" }

const route = (path: string, method = "GET", basePath?: string) =>
  routeRequest(
    new Request(`https://auth.example.org${path}`, { method }),
    env,
    {
      basePath,
    },
  )

beforeEach(() => vi.clearAllMocks())

describe("routeRequest", () => {
  it.each([
    ["GET", "/auth", "auth"],
    ["GET", "/auth?provider=github&site_id=cms.example.org", "auth"],
    ["GET", "/oauth/authorize", "auth"],
    ["GET", "/callback?code=abc&state=def", "callback"],
    ["GET", "/oauth/redirect", "callback"],
    ["POST", "/auth", "refresh"],
    ["OPTIONS", "/auth", "refresh"],
    ["POST", "/oauth/access_token", "refresh"],
    ["OPTIONS", "/oauth/access_token", "refresh"],
  ])("routes %s %s to the %s handler", async (method, path, expected) => {
    const response = await route(path, method)
    expect(await response?.text()).toBe(expected)
  })

  it("passes the request and env to the handler", async () => {
    const request = new Request("https://auth.example.org/auth")
    await routeRequest(request, env)
    expect(handleAuth).toHaveBeenCalledWith(request, env)
  })

  it.each([
    ["GET", "/"],
    ["GET", "/auth/"],
    ["GET", "/admin/auth"],
    ["GET", "/oauth/access_token"],
    ["POST", "/callback"],
    ["PUT", "/auth"],
    ["DELETE", "/oauth/access_token"],
  ])("returns undefined for %s %s", async (method, path) => {
    expect(await route(path, method)).toBeUndefined()
    expect(handleAuth).not.toHaveBeenCalled()
    expect(handleCallback).not.toHaveBeenCalled()
    expect(handleRefresh).not.toHaveBeenCalled()
  })

  describe("with basePath", () => {
    it.each([
      ["GET", "/_auth/auth", "auth"],
      ["GET", "/_auth/oauth/authorize", "auth"],
      ["GET", "/_auth/callback", "callback"],
      ["GET", "/_auth/oauth/redirect", "callback"],
      ["POST", "/_auth/auth", "refresh"],
      ["OPTIONS", "/_auth/oauth/access_token", "refresh"],
    ])("routes %s %s to the %s handler", async (method, path, expected) => {
      const response = await route(path, method, "/_auth")
      expect(await response?.text()).toBe(expected)
    })

    it.each([
      ["GET", "/auth"],
      ["GET", "/callback"],
      ["POST", "/auth"],
      ["GET", "/_auth"],
      ["GET", "/_auth/"],
      ["GET", "/_authx/auth"],
      ["GET", "/other/_auth/auth"],
    ])("returns undefined for %s %s", async (method, path) => {
      expect(await route(path, method, "/_auth")).toBeUndefined()
    })

    it.each(["_auth", "/_auth/", "_auth/"])(
      "normalizes %j to /_auth",
      async (basePath) => {
        const response = await route("/_auth/auth", "GET", basePath)
        expect(await response?.text()).toBe("auth")
      },
    )

    it("supports nested base paths", async () => {
      const response = await route("/cms/auth/callback", "GET", "/cms/auth")
      expect(await response?.text()).toBe("callback")
    })

    it.each(["", "/"])("treats %j as the root", async (basePath) => {
      const response = await route("/auth", "GET", basePath)
      expect(await response?.text()).toBe("auth")
    })

    it.each(["/../auth", "/./auth", "/_auth?x", "/_auth#x", "/a b", "/%2e"])(
      "throws for invalid basePath %j",
      async (basePath) => {
        await expect(route("/auth", "GET", basePath)).rejects.toThrow(
          "Invalid basePath",
        )
      },
    )
  })
})
