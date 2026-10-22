import { expect, test, vi } from "vitest"

const importTranslate = async () => import("../../src/i18n/translate")
const importTranslations = async () => import("../../src/i18n/translations")

test("Should record only used keys during build with direct values for every site locale", async () => {
  vi.resetModules()
  vi.stubEnv("PROD", true)
  const recordTranslation = vi.fn()
  vi.doMock("../../src/i18n/record-translation", () => ({ recordTranslation }))
  vi.doMock("../../src/i18n/translations", () => ({
    loadTranslations: vi.fn(async (locale: string) =>
      locale === "en"
        ? {
            "ln.search.title": "Search",
            "ln.powered-by": "Powered by LightNet",
            "custom.used": "Used",
            "custom.unused": "Unused",
          }
        : { "ln.search.title": "Suche" },
    ),
  }))

  try {
    const { useTranslate } = await importTranslate()
    const t = await useTranslate("de")
    expect(recordTranslation).not.toHaveBeenCalled()

    expect(t("ln.search.title")).toBe("Suche")
    expect(t("custom.used")).toBe("Used")
    expect(recordTranslation.mock.calls).toEqual([
      [
        {
          key: "ln.search.title",
          type: "lightnet",
          values: { en: "Search", de: "Suche" },
        },
      ],
      [
        {
          key: "custom.used",
          type: "user",
          values: { en: "Used", de: undefined },
        },
      ],
    ])
  } finally {
    vi.doUnmock("../../src/i18n/record-translation")
    vi.doUnmock("../../src/i18n/translations")
    vi.unstubAllEnvs()
    vi.resetModules()
  }
})

test("Should load built-in translations for non-default site locales", async () => {
  const { useTranslate } = await importTranslate()
  const t = await useTranslate("de")
  expect(t("ln.search.title")).toBe("Suche")
  expect(t("ln.select-language")).toBe("Sprache auswählen")
})

test("Should fail on missing translation key", async () => {
  const { useTranslate } = await importTranslate()
  const t = await useTranslate("de")
  expect(() => t("x.missing-translation")).toThrow(
    "Missing translation: 'x.missing-translation' is undefined for language 'de'.",
  )
})

test("Should not load user translations for missing locale file", async () => {
  const { loadTranslations } = await importTranslations()
  const translations = await loadTranslations("en")
  expect(translations["home.all-items"]).toBeUndefined()
  expect(translations["ln.search.title"]).toBe("Search")
})

test("Should fallback to configured fallback languages for missing keys", async () => {
  vi.resetModules()
  vi.doMock("../../src/i18n/translations", async () => {
    const actual = await vi.importActual<
      typeof import("../../src/i18n/translations")
    >("../../src/i18n/translations")

    return {
      ...actual,
      loadTranslations: vi.fn(async (bcp47: string) => {
        if (bcp47 === "de") {
          return {}
        }
        if (bcp47 === "en") {
          return {
            "x.fallback-only": "Fallback value",
          }
        }
        return {}
      }),
    }
  })

  const { useTranslate } = await importTranslate()
  const t = await useTranslate("de")
  expect(t("x.fallback-only")).toBe("Fallback value")

  vi.doUnmock("../../src/i18n/translations")
  vi.resetModules()
})

test("Should allow translations whose value matches the key", async () => {
  vi.resetModules()
  vi.doMock("../../src/i18n/translations", async () => {
    const actual = await vi.importActual<
      typeof import("../../src/i18n/translations")
    >("../../src/i18n/translations")

    return {
      ...actual,
      loadTranslations: vi.fn(async (bcp47: string) => {
        if (bcp47 === "de") {
          return {
            "ln.search.title": "Suche",
            "x.same-as-value": "x.same-as-value",
          }
        }
        if (bcp47 === "en") {
          return {
            "ln.search.title": "Search",
          }
        }
        return {}
      }),
    }
  })

  const { useTranslate } = await importTranslate()
  const t = await useTranslate("de")
  expect(t("x.same-as-value")).toBe("x.same-as-value")

  vi.doUnmock("../../src/i18n/translations")
  vi.resetModules()
})
