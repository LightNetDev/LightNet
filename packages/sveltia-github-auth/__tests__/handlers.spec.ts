import { runInNewContext } from "node:vm"

import { afterEach, describe, expect, it, vi } from "vitest"

import { type Env, handleAuth, handleCallback } from "../src/index"

const env: Env = {
  ALLOWED_ORIGINS: "https://cms.example.org,https://admin.example.org:8443",
  GITHUB_CLIENT_ID: "client-id",
  GITHUB_CLIENT_SECRET: "client-secret",
}

const authorize = (
  query = "provider=github&site_id=cms.example.org",
  config = env,
) => handleAuth(new Request(`https://auth.example.org/auth?${query}`), config)

const startFlow = async (config = env) => {
  const response = await authorize(undefined, config)
  const location = new URL(response.headers.get("Location")!)
  const cookie = response.headers.get("Set-Cookie")!.split(";")[0]
  const callback = new URL("https://auth.example.org/callback")
  callback.searchParams.set("code", "authorization-code")
  callback.searchParams.set("state", location.searchParams.get("state")!)
  return { location, cookie, callback }
}

afterEach(() => vi.unstubAllGlobals())

describe("handleAuth", () => {
  it("redirects to GitHub with a secure state cookie and matching PKCE challenge", async () => {
    const { location, cookie } = await startFlow()
    expect(location.origin + location.pathname).toBe(
      "https://github.com/login/oauth/authorize",
    )
    expect(location.searchParams.has("redirect_uri")).toBe(false)
    expect(location.searchParams.get("client_id")).toBe(env.GITHUB_CLIENT_ID)
    expect(location.searchParams.get("scope")).toBe("repo,user")
    expect(location.searchParams.get("code_challenge_method")).toBe("S256")
    // Verifiers may contain underscores, so extract after the fixed provider/state prefix.
    const fullVerifier = cookie.split("=github_")[1].slice(33)
    expect(fullVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/)
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(fullVerifier),
    )
    expect(location.searchParams.get("code_challenge")).toBe(
      Buffer.from(digest).toString("base64url"),
    )
    const response = await authorize()
    expect(response.status).toBe(302)
    expect(response.headers.get("Set-Cookie")).toContain(
      "HttpOnly; Path=/; Max-Age=600; SameSite=Lax; Secure",
    )
    expect(response.headers.get("Set-Cookie")).not.toContain(cookie)
  })

  it("accepts a supported custom scope", async () => {
    const response = await authorize(
      "provider=github&site_id=cms.example.org&scope=public_repo",
    )
    expect(
      new URL(response.headers.get("Location")!).searchParams.get("scope"),
    ).toBe("public_repo")
  })

  it.each([
    ["provider=gitlab&site_id=cms.example.org", "UNSUPPORTED_BACKEND"],
    ["site_id=cms.example.org", "UNSUPPORTED_BACKEND"],
    [
      "provider=github&site_id=cms.example.org&scope=admin:org",
      "UNSUPPORTED_SCOPE",
    ],
    ["provider=github&site_id=cms.example.org&scope=", "UNSUPPORTED_SCOPE"],
    ["provider=github&site_id=evil.example.org", "UNSUPPORTED_DOMAIN"],
    ["provider=github", "UNSUPPORTED_DOMAIN"],
  ])("rejects invalid authorization query %s", async (query, error) => {
    expect(await (await authorize(query)).text()).toContain(error)
  })

  it.each([
    [{ ALLOWED_ORIGINS: "" }, "MISCONFIGURED_ORIGINS"],
    [{ ALLOWED_ORIGINS: "https://example.com" }, "MISCONFIGURED_ORIGINS"],
    [
      { ALLOWED_ORIGINS: "https://cms.example.org,http://evil.example.org" },
      "MISCONFIGURED_ORIGINS",
    ],
    [{ ALLOWED_ORIGINS: "https://cms.example.org/" }, "MISCONFIGURED_ORIGINS"],
    [{ GITHUB_CLIENT_SECRET: "" }, "MISCONFIGURED_CLIENT"],
  ])("rejects invalid configuration %j", async (overrides, error) => {
    expect(
      await (await authorize(undefined, { ...env, ...overrides })).text(),
    ).toContain(error)
  })
})

