import { expect, test } from "vitest"

const importTranslate = async () => import("../../src/i18n/translate")
const importTranslations = async () => import("../../src/i18n/translations")

test("Should load built-in translations for non-default site locales", async () => {
  const { useTranslate } = await importTranslate()
  const t = useTranslate("de")
  expect(t("ln.search.title")).toBe("Suche")
  expect(t("ln.header.select-language")).toBe("Sprache auswählen")
})

test("Should fallback inline translations to default locale", async () => {
  const { useTranslate } = await importTranslate()
  const t = useTranslate("de")
  expect(t({ en: "Open" })).toBe("Open")
})

test("Should not load user translations for missing locale file", async () => {
  const { loadTranslations } = await importTranslations()
  const translations = await loadTranslations("en")
  expect(translations["home.all-items"]).toBeUndefined()
  expect(translations["ln.search.title"]).toBe("Search")
})
