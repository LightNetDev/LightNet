import { afterEach, describe, expect, it, vi } from "vitest"

import { type Env, handleRefresh } from "../src/index"

const env: Env = {
  ALLOWED_ORIGINS: "https://cms.example.org,admin.example.org:8443",
  GITHUB_CLIENT_ID: "client-id",
  GITHUB_CLIENT_SECRET: "client-secret",
}

const origin = "https://cms.example.org"

const refresh = ({
  body = {
    grant_type: "refresh_token",
    client_id: "",
    refresh_token: "ghr_refresh",
  } as unknown,
  headers = { Origin: origin } as Record<string, string>,
  method = "POST",
  config = env,
} = {}) =>
  handleRefresh(
    new Request("https://auth.example.org/auth", {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body:
        method === "POST"
          ? typeof body === "string"
            ? body
            : JSON.stringify(body)
          : undefined,
    }),
    config,
  )

afterEach(() => vi.unstubAllGlobals())

describe("handleRefresh", () => {
  it("exchanges the refresh token with the configured credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        access_token: "ghu_new",
        refresh_token: "ghr_new",
        expires_in: 28800,
        refresh_token_expires_in: 15811200,
        token_type: "bearer",
        scope: "",
        unexpected: "dropped",
      }),
    )
    vi.stubGlobal("fetch", fetchMock)

    const response = await refresh()

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe("https://github.com/login/oauth/access_token")
    expect(JSON.parse(options.body)).toEqual({
      grant_type: "refresh_token",
      refresh_token: "ghr_refresh",
      client_id: "client-id",
      client_secret: "client-secret",
    })
    expect(response.status).toBe(200)
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin)
    expect(response.headers.get("Cache-Control")).toBe("no-store")
    expect(response.headers.get("Vary")).toBe("Origin")
    expect(await response.json()).toEqual({
      access_token: "ghu_new",
      refresh_token: "ghr_new",
      expires_in: 28800,
      refresh_token_expires_in: 15811200,
      token_type: "bearer",
      scope: "",
    })
  })

  it("answers preflight requests from allowed origins", async () => {
    const response = await refresh({
      method: "OPTIONS",
      headers: { Origin: "https://admin.example.org:8443" },
    })
    expect(response.status).toBe(204)
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://admin.example.org:8443",
    )
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("POST")
    expect(response.headers.get("Access-Control-Allow-Headers")).toContain(
      "Content-Type",
    )
  })

  it.each([
    [{ headers: {} }],
    [{ headers: { Origin: "null" } }],
    [{ headers: { Origin: "https://evil.example.org" } }],
    [{ headers: { Origin: "http://cms.example.org" } }],
    [{ headers: { Origin: "https://admin.example.org" } }],
    [{ method: "OPTIONS", headers: { Origin: "https://evil.example.org" } }],
    [{ config: { ...env, ALLOWED_ORIGINS: "" } }],
    [{ config: { ...env, ALLOWED_ORIGINS: "https://example.com" } }],
  ])("rejects disallowed origins %j", async (options) => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const response = await refresh(options)
    expect(response.status).toBe(403)
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([
    ["not json", "invalid_request", 400],
    [{ grant_type: "authorization_code", code: "x" }, "invalid_request", 400],
    [{ grant_type: "refresh_token" }, "invalid_request", 400],
    [
      { grant_type: "refresh_token", refresh_token: "bad token" },
      "invalid_request",
      400,
    ],
    [
      { grant_type: "refresh_token", refresh_token: "x".repeat(9000) },
      "invalid_request",
      400,
    ],
  ])("rejects invalid request body %#", async (body, error, status) => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const response = await refresh({ body })
    expect(response.status).toBe(status)
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin)
    expect(await response.json()).toEqual({ error })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects other methods", async () => {
    const response = await refresh({ method: "GET" })
    expect(response.status).toBe(405)
    expect(response.headers.get("Allow")).toBe("POST, OPTIONS")
  })

  it("reports a missing client configuration", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const response = await refresh({
      config: { ...env, GITHUB_CLIENT_SECRET: "" },
    })
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: "misconfigured_client" })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([
    [() => Promise.reject(new Error("offline")), 502, "token_request_failed"],
    [() => Promise.resolve(new Response("nope")), 502, "token_request_failed"],
    [() => Promise.resolve(Response.json({})), 502, "token_request_failed"],
    [
      () =>
        Promise.resolve(
          Response.json({
            error: "bad_refresh_token",
            error_description: "The refresh token passed is incorrect.",
          }),
        ),
      400,
      "bad_refresh_token",
    ],
  ])("handles unsuccessful refreshes %#", async (reply, status, error) => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(reply))
    const response = await refresh()
    expect(response.status).toBe(status)
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin)
    expect((await response.json()).error).toBe(error)
  })
})
