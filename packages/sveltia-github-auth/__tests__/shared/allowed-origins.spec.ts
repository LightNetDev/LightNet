import { describe, expect, it } from "vitest"

import {
  getAllowedOrigins,
  hasConfiguredAllowedOrigins,
  isAllowedSiteId,
} from "../../src/shared/allowed-origins"

describe("getAllowedOrigins", () => {
  it("defaults bare hostnames to HTTPS in mixed lists and preserves ports", () => {
    expect(
      getAllowedOrigins(
        " cms.example.org, admin.example.org:8443, https://other.example.org ",
      ),
    ).toEqual([
      "https://cms.example.org",
      "https://admin.example.org:8443",
      "https://other.example.org",
    ])
  })

  it("trims entries, ignores empty entries, and preserves explicit ports", () => {
    expect(
      getAllowedOrigins(
        " , https://cms.example.org, ,https://admin.example.org:8443, ",
      ),
    ).toEqual(["https://cms.example.org", "https://admin.example.org:8443"])
  })

  it.each([undefined, "", " , , "])("returns no origins for %j", (value) => {
    expect(getAllowedOrigins(value)).toEqual([])
  })

  it.each([
    "not a URL",
    "http://cms.example.org",
    "https://cms.example.org/",
    "https://cms.example.org/admin",
    "https://cms.example.org?query=1",
    "https://cms.example.org#fragment",
    "https://user:password@cms.example.org",
    "https://CMS.example.org",
    "https://cms.example.org:443",
    "ftp://cms.example.org",
    "//cms.example.org",
    "cms.example.org/",
    "cms.example.org/admin",
    "cms.example.org?query=1",
    "cms.example.org#fragment",
    "user:password@cms.example.org",
    "https://*.example.org",
    "*.example.org",
    "https:cms.example.org",
    "http:cms.example.org",
  ])("rejects the entire list when it includes %s", (invalidOrigin) => {
    expect(
      getAllowedOrigins(`https://valid.example.org,${invalidOrigin}`),
    ).toEqual([])
  })
})

describe("hasConfiguredAllowedOrigins", () => {
  it("accepts a valid origin list", () => {
    expect(hasConfiguredAllowedOrigins("https://cms.example.org")).toBe(true)
    expect(hasConfiguredAllowedOrigins("cms.example.org")).toBe(true)
  })

  it.each([
    undefined,
    "",
    "not a URL",
    "https://example.com",
    "example.com",
    "cms.example.org,example.com",
    "https://cms.example.org, https://example.com",
  ])("rejects empty, invalid, or placeholder configuration %j", (value) => {
    expect(hasConfiguredAllowedOrigins(value)).toBe(false)
  })
})

describe("isAllowedSiteId", () => {
  const origins = "https://cms.example.org,https://admin.example.org:8443"

  it("matches hostnames configured without a protocol", () => {
    expect(isAllowedSiteId("cms.example.org", "cms.example.org")).toBe(true)
    expect(isAllowedSiteId("admin.example.org", "admin.example.org:8443")).toBe(
      true,
    )
  })

  it.each(["cms.example.org", "admin.example.org"])(
    "matches configured hostname %s",
    (siteId) => {
      expect(isAllowedSiteId(siteId, origins)).toBe(true)
    },
  )

  it.each([
    undefined,
    "",
    "example.org",
    "sub.cms.example.org",
    "cms.example.org.evil.org",
    "CMS.example.org",
    "https://cms.example.org",
    "admin.example.org:8443",
  ])("rejects a site ID that is not an exact hostname: %j", (siteId) => {
    expect(isAllowedSiteId(siteId, origins)).toBe(false)
  })

  it("rejects a matching hostname when another configured origin is invalid", () => {
    expect(
      isAllowedSiteId("cms.example.org", `${origins},http://evil.org`),
    ).toBe(false)
  })

  it("rejects a site ID when origins are absent", () => {
    expect(isAllowedSiteId("cms.example.org")).toBe(false)
  })

  it("does not expand wildcard hostnames to allow subdomains", () => {
    expect(isAllowedSiteId("cms.example.org", "https://*.example.org")).toBe(
      false,
    )
  })
})
