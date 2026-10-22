import type { AstroIntegration } from "astro"
import { expect, test, vi } from "vitest"

import { lightnet } from "../../src/astro-integration/integration"

const requiredLightnetConfig = {
  title: { en: "LightNet", de: "LightNet" },
  languages: [
    {
      code: "en",
      label: { en: "English" },
      isDefaultSiteLanguage: true,
    },
    {
      code: "de",
      label: { en: "German" },
      isSiteLanguage: true,
    },
  ],
}

const runSetup = ({
  lightnetConfig = {},
  astroSite,
  integrations = [],
  publicDir = new URL("file:///tmp/lightnet/public/"),
}: {
  lightnetConfig?: Record<string, unknown>
  astroSite?: string | URL
  integrations?: AstroIntegration[]
  publicDir?: URL
}) => {
  const integration = lightnet({
    ...requiredLightnetConfig,
    ...lightnetConfig,
  })
  const setupHook = integration.hooks["astro:config:setup"]!
  const updateConfig = vi.fn()
  const injectRoute = vi.fn()

  setupHook({
    injectRoute,
    config: {
      integrations,
      root: new URL("file:///tmp/lightnet"),
      srcDir: new URL("file:///tmp/lightnet/src"),
      publicDir,
      site: astroSite,
    } as never,
    updateConfig,
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    } as never,
    addMiddleware: vi.fn(),
  } as never)

  return { updateConfig, injectRoute }
}

const getThrownError = (run: () => void) => {
  try {
    run()
  } catch (error) {
    return error as Error & { hint?: string }
  }
  throw new Error("Expected function to throw")
}

test("Should use lightnet.site and not inject Astro i18n config", () => {
  const { updateConfig } = runSetup({
    astroSite: "https://lightnet.community",
  })

  expect(updateConfig).toHaveBeenCalledWith({
    integrations: expect.arrayContaining([
      expect.objectContaining({ name: "@lightnet/tailwind" }),
      expect.objectContaining({ name: "@astrojs/react" }),
    ]),
    vite: {
      plugins: expect.any(Array),
    },
  })
  expect(updateConfig.mock.calls[0][0]).not.toHaveProperty("site")
  expect(updateConfig.mock.calls[0][0]).not.toHaveProperty("i18n")
})

test("Should use Astro site when lightnet.site is not set", () => {
  const { updateConfig } = runSetup({
    astroSite: "https://lightnet.community",
  })

  expect(updateConfig).toHaveBeenCalledWith({
    integrations: expect.arrayContaining([
      expect.objectContaining({ name: "@lightnet/tailwind" }),
      expect.objectContaining({ name: "@astrojs/react" }),
    ]),
    vite: {
      plugins: expect.any(Array),
    },
  })
  expect(updateConfig.mock.calls[0][0]).not.toHaveProperty("site")
})

test("Should fail schema validation when no site is set", () => {
  const error = getThrownError(() => runSetup({}))

  expect(error).toMatchObject({
    message: "Invalid LightNet configuration",
    hint: expect.stringContaining("Set `site` in your Astro config"),
  })
})

test("Should automatically register the sitemap integration", () => {
  const { updateConfig } = runSetup({ astroSite: "https://lightnet.community" })

  expect(updateConfig.mock.calls[0][0].integrations).toContainEqual(
    expect.objectContaining({ name: "@astrojs/sitemap" }),
  )
})

test("Should preserve a user-provided sitemap integration", () => {
  const { updateConfig } = runSetup({
    astroSite: "https://lightnet.community",
    integrations: [{ name: "@astrojs/sitemap", hooks: {} }],
  })

  expect(updateConfig.mock.calls[0][0].integrations).not.toContainEqual(
    expect.objectContaining({ name: "@astrojs/sitemap" }),
  )
})
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

test("Should inject a prerendered robots.txt endpoint", () => {
  const { injectRoute } = runSetup({ astroSite: "https://example.com" })

  expect(injectRoute).toHaveBeenCalledWith({
    pattern: "/robots.txt",
    entrypoint: "lightnet/api/robots.ts",
    prerender: true,
  })
})

