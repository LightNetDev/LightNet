import type { APIContext } from "astro"
import { afterEach, expect, test, vi } from "vitest"

import { GET } from "../../src/api/robots"

afterEach(() => vi.unstubAllEnvs())

test.each([
  [
    "https://example.com/ignored/",
    "/library/",
    "https://example.com/library/sitemap-index.xml",
  ],
  [
    "https://example.com",
    "/library",
    "https://example.com/library/sitemap-index.xml",
  ],
])(
  "Should generate robots.txt for site %s and base %s",
  async (site, base, sitemap) => {
    vi.stubEnv("BASE_URL", base)
    const response = await GET({ site: new URL(site) } as APIContext)

    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    )
    expect(await response.text()).toBe(
      `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`,
    )
  },
)
