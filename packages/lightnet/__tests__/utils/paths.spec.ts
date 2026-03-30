import { afterEach, expect, test, vi } from "vitest"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

test("Should build localized paths at root base", async () => {
  vi.stubEnv("BASE_URL", "/")

  const { detailsPagePath, localizePath, searchPagePath } =
    await import("../../src/utils/paths")

  expect(detailsPagePath("en", { id: "my-book" })).toBe("/en/media/my-book")
  expect(searchPagePath("en", { category: "comics" })).toBe(
    "/en/media?category=comics",
  )
  expect(localizePath("en", "/about")).toBe("/en/about")
})

test("Should keep internal paths unchanged at root base", async () => {
  vi.stubEnv("BASE_URL", "/")

  const { pathWithBase } = await import("../../src/utils/paths")

  expect(pathWithBase("/en/about")).toBe("/en/about")
  expect(pathWithBase("/en/media?category=comics#results")).toBe(
    "/en/media?category=comics#results",
  )
})

test("Should prefix localized paths with Astro base", async () => {
  vi.stubEnv("BASE_URL", "/docs/")

  const { detailsPagePath, localizePath, searchPagePath } =
    await import("../../src/utils/paths")

  expect(detailsPagePath("en", { id: "my-book" })).toBe(
    "/docs/en/media/my-book",
  )
  expect(searchPagePath("en", { category: "comics" })).toBe(
    "/docs/en/media?category=comics",
  )
  expect(localizePath("en", "/about")).toBe("/docs/en/about")
})

test("Should prefix internal API paths with Astro base", async () => {
  vi.stubEnv("BASE_URL", "/docs/")

  const { pathWithBase } = await import("../../src/utils/paths")

  expect(pathWithBase("/api/internal/search.json")).toBe(
    "/docs/api/internal/search.json",
  )
})

test("Should strip Astro base from pathname", async () => {
  vi.stubEnv("BASE_URL", "/docs/")

  const { pathWithoutBase } = await import("../../src/utils/paths")

  expect(pathWithoutBase("/docs/en/media")).toBe("/en/media")
  expect(pathWithoutBase("/docs")).toBe("/")
})

test("Should leave root-base pathname unchanged", async () => {
  vi.stubEnv("BASE_URL", "/")

  const { pathWithoutBase } = await import("../../src/utils/paths")

  expect(pathWithoutBase("/en/media")).toBe("/en/media")
})

test("Should support explicit base when stripping pathname", async () => {
  const { pathWithoutBase } = await import("../../src/utils/paths")

  expect(pathWithoutBase("/custom/en/media", "/custom/")).toBe("/en/media")
  expect(pathWithoutBase("/en/media", "/custom/")).toBe("/en/media")
})

test("Should preserve root path under Astro base", async () => {
  vi.stubEnv("BASE_URL", "/docs/")

  const { pathWithBase, localizePath } = await import("../../src/utils/paths")

  expect(pathWithBase("/")).toBe("/docs/")
  expect(localizePath(undefined, "/")).toBe("/docs/")
})

test("Should preserve root path at root base", async () => {
  vi.stubEnv("BASE_URL", "/")

  const { pathWithBase, localizePath } = await import("../../src/utils/paths")

  expect(pathWithBase("/")).toBe("/")
  expect(localizePath(undefined, "/")).toBe("/")
})

test("Should preserve query strings and hashes", async () => {
  vi.stubEnv("BASE_URL", "/docs/")

  const { pathWithBase } = await import("../../src/utils/paths")

  expect(pathWithBase("/en/media?category=comics#results")).toBe(
    "/docs/en/media?category=comics#results",
  )
})

test("Should normalize slashes between base and path", async () => {
  vi.stubEnv("BASE_URL", "/docs/")

  const { pathWithBase } = await import("../../src/utils/paths")

  expect(pathWithBase("/en/about")).toBe("/docs/en/about")
  expect(pathWithBase("en/about")).toBe("/docs/en/about")
})