test("Should skip robots.txt when search indexing is disabled", () => {
  const { injectRoute } = runSetup({
    astroSite: "https://example.com",
    lightnetConfig: { disallowSearchIndexing: true },
  })

  expect(injectRoute).not.toHaveBeenCalledWith(
    expect.objectContaining({ pattern: "/robots.txt" }),
  )
})

test.each(["public", "custom-assets"])(
  "Should preserve robots.txt in %s and skip injection",
  async (directory) => {
    const root = await mkdtemp(join(tmpdir(), "lightnet-robots-"))
    const publicDir = pathToFileURL(`${join(root, directory)}/`)
    const robots = new URL("robots.txt", publicDir)
    const content = "User-agent: *\nDisallow: /private/\n"

    try {
      await mkdir(publicDir)
      await writeFile(robots, content)
      const { injectRoute } = runSetup({
        astroSite: "https://example.com",
        publicDir,
      })

      expect(injectRoute).not.toHaveBeenCalledWith(
        expect.objectContaining({ pattern: "/robots.txt" }),
      )
      expect(await readFile(robots, "utf8")).toBe(content)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  },
)

test.each(["admin", "internal/content-manager"])(
  "Should generate sitemap files with language alternates and exclude admin at %s",
  async (adminPath) => {
    const { updateConfig } = runSetup({
      astroSite: "https://lightnet.community",
      lightnetConfig: {
        languages: [
          ...requiredLightnetConfig.languages,
          { code: "ar", label: { en: "Arabic" } },
        ],
      },
    })
    const integrations = updateConfig.mock.calls[0][0]
      .integrations as AstroIntegration[]
    const sitemap = integrations.find(
      (integration: AstroIntegration) =>
        integration.name === "@astrojs/sitemap",
    ) as AstroIntegration
    const output = await mkdtemp(join(tmpdir(), "lightnet-sitemap-"))
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() }

    try {
      await sitemap.hooks["astro:config:done"]!({
        config: {
          site: "https://lightnet.community",
          base: "/library/",
          trailingSlash: "always",
          build: { format: "directory" },
        },
      } as never)
      for (const integration of integrations) {
        await integration.hooks["astro:routes:resolved"]?.({
          routes: [
            {
              entrypoint: "../../packages/sveltia-admin/src/Admin.astro",
              patternRegex: new RegExp(`^/library/${adminPath}/?$`),
              type: "page",
              pathname: `/${adminPath}`,
              generate: () => `/${adminPath}`,
            },
          ],
        } as never)
      }
      await sitemap.hooks["astro:build:done"]!({
        dir: pathToFileURL(`${output}/`),
        pages: [
          { pathname: "en/media/" },
          { pathname: "de/media/" },
          { pathname: "en/media/example/" },
          { pathname: "de/media/example/" },
          { pathname: "404/" },
          { pathname: adminPath },
          { pathname: `${adminPath}/` },
          { pathname: `${adminPath}-guide/` },
        ],
        logger,
      } as never)

      const index = await readFile(join(output, "sitemap-index.xml"), "utf8")
      const xml = await readFile(join(output, "sitemap-0.xml"), "utf8")
      expect(index).toContain(
        "https://lightnet.community/library/sitemap-0.xml",
      )
      expect(xml).toContain(
        "<loc>https://lightnet.community/library/en/media/example/</loc>",
      )
      expect(xml).toContain(
        'hreflang="de" href="https://lightnet.community/library/de/media/example/"',
      )
      expect(xml).toContain('hreflang="en"')
      expect(xml).not.toContain('hreflang="ar"')
      expect(xml).not.toContain("404")
      expect(xml).not.toContain(
        `<loc>https://lightnet.community/library/${adminPath}</loc>`,
      )
      expect(xml).not.toContain(
        `<loc>https://lightnet.community/library/${adminPath}/</loc>`,
      )
      expect(xml).toContain(
        `<loc>https://lightnet.community/library/${adminPath}-guide/</loc>`,
      )
      expect(logger.warn).not.toHaveBeenCalled()
      expect(logger.error).not.toHaveBeenCalled()
    } finally {
      await rm(output, { recursive: true, force: true })
    }
  },
)
