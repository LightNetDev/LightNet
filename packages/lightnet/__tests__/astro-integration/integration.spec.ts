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
}: {
  lightnetConfig?: Record<string, unknown>
  astroSite?: string | URL
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
      integrations: [],
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

test("Should include path when inline translation misses default locale", () => {
  const error = getThrownError(() =>
    runSetup({
      lightnetConfig: {
        title: { de: "LightNet" },
      },
      astroSite: "https://lightnet.community",
    }),
  )

  expect(error).toMatchObject({
    message: "Invalid LightNet configuration",
    hint: expect.stringContaining(
      'title.en: Missing translation for default locale "en"',
    ),
  })
})
