import { afterEach, expect, test, vi } from "vitest"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

test("Should expose pathWithBase from lightnet/utils", async () => {
  vi.stubEnv("BASE_URL", "/docs/")

  const { pathWithBase } = await import("lightnet/utils")

  expect(pathWithBase("/admin")).toBe("/docs/admin")
})
