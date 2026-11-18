import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { parse } from "jsonc-parser"
import { describe, expect, test, vi } from "vitest"

import {
  createManifest,
  exchangeManifestCode,
  findRepo,
  findSiteUrl,
  getAppSettingsUrl,
  getDefaultAppName,
  getInstallationUrl,
  getRegistrationUrl,
  lookupOwnerType,
  lookupRepoId,
  parseGithubRemote,
  setupGithubAuth,
  siteWorkerPath,
  toSiteOrigin,
  updateWranglerConfig,
  validateAppName,
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

  test("links to the app settings of the owner", () => {
    expect(getAppSettingsUrl({ slug: "my-app" }, "my-org")).toBe(
      "https://github.com/organizations/my-org/settings/apps/my-app",
    )
    expect(getAppSettingsUrl({ slug: "my-app" }, undefined)).toBe(
      "https://github.com/settings/apps/my-app",
    )
  })

  test("preselects the owner and repository for the installation", () => {
    expect(getInstallationUrl({ slug: "my-app", ownerId: 1, repoId: 2 })).toBe(
      "https://github.com/apps/my-app/installations/new/permissions?target_id=1&repository_ids%5B%5D=2",
    )
    expect(getInstallationUrl({ slug: "my-app", ownerId: 1 })).toBe(
      "https://github.com/apps/my-app/installations/new/permissions?target_id=1",
    )
    expect(getInstallationUrl({ slug: "my-app" })).toBe(
      "https://github.com/apps/my-app/installations/new",
    )
  })

  test("names the app after the site and limits the length", () => {
    expect(getDefaultAppName("https://my-library.org")).toBe(
      "my-library.org Authentication",
    )
    expect(validateAppName("my-library.org Authentication")).toBeUndefined()
    expect(validateAppName(" ")).toContain("Enter a name")
    expect(validateAppName("x".repeat(35))).toContain("at most 34")
  })
})

