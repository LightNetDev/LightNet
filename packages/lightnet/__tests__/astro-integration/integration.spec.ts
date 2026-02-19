import { expect, test, vi } from "vitest"

import { lightnet } from "../../src/astro-integration/integration"

test("Should not inject Astro i18n config", () => {
  const integration = lightnet({
    siteUrl: "https://lightnet.community",
    title: { en: "LightNet" },
    languages: {
      en: {
        label: { en: "English" },
        isDefaultSiteLanguage: true,
      },
      de: {
        label: { en: "German" },
        isSiteLanguage: true,
      },
    },
  })

  const setupHook = integration.hooks["astro:config:setup"]!
  const updateConfig = vi.fn()

  setupHook({
    injectRoute: vi.fn(),
    config: {
      integrations: [],
      root: new URL("file:///tmp/lightnet"),
      srcDir: new URL("file:///tmp/lightnet/src"),
      site: undefined,
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

  expect(updateConfig).toHaveBeenCalledWith({
    site: "https://lightnet.community",
    vite: {
      plugins: expect.any(Array),
    },
  })
  expect(updateConfig.mock.calls[0][0]).not.toHaveProperty("i18n")
})
