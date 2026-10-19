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
}: {
  lightnetConfig?: Record<string, unknown>
  astroSite?: string | URL
  integrations?: AstroIntegration[]
}) => {
  const integration = lightnet({
    ...requiredLightnetConfig,
    ...lightnetConfig,
  })
  const setupHook = integration.hooks["astro:config:setup"]!
  const updateConfig = vi.fn()

  setupHook({
    injectRoute: vi.fn(),
    config: {
      integrations,
      root: new URL("file:///tmp/lightnet"),
      srcDir: new URL("file:///tmp/lightnet/src"),
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

  return { updateConfig }
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
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

test("Should generate sitemap files with site language alternates and a base path", async () => {
  const { updateConfig } = runSetup({
    astroSite: "https://lightnet.community",
    lightnetConfig: {
      languages: [
        ...requiredLightnetConfig.languages,
        { code: "ar", label: { en: "Arabic" } },
      ],
    },
  })
  const sitemap = updateConfig.mock.calls[0][0].integrations.find(
    (integration: AstroIntegration) => integration.name === "@astrojs/sitemap",
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
    await sitemap.hooks["astro:routes:resolved"]!({ routes: [] } as never)
    await sitemap.hooks["astro:build:done"]!({
      dir: pathToFileURL(`${output}/`),
      pages: [
        { pathname: "en/media/" },
        { pathname: "de/media/" },
        { pathname: "en/media/example/" },
        { pathname: "de/media/example/" },
        { pathname: "404/" },
      ],
      logger,
    } as never)

    const index = await readFile(join(output, "sitemap-index.xml"), "utf8")
    const xml = await readFile(join(output, "sitemap-0.xml"), "utf8")
    expect(index).toContain("https://lightnet.community/library/sitemap-0.xml")
    expect(xml).toContain(
      "<loc>https://lightnet.community/library/en/media/example/</loc>",
    )
    expect(xml).toContain(
      'hreflang="de" href="https://lightnet.community/library/de/media/example/"',
    )
    expect(xml).toContain('hreflang="en"')
    expect(xml).not.toContain('hreflang="ar"')
    expect(xml).not.toContain("404")
    expect(logger.warn).not.toHaveBeenCalled()
    expect(logger.error).not.toHaveBeenCalled()
  } finally {
    await rm(output, { recursive: true, force: true })
  }
})
