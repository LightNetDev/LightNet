import config from "virtual:lightnet/config"
import { afterEach, expect, test, vi } from "vitest"

import { isExternalUrl } from "../../src/utils/is-external-url"

// relative path should be treated as internal
test("Should treat relative paths as internal", () => {
  expect(isExternalUrl("/page")).toBe(false)
})

afterEach(() => {
  vi.unstubAllEnvs()
})

test("Should treat URLs matching import.meta.env.SITE as internal", () => {
  vi.stubEnv("SITE", "https://sk8-ministries.dev")

  expect(isExternalUrl("https://sk8-ministries.dev/page")).toBe(false)
})

test("Should treat configured internalDomains as internal", () => {
  config.internalDomains.push("internal.test")
  expect(isExternalUrl("https://internal.test/foo")).toBe(false)
  config.internalDomains.pop()
})

test("Should treat other absolute URLs as external", () => {
  expect(isExternalUrl("https://example.com")).toBe(true)
})

test("Should treat absolute URLs without protocol as external", () => {
  expect(isExternalUrl("example.com")).toBe(true)
})

test("Should treat absolute paths without leading slash as inernal", () => {
  expect(isExternalUrl("my-path")).toBe(false)
})

test("Should be able to handle urls without protocol", () => {
  expect(isExternalUrl("foo.bar")).toBe(true)
})
