import { expect, test } from "vitest"

import { isAbsoluteUrl, parseUrl } from "../../src/utils/urls"

const absoluteUrls = [
  "https://for.bar/abc",
  "http://foo.bar",
  "www.foo.bar",
  "www.foo.bar/abc",
  "ssh://github.com/foo/bar",
]
const relativeUrls = ["/my-path", "some-path", "/", ""]

absoluteUrls.forEach((url) => {
  test(`should parse "${url}"`, () => {
    expect(parseUrl(url)).not.toBeNull()
  })
})

relativeUrls.forEach((url) => {
  test(`should not parse "${url}"`, () => {
    expect(parseUrl(url)).toBeNull()
  })
})

absoluteUrls.forEach((url) => {
  test(`should assert "${url}" as absolute url`, () => {
    expect(isAbsoluteUrl(url)).toBe(true)
  })
})

relativeUrls.forEach((url) => {
  test(`should not assert "${url}" as absolute url`, () => {
    expect(isAbsoluteUrl(url)).toBe(false)
  })
})
