import { describe, expect, it } from "vitest"

import { getCallbackUrl } from "../../src/shared/callback-url"

describe("getCallbackUrl", () => {
  it.each(["https://auth.example.org", "https://auth.example.org:8443"])(
    "builds a fixed callback for %s",
    (origin) => {
      expect(getCallbackUrl(origin)).toBe(`${origin}/callback`)
    },
  )

  it.each([
    undefined,
    "",
    "not a URL",
    "/callback",
    "http://auth.example.org",
    "https://auth.example.org/",
    "https://auth.example.org/path",
    "https://auth.example.org?query=1",
    "https://auth.example.org#fragment",
    "https://user@auth.example.org",
    "https://user:password@auth.example.org",
    "https://AUTH.example.org",
    "https://auth.example.org:443",
    " https://auth.example.org ",
  ])("rejects a missing or noncanonical HTTPS origin: %j", (origin) => {
    expect(getCallbackUrl(origin)).toBeUndefined()
  })
})
