import config from "virtual:lightnet/config"
import { afterEach, expect, test, vi } from "vitest"

import { isExternalUrl } from "../../src/utils/urls"

// relative path should be treated as internal
test("Should treat relative paths as internal", () => {
  expect(isExternalUrl("/page")).toBe(false)
})

afterEach(() => {
  vi.unstubAllEnvs()
})

// absolute url that matches the configured site should be internal
test("Should treat URLs matching import.meta.env.SITE as internal", () => {
  vi.stubEnv("SITE", "https://sk8-ministries.dev")

  expect(isExternalUrl("https://sk8-ministries.dev/page")).toBe(false)
})

// domains listed in internalDomains should be treated as internal
test("Should treat configured internalDomains as internal", () => {
  config.internalDomains.push("internal.test")
  expect(isExternalUrl("https://internal.test/foo")).toBe(false)
  config.internalDomains.pop()
})

// any other absolute url should be external
test("Should treat other absolute URLs as external", () => {
  expect(isExternalUrl("https://example.com")).toBe(true)
})
