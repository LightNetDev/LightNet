import { runInNewContext } from "node:vm"

import { describe, expect, it, vi } from "vitest"

import { outputHTML } from "../../src/shared/output-html"

const trustedOrigin = "https://cms.example.org"
const env = {
  ALLOWED_ORIGINS: `${trustedOrigin},https://admin.example.org:8443`,
}

const runPopup = async (response: Response, hasOpener = true) => {
  const html = await response.text()
  const postMessage = vi.fn()
  let receive: (event: { data: string; origin: string }) => void = () => {
    throw new Error("Message listener was not registered")
  }
  runInNewContext(html.match(/<script\b[^>]*>([\s\S]*?)<\/script\b[^>]*>/i)![1], {
    window: {
      opener: hasOpener ? { postMessage } : null,
      addEventListener: (name: string, listener: typeof receive) => {
        expect(name).toBe("message")
        receive = listener
      },
    },
  })
  return { html, postMessage, receive }
}

describe("outputHTML", () => {
  it("sets HTML, cache prevention, referrer policy, and secure cookie deletion headers", () => {
    const response = outputHTML({ token: "secret", env })
    expect(response.headers.get("Content-Type")).toBe("text/html;charset=UTF-8")
    expect(response.headers.get("Cache-Control")).toBe("no-store")
    expect(response.headers.get("Pragma")).toBe("no-cache")
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer")
    expect(response.headers.get("Set-Cookie")).toBe(
      "__Host-oauth-state=deleted; HttpOnly; Max-Age=0; Path=/; SameSite=Lax; Secure",
    )
  })

  it("announces readiness and sends the token only after a trusted handshake", async () => {
    const { postMessage, receive } = await runPopup(
      outputHTML({ token: "secret", env }),
    )
    expect(postMessage.mock.calls).toEqual([["authorizing:github", "*"]])
    postMessage.mockClear()
    for (const origin of [
      "https://evil.org",
      "https://cms.example.org.evil.org",
      "http://cms.example.org",
      "https://admin.example.org",
      "null",
    ]) {
      receive({ data: "authorizing:github", origin })
    }
    receive({ data: "authorizing:gitlab", origin: trustedOrigin })
    expect(postMessage).not.toHaveBeenCalled()
    for (const origin of [trustedOrigin, "https://admin.example.org:8443"]) {
      receive({ data: "authorizing:github", origin })
      expect(postMessage).toHaveBeenLastCalledWith(
        `authorization:github:success:${JSON.stringify({ provider: "github", token: "secret" })}`,
        origin,
      )
    }
  })

  it("returns the error protocol without disclosing a supplied token", async () => {
    const { postMessage, receive } = await runPopup(
      outputHTML({
        token: "secret",
        error: "Permission denied",
        errorCode: "DENIED",
        env,
      }),
    )
    receive({ data: "authorizing:github", origin: trustedOrigin })
    expect(postMessage).toHaveBeenLastCalledWith(
      `authorization:github:error:${JSON.stringify({ provider: "github", error: "Permission denied", errorCode: "DENIED" })}`,
      trustedOrigin,
    )
  })

  it.each([
    undefined,
    "",
    "https://example.com",
    `${trustedOrigin},http://evil.org`,
  ])(
    "never releases results with unconfigured or invalid origins %j",
    async (allowedOrigins) => {
      const { postMessage, receive } = await runPopup(
        outputHTML({
          token: "secret",
          env: { ALLOWED_ORIGINS: allowedOrigins },
        }),
      )
      postMessage.mockClear()
      for (const origin of [
        trustedOrigin,
        "https://example.com",
        "http://evil.org",
      ]) {
        receive({ data: "authorizing:github", origin })
      }
      expect(postMessage).not.toHaveBeenCalled()
    },
  )

  it.each(["token", "error"] as const)(
    "escapes script-breaking %s text while preserving the message",
    async (field) => {
      const value = '</script><script>alert("test")</script>\\\n'
      const { html, postMessage, receive } = await runPopup(
        outputHTML({ [field]: value, env }),
      )
      expect(html).not.toContain(value)
      expect(html.match(/<\/script>/g)).toHaveLength(1)
      receive({ data: "authorizing:github", origin: trustedOrigin })
      expect(postMessage).toHaveBeenLastCalledWith(
        `authorization:github:${field === "error" ? "error" : "success"}:${JSON.stringify({ provider: "github", [field]: value })}`,
        trustedOrigin,
      )
    },
  )

  it("works without an opener or environment configuration", async () => {
    const { postMessage, receive } = await runPopup(outputHTML({}), false)
    expect(() =>
      receive({ data: "authorizing:github", origin: trustedOrigin }),
    ).not.toThrow()
    expect(postMessage).not.toHaveBeenCalled()
  })
})
