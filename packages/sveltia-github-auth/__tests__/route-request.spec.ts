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

const route = (path: string, method = "GET") =>
  routeRequest(new Request(`https://auth.example.org${path}`, { method }), env)

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
})
