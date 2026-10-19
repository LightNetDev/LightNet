import { describe, expect, it, vi } from "vitest"

import { createCodeChallenge, createCodeVerifier } from "../../src/shared/pkce"

describe("createCodeVerifier", () => {
  it("creates an unpadded base64url verifier with fresh randomness", () => {
    const verifier = createCodeVerifier()
    expect(verifier).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(createCodeVerifier()).not.toBe(verifier)
  })

  it("uses 32 cryptographically random bytes and encodes URL-unsafe characters", () => {
    const random = vi
      .spyOn(crypto, "getRandomValues")
      .mockImplementationOnce((bytes) => {
        expect(bytes).toBeInstanceOf(Uint8Array)
        expect(bytes!.byteLength).toBe(32)
        ;(bytes as Uint8Array).fill(255)
        ;(bytes as Uint8Array)[0] = 251
        return bytes
      })
    try {
      expect(createCodeVerifier()).toBe(`-${"_".repeat(41)}8`)
      expect(random).toHaveBeenCalledOnce()
    } finally {
      random.mockRestore()
    }
  })
})

describe("createCodeChallenge", () => {
  it("matches the RFC 7636 Appendix B S256 test vector", async () => {
    expect(
      await createCodeChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"),
    ).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM")
  })
})
