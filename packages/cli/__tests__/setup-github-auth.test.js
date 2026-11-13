import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { parse } from "jsonc-parser"
import { describe, expect, test, vi } from "vitest"

import {
  createManifest,
  exchangeManifestCode,
  findRepoOwner,
  findSiteUrl,
  getRegistrationUrl,
  setupGithubAuth,
  siteWorkerPath,
  toSiteOrigin,
  updateWranglerConfig,
  waitForManifestCode,
} from "../src/setup-github-auth.js"

const siteWranglerConfig = `{
  // My site
  "name": "my-site",
  "compatibility_date": "2026-01-15",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  },
  "routes": [
    {
      "pattern": "my-library.org",
      "custom_domain": true
    }
  ]
}
`

const astroConfig = `export default defineConfig({
  site: "https://my-library.org/",
  integrations: [
    lightnetSveltiaAdmin({
      backend: { name: "github", repo: "my-org/my-site" },
    }),
  ],
})
`

describe("updateWranglerConfig", () => {
  test("adds the site worker, auth routes, and client ID and keeps comments", () => {
    const { text, warnings } = updateWranglerConfig(
      siteWranglerConfig,
      "Iv23client",
    )
    expect(warnings).toEqual([])
    expect(text).toContain("// My site")
    expect(parse(text)).toMatchObject({
      main: siteWorkerPath,
      assets: {
        directory: "./dist",
        binding: "ASSETS",
        run_worker_first: ["/_auth/*"],
      },
      vars: { GITHUB_CLIENT_ID: "Iv23client" },
      routes: [{ pattern: "my-library.org" }],
    })
  })

  test("is idempotent and replaces the client ID", () => {
    const first = updateWranglerConfig(siteWranglerConfig, "Iv23old").text
    const second = updateWranglerConfig(first, "Iv23new").text
    expect(parse(second)).toMatchObject({
      assets: { run_worker_first: ["/_auth/*"] },
      vars: { GITHUB_CLIENT_ID: "Iv23new" },
    })
    expect(second).not.toContain("Iv23old")
  })

  test("keeps existing vars and run_worker_first patterns", () => {
    const config = `{
      "assets": { "directory": "./dist", "run_worker_first": ["/api/*"] },
      "vars": { "OTHER": "value" },
    }`
    expect(parse(updateWranglerConfig(config, "id").text)).toMatchObject({
      assets: { run_worker_first: ["/api/*", "/_auth/*"] },
      vars: { OTHER: "value", GITHUB_CLIENT_ID: "id" },
    })
  })

  test("keeps run_worker_first: true", () => {
    const config = `{ "assets": { "directory": "./dist", "run_worker_first": true } }`
    expect(
      parse(updateWranglerConfig(config, "id").text).assets.run_worker_first,
    ).toBe(true)
  })

  test("warns about a custom main script and assets binding", () => {
    const config = `{ "main": "src/worker.ts", "assets": { "directory": "./dist", "binding": "STATIC" } }`
    const { text, warnings } = updateWranglerConfig(config, "id")
    expect(parse(text)).toMatchObject({
      main: "src/worker.ts",
      assets: { binding: "STATIC" },
    })
    expect(warnings).toEqual([
      expect.stringContaining("routeRequest"),
      expect.stringContaining("ASSETS"),
    ])
  })

  test.each([
    ["{ invalid", "Could not parse"],
    ['{ "name": "site" }', "assets.directory"],
  ])("rejects %s", (config, message) => {
    expect(() => updateWranglerConfig(config, "id")).toThrow(message)
  })
})

describe("manifest", () => {
  test("registers the site's /_auth callback with minimal permissions", () => {
    expect(
      createManifest({
        name: "my-library.org CMS",
        siteOrigin: "https://my-library.org",
        redirectUrl: "http://127.0.0.1:1234/callback",
      }),
    ).toMatchObject({
      url: "https://my-library.org",
      redirect_url: "http://127.0.0.1:1234/callback",
      callback_urls: ["https://my-library.org/_auth/callback"],
      public: false,
      request_oauth_on_install: false,
      hook_attributes: { active: false },
      default_permissions: { contents: "write", metadata: "read" },
    })
  })

  test.each([
    ["my-org", "https://github.com/organizations/my-org/settings/apps/new"],
    ["", "https://github.com/settings/apps/new"],
  ])("registers the app for owner %j at %s", (org, url) => {
    expect(getRegistrationUrl({ org, state: "abc" })).toBe(`${url}?state=abc`)
  })
})

describe("astro config", () => {
  test("finds the site URL and repository owner", () => {
    expect(findSiteUrl(astroConfig)).toBe("https://my-library.org/")
    expect(findRepoOwner(astroConfig)).toBe("my-org")
    expect(findSiteUrl(undefined)).toBeUndefined()
    expect(findRepoOwner("")).toBeUndefined()
  })

  test("uses the site origin and requires HTTPS", () => {
    expect(toSiteOrigin("https://my-library.org/library/")).toBe(
      "https://my-library.org",
    )
    expect(() => toSiteOrigin("http://my-library.org")).toThrow("HTTPS")
    expect(() => toSiteOrigin("my-library")).toThrow("not a valid URL")
  })
})

