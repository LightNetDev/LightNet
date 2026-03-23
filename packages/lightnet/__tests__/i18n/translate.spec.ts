import { expect, test, vi } from "vitest"

const importTranslate = async () => import("../../src/i18n/translate")
const importTranslations = async () => import("../../src/i18n/translations")

test("Should load built-in translations for non-default site locales", async () => {
  const { useTranslate } = await importTranslate()
  const t = await useTranslate("de")
  expect(t("ln.search.title")).toBe("Suche")
  expect(t("ln.header.select-language")).toBe("Sprache auswählen")
})

test("Should fallback inline translations to default locale", async () => {
  const { useTranslate } = await importTranslate()
  const t = await useTranslate("de")
  expect(t({ en: "Open" })).toBe("Open")
})

test("Should fail on missing translation key", async () => {
  const { useTranslate } = await importTranslate()
  const t = await useTranslate("de")
  expect(() => t("x.missing-translation")).toThrowError(
    "Missing translation: 'x.missing-translation' is undefined for language 'de'.",
  )
})

test("Should not load user translations for missing locale file", async () => {
  const { loadTranslations } = await importTranslations()
  const translations = await loadTranslations("en")
  expect(translations["home.all-items"]).toBeUndefined()
  expect(translations["ln.search.title"]).toBe("Search")
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
