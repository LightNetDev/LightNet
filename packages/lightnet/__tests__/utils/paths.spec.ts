import { expect, test } from "vitest"

import {
  detailsPagePath,
  ensureTrailingSlash,
  localizePath,
  searchPagePath,
} from "../../src/utils/paths"

test("Should build media detail paths with a trailing slash", () => {
  expect(detailsPagePath("en", { id: "my-book" })).toBe("/en/media/my-book/")
})

test("Should build search paths with a trailing slash before query parameters", () => {
  expect(searchPagePath("en")).toBe("/en/media/")
  expect(searchPagePath("en", { category: "comics" })).toBe(
    "/en/media/?category=comics",
  )
  expect(
    searchPagePath("de", {
      category: "comics",
      language: "en",
      search: "hello world",
      type: "book",
    }),
  ).toBe("/de/media/?category=comics&language=en&search=hello+world&type=book")
})

test("Should localize paths with a trailing slash regardless of the input slashes", () => {
  expect(localizePath("en", "/about")).toBe("/en/about/")
  expect(localizePath("en", "about")).toBe("/en/about/")
  expect(localizePath("en", "/about/")).toBe("/en/about/")
})

test("Should preserve root paths", () => {
  expect(localizePath(undefined, "/")).toBe("/")
  expect(localizePath("en", "/")).toBe("/en/")
})

test("Should add a trailing slash to paths without a locale", () => {
  expect(localizePath(undefined, "/about")).toBe("/about/")
})

test("Should preserve query strings and hashes", () => {
  expect(localizePath("en", "/media?category=comics#results")).toBe(
    "/en/media/?category=comics#results",
  )
})

test("Should not localize absolute urls", () => {
  expect(localizePath("en", "https://foo.bar")).toBe("https://foo.bar")
})

const trailingSlashTests = [
  { path: "", expected: "/" },
  { path: "foo", expected: "/foo/" },
  { path: "/foo/", expected: "/foo/" },
  { path: "/", expected: "/" },
  { path: "foo?query=string", expected: "/foo/?query=string" },
  { path: "foo#hash", expected: "/foo/#hash" },
  { path: "foo?query=string#hash", expected: "/foo/?query=string#hash" },
] as const
trailingSlashTests.forEach(({ path, expected }) =>
  test(`Should resolve trailing slash for '${path}'`, () => {
    expect(ensureTrailingSlash(path)).toBe(expected)
  }),
)
