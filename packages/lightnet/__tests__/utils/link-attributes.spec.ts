import config from "virtual:lightnet/config"
import { afterEach, expect, test, vi } from "vitest"

import { getLinkAttributes } from "../../src/utils/link-attributes"

afterEach(() => {
  vi.unstubAllEnvs()
})

test("should return safe attributes for external links", () => {
  expect(getLinkAttributes("https://example.com")).toEqual({
    href: "https://example.com",
    target: "_blank",
    rel: "noopener noreferrer",
  })
})

test("should return internal attributes for relative links", () => {
  expect(getLinkAttributes("/about")).toEqual({
    href: "/about",
    target: "_self",
    rel: undefined,
  })
})

test("should treat configured internal domains as internal links", () => {
  config.internalDomains.push("internal.test")

  expect(getLinkAttributes("https://internal.test/page")).toEqual({
    href: "https://internal.test/page",
    target: "_self",
    rel: undefined,
  })

  config.internalDomains.pop()
})

test("should treat site urls as internal links", () => {
  vi.stubEnv("SITE", "https://sk8-ministries.dev")

  expect(getLinkAttributes("https://sk8-ministries.dev/page")).toEqual({
    href: "https://sk8-ministries.dev/page",
    target: "_self",
    rel: undefined,
  })
})