describe("waitForManifestCode", () => {
  test("posts the manifest to GitHub and accepts only the matching state", async () => {
    const code = await waitForManifestCode({
      state: "expected-state",
      registrationUrl: "https://github.com/settings/apps/new?state=s",
      createManifest: (redirectUrl) => ({
        name: "app",
        redirect_url: redirectUrl,
      }),
      onReady: async (url) => {
        const page = await (await fetch(url)).text()
        expect(page).toContain(
          'action="https://github.com/settings/apps/new?state=s"',
        )
        expect(page).toContain(
          `&quot;redirect_url&quot;:&quot;${url}callback&quot;`,
        )
        expect(
          (await fetch(`${url}callback?code=bad&state=wrong`)).status,
        ).toBe(404)
        expect(
          (await fetch(`${url}callback?code=good&state=expected-state`)).status,
        ).toBe(200)
      },
    })
    expect(code).toBe("good")
  })

  test("times out", async () => {
    await expect(
      waitForManifestCode({
        state: "s",
        registrationUrl: "https://github.com/settings/apps/new",
        createManifest: () => ({}),
        onReady: () => {},
        timeoutMs: 10,
      }),
    ).rejects.toThrow("Timed out")
  })
})

describe("exchangeManifestCode", () => {
  test("returns the app credentials", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json(
        {
          client_id: "Iv23client",
          client_secret: "secret",
          slug: "my-app",
          html_url: "https://github.com/apps/my-app",
        },
        { status: 201 },
      ),
    )
    await expect(
      exchangeManifestCode("code", fetchMock),
    ).resolves.toMatchObject({
      client_id: "Iv23client",
      client_secret: "secret",
    })
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/app-manifests/code/conversions",
      expect.objectContaining({ method: "POST" }),
    )
  })

  test("rejects failed conversions", async () => {
    const fetchMock = vi.fn(async () => new Response("", { status: 422 }))
    await expect(exchangeManifestCode("code", fetchMock)).rejects.toThrow(
      "HTTP 422",
    )
  })
})

describe("setupGithubAuth", () => {
  test("creates the app and configures the site", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "lightnet-setup-github-auth-"))
    try {
      await writeFile(join(cwd, "wrangler.jsonc"), siteWranglerConfig)
      await writeFile(join(cwd, "astro.config.mjs"), astroConfig)
      await writeFile(
        join(cwd, "package.json"),
        JSON.stringify({
          dependencies: { "@lightnet/sveltia-github-auth": "^1.4.0" },
        }),
      )
      const openedUrls = []
      const storeSecret = vi.fn(async () => true)
      const fetchMock = vi.fn(async () =>
        Response.json(
          {
            client_id: "Iv23client",
            client_secret: "secret",
            slug: "my-app",
            html_url: "https://github.com/apps/my-app",
          },
          { status: 201 },
        ),
      )

      await setupGithubAuth(
        {},
        {
          cwd,
          isInteractive: true,
          fetch: fetchMock,
          promptText: async ({ initialValue }) => initialValue ?? "",
          promptConfirm: async () => true,
          storeSecret,
          // Plays GitHub: reads the form and redirects back with a code.
          openUrl: async (url) => {
            openedUrls.push(url)
            if (!url.startsWith("http://127.0.0.1")) return
            const page = await (await fetch(url)).text()
            const action = page.match(/action="([^"]+)"/)[1]
            const state = new URL(
              action.replaceAll("&amp;", "&"),
            ).searchParams.get("state")
            await fetch(`${url}callback?code=code&state=${state}`)
          },
        },
      )

      expect(openedUrls[0]).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/$/)
      expect(openedUrls[1]).toBe(
        "https://github.com/apps/my-app/installations/new",
      )
      expect(storeSecret).toHaveBeenCalledWith("secret", cwd)
      const config = parse(await readFile(join(cwd, "wrangler.jsonc"), "utf8"))
      expect(config).toMatchObject({
        main: siteWorkerPath,
        vars: { GITHUB_CLIENT_ID: "Iv23client" },
      })
    } finally {
      await rm(cwd, { force: true, recursive: true })
    }
  })

  test("requires --site without a site URL when not interactive", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "lightnet-setup-github-auth-"))
    try {
      await writeFile(join(cwd, "wrangler.jsonc"), siteWranglerConfig)
      await expect(
        setupGithubAuth({}, { cwd, isInteractive: false }),
      ).rejects.toThrow("Pass --site")
    } finally {
      await rm(cwd, { force: true, recursive: true })
    }
  })
})