describe("handleCallback", () => {
  it.each([
    env.ALLOWED_ORIGINS,
    "cms.example.org,admin.example.org:8443",
    "https://cms.example.org,admin.example.org:8443",
  ])(
    "exchanges the code and restricts popup results with origins %s",
    async (allowedOrigins) => {
      const config = { ...env, ALLOWED_ORIGINS: allowedOrigins }
      const { cookie, callback } = await startFlow(config)
      const token = "token</script><script>bad()"
      const fetchMock = vi
        .fn()
        .mockResolvedValue(Response.json({ access_token: token }))
      vi.stubGlobal("fetch", fetchMock)
      const response = await handleCallback(
        new Request(callback, { headers: { Cookie: cookie } }),
        config,
      )
      expect(fetchMock).toHaveBeenCalledOnce()
      const [url, options] = fetchMock.mock.calls[0]
      expect(url).toBe("https://github.com/login/oauth/access_token")
      expect(JSON.parse(options.body)).toEqual({
        code: "authorization-code",
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code_verifier: cookie.split("=github_")[1].slice(33),
      })
      expect(response.headers.get("Cache-Control")).toBe("no-store")
      expect(response.headers.get("Set-Cookie")).toContain("Max-Age=0")
      const html = await response.text()
      expect(html).not.toContain(token)
      const postMessage = vi.fn()
      let listener: (event: { data: string; origin: string }) => void = () => {}
      runInNewContext(html.match(/<script>([\s\S]*)<\/script>/i)![1], {
        window: {
          opener: { postMessage },
          addEventListener: (_name: string, handler: typeof listener) => {
            listener = handler
          },
        },
      })
      expect(postMessage).toHaveBeenCalledWith("authorizing:github", "*")
      postMessage.mockClear()
      listener({
        data: "authorizing:github",
        origin: "https://evil.example.org",
      })
      listener({
        data: "authorizing:github",
        origin: "https://admin.example.org",
      })
      listener({ data: "unexpected", origin: "https://cms.example.org" })
      expect(postMessage).not.toHaveBeenCalled()
      listener({
        data: "authorizing:github",
        origin: "https://admin.example.org:8443",
      })
      expect(postMessage).toHaveBeenCalledWith(
        `authorization:github:success:${JSON.stringify({ provider: "github", token })}`,
        "https://admin.example.org:8443",
      )
    },
  )

  it.each(["missing-cookie", "wrong-state", "missing-code", "bad-config"])(
    "rejects %s before contacting GitHub",
    async (scenario) => {
      const { callback, cookie } = await startFlow()
      const fetchMock = vi.fn()
      vi.stubGlobal("fetch", fetchMock)
      if (scenario === "wrong-state")
        callback.searchParams.set("state", "0".repeat(32))
      if (scenario === "missing-code") callback.searchParams.delete("code")
      const response = await handleCallback(
        new Request(callback, {
          headers: scenario === "missing-cookie" ? {} : { Cookie: cookie },
        }),
        scenario === "bad-config" ? { ...env, ALLOWED_ORIGINS: "" } : env,
      )
      expect(await response.text()).toContain(
        {
          "missing-cookie": "UNSUPPORTED_BACKEND",
          "wrong-state": "CSRF_DETECTED",
          "missing-code": "AUTH_CODE_REQUEST_FAILED",
          "bad-config": "MISCONFIGURED_ORIGINS",
        }[scenario],
      )
      expect(fetchMock).not.toHaveBeenCalled()
    },
  )

  it.each([
    [() => Promise.reject(new Error("offline")), "TOKEN_REQUEST_FAILED"],
    [() => Promise.resolve(new Response("not json")), "MALFORMED_RESPONSE"],
    [() => Promise.resolve(Response.json({})), "MALFORMED_RESPONSE"],
    [
      () => Promise.resolve(Response.json({ access_token: "bad\ntoken" })),
      "MALFORMED_RESPONSE",
    ],
    [
      () => Promise.resolve(Response.json({ error: "bad_verification_code" })),
      "bad_verification_code",
    ],
  ])("handles unsuccessful token exchange %#", async (reply, error) => {
    const { cookie, callback } = await startFlow()
    vi.stubGlobal("fetch", vi.fn().mockImplementation(reply))
    const response = await handleCallback(
      new Request(callback, { headers: { Cookie: cookie } }),
      env,
    )
    expect(await response.text()).toContain(error)
  })
})
