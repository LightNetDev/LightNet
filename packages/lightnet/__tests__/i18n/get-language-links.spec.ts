import { afterEach, expect, test, vi } from "vitest"

vi.mock("../../src/i18n/resolve-language", () => ({
  resolveTranslatedLanguage: (locale: string) => ({
    labelText: locale === "de" ? "Deutsch" : "English",
  }),
}))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

test("Should build localized links from a localized pathname", async () => {
  vi.stubEnv("BASE_URL", "/docs/")

  const { getLanguageLinks } = await import("../../src/i18n/get-language-links")

  const result = getLanguageLinks({
    currentLocale: "de",
    locales: ["en", "de"],
    pathname: "/docs/de/media/how-to",
    tConfigField: vi.fn() as never,
  })

  expect(result.currentPath).toBe("/de/media/how-to")
  expect(result.hasLocale).toBe(true)
  expect(result.links).toEqual([
    {
      locale: "de",
      label: "Deutsch",
      active: true,
      href: "/docs/de/media/how-to",
    },
    {
      locale: "en",
      label: "English",
      active: false,
      href: "/docs/en/media/how-to",
    },
  ])
})

test("Should build localized links from an unlocalized pathname", async () => {
  vi.stubEnv("BASE_URL", "/docs/")

  const { getLanguageLinks } = await import("../../src/i18n/get-language-links")

  const result = getLanguageLinks({
    currentLocale: "de",
    locales: ["en", "de"],
    pathname: "/docs/media/how-to",
    tConfigField: vi.fn() as never,
  })

  expect(result.currentPath).toBe("/media/how-to")
  expect(result.hasLocale).toBe(false)
  expect(result.links).toEqual([
    {
      locale: "de",
      label: "Deutsch",
      active: true,
      href: "/docs/de/media/how-to",
    },
    {
      locale: "en",
      label: "English",
      active: false,
      href: "/docs/en/media/how-to",
    },
  ])
})