describe("astro config", () => {
  test("finds the site URL and repository", () => {
    expect(findSiteUrl(astroConfig)).toBe("https://my-library.org/")
    expect(findRepo(astroConfig)).toBe("my-org/my-site")
    expect(findSiteUrl(undefined)).toBeUndefined()
    expect(findRepo("")).toBeUndefined()
  })

  test.each([
    "git@github.com:my-org/my-site.git",
    "ssh://git@github.com/my-org/my-site.git",
    "https://github.com/my-org/my-site.git",
    "https://github.com/my-org/my-site\n",
    "https://token@github.com/my-org/my-site/",
  ])("reads the repository from the Git remote %j", (remoteUrl) => {
    expect(parseGithubRemote(remoteUrl)).toEqual({
      owner: "my-org",
      name: "my-site",
    })
  })

  test("rejects Git remotes that are not on GitHub", () => {
    expect(() =>
      parseGithubRemote("git@gitlab.com:my-org/my-site.git"),
    ).toThrow("not a GitHub repository")
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

describe("GitHub lookups", () => {
  test("returns the owner type and public repository ID", async () => {
    const fetchMock = vi.fn(async (url) =>
      url.endsWith("/users/my-org")
        ? Response.json({ type: "Organization" })
        : Response.json({ id: 42 }),
    )
    await expect(lookupOwnerType("my-org", fetchMock)).resolves.toBe(
      "Organization",
    )
    await expect(
      lookupRepoId({ owner: "my-org", name: "my-site" }, fetchMock),
    ).resolves.toBe(42)
  })

  test("returns undefined for private repositories and network errors", async () => {
    const notFound = vi.fn(async () => new Response("", { status: 404 }))
    const offline = vi.fn(async () => {
      throw new TypeError("fetch failed")
    })
    await expect(
      lookupRepoId({ owner: "my-org", name: "my-site" }, notFound),
    ).resolves.toBeUndefined()
    await expect(lookupOwnerType("my-org", offline)).resolves.toBeUndefined()
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
  /**
   * Plays GitHub: answers API requests and, when the local registration page
   * is opened, reads the form and redirects back with a code.
   */
  function createGithubMock() {
    const fetchMock = vi.fn(async (url) => {
      if (url.endsWith("/users/my-org")) {
        return Response.json({ type: "Organization" })
      }
      if (url.endsWith("/repos/my-org/my-site")) {
        return Response.json({ id: 42 })
      }
      return Response.json(
        {
          client_id: "Iv23client",
          client_secret: "secret",
          slug: "my-app",
          html_url: "https://github.com/apps/my-app",
          owner: { login: "my-org", id: 7, type: "Organization" },
        },
        { status: 201 },
      )
    })
    const openedUrls = []
    const openUrl = async (url) => {
      openedUrls.push(url)
      if (!url.startsWith("http://127.0.0.1")) return
      const page = await (await fetch(url)).text()
      const action = page.match(/action="([^"]+)"/)[1]
      const state = new URL(action.replaceAll("&amp;", "&")).searchParams.get(
        "state",
      )
      await fetch(`${url}callback?code=code&state=${state}`)
    }
    return { fetchMock, openUrl, openedUrls }
  }

  async function createSite(dependencies = {}, astro = astroConfig) {
    const cwd = await mkdtemp(join(tmpdir(), "lightnet-setup-github-auth-"))
    await writeFile(join(cwd, "wrangler.jsonc"), siteWranglerConfig)
    await writeFile(join(cwd, "astro.config.mjs"), astro)
    await writeFile(join(cwd, "package.json"), JSON.stringify({ dependencies }))
    return cwd
  }

  test("creates the app and configures the site", async () => {
    const cwd = await createSite()
    try {
      const { fetchMock, openUrl, openedUrls } = createGithubMock()
      const prompts = []
      const addPackage = vi.fn(async () => true)

      await setupGithubAuth({
        cwd,
        isInteractive: true,
        fetch: fetchMock,
        openUrl,
        addPackage,
        readGitRemote: async () => "git@github.com:my-org/my-site.git\n",
        promptText: async ({ message, initialValue }) => {
          prompts.push(message)
          return initialValue ?? ""
        },
        promptConfirm: async (message) => {
          prompts.push(message)
          return true
        },
      })

      expect(openedUrls).toEqual([
        expect.stringMatching(/^http:\/\/127\.0\.0\.1:\d+\/$/),
        "https://github.com/apps/my-app/installations/new/permissions?target_id=7&repository_ids%5B%5D=42",
      ])
      // Every browser opening is confirmed by the user first.
      expect(
        prompts.filter((message) => message.includes("Open GitHub")),
      ).toHaveLength(2)
      // The secret can only be added after the Worker is deployed with a script.
      expect(prompts).toEqual([
        "What should the GitHub App be called?",
        "Open GitHub in your browser now?",
        "Open GitHub in your browser now?",
        "Has Cloudflare deployed your site?",
        "Have you added GITHUB_CLIENT_SECRET to your Worker in Cloudflare?",
      ])
      expect(addPackage).toHaveBeenCalledWith(
        "@lightnet/sveltia-github-auth",
        cwd,
      )
      const config = parse(await readFile(join(cwd, "wrangler.jsonc"), "utf8"))
      expect(config).toMatchObject({
        main: siteWorkerPath,
        vars: { GITHUB_CLIENT_ID: "Iv23client" },
      })
    } finally {
      await rm(cwd, { force: true, recursive: true })
    }
  })

  test("opens only the pages the user agrees to", async () => {
    const cwd = await createSite({ "@lightnet/sveltia-github-auth": "^1.4.0" })
    try {
      const { fetchMock, openUrl, openedUrls } = createGithubMock()
      const addPackage = vi.fn(async () => true)
      let browserPrompts = 0
      await setupGithubAuth({
        cwd,
        isInteractive: true,
        fetch: fetchMock,
        openUrl,
        addPackage,
        readGitRemote: async () => "git@github.com:my-org/my-site.git\n",
        promptText: async ({ initialValue }) => initialValue ?? "",
        // Agrees to create the app, but declines the later pages.
        promptConfirm: async (message) =>
          !message.includes("Open GitHub") || browserPrompts++ === 0,
      })
      expect(openedUrls).toEqual([
        expect.stringMatching(/^http:\/\/127\.0\.0\.1:\d+\/$/),
      ])
      expect(addPackage).not.toHaveBeenCalled()
    } finally {
      await rm(cwd, { force: true, recursive: true })
    }
  })

  test("requires the site option in the Astro config", async () => {
    const cwd = await createSite({}, "export default defineConfig({})")
    try {
      await expect(
        setupGithubAuth({ cwd, isInteractive: true }),
      ).rejects.toThrow('Set "site" in your Astro config')
    } finally {
      await rm(cwd, { force: true, recursive: true })
    }
  })

  test("requires a Git remote", async () => {
    const cwd = await createSite()
    try {
      await expect(
        setupGithubAuth({
          cwd,
          isInteractive: true,
          readGitRemote: async () => {
            throw new Error("No such remote 'origin'")
          },
        }),
      ).rejects.toThrow('Git remote "origin"')
    } finally {
      await rm(cwd, { force: true, recursive: true })
    }
  })

  test("requires an interactive terminal", async () => {
    await expect(setupGithubAuth({ isInteractive: false })).rejects.toThrow(
      "interactive terminal",
    )
  })
})
