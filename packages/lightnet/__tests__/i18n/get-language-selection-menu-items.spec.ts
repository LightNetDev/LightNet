import { afterEach, expect, test, vi } from "vitest"

vi.mock("../../src/i18n/resolve-language", () => ({
  resolveLanguage: (locale: string) => ({
    label:
      locale === "de"
        ? { en: "German", de: "Deutsch" }
        : { en: "English", de: "Englisch" },
  }),
}))

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

test("Should build localized links from a localized pathname", async () => {
  vi.stubEnv("BASE_URL", "/docs/")

  const { getLanguageSelectionMenuItems } =
    await import("../../src/layouts/components/get-language-selection-menu-items")

  const result = getLanguageSelectionMenuItems({
    currentLocale: "de",
    pathname: "/docs/de/media/how-to",
    tConfigField: ((translationMap: Record<string, string>) =>
      translationMap.de ?? translationMap.en) as never,
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
      label: "Englisch",
      active: false,
      href: "/docs/en/media/how-to",
    },
  ])
})

test("Should build localized links from an unlocalized pathname", async () => {
  vi.stubEnv("BASE_URL", "/docs/")

  const { getLanguageSelectionMenuItems } =
    await import("../../src/layouts/components/get-language-selection-menu-items")

  const result = getLanguageSelectionMenuItems({
    currentLocale: "de",
    pathname: "/docs/media/how-to",
    tConfigField: ((translationMap: Record<string, string>) =>
      translationMap.de ?? translationMap.en) as never,
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
      label: "Englisch",
      active: false,
      href: "/docs/en/media/how-to",
    },
  ])
})
