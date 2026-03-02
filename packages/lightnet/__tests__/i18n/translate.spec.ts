import { expect, test } from "vitest"

import { useTranslate } from "../../src/i18n/translate"
import { loadTranslations } from "../../src/i18n/translations"

test("Should load built-in translations for non-default site locales", () => {
  const t = useTranslate("de")
  expect(t("ln.search.title")).toBe("Suche")
  expect(t("ln.header.select-language")).toBe("Sprache auswählen")
})

test("Should fallback inline translations to default locale", () => {
  const t = useTranslate("de")
  expect(t({ en: "Open" })).toBe("Open")
})

test("Should load user translations from src/translations", async () => {
  const translations = await loadTranslations("de")
  expect(translations["home.all-items"]).toBe("Alle Artikel")
  expect(translations["ln.search.title"]).toBe("Suche")
})

test("Should not load user translations for missing locale file", async () => {
  const translations = await loadTranslations("en")
  expect(translations["home.all-items"]).toBeUndefined()
  expect(translations["ln.search.title"]).toBe("Search")
})
