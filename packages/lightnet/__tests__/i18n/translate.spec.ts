import { expect, test } from "vitest"

import { useTranslate } from "../../src/i18n/translate"

test("Should load built-in translations for non-default site locales", () => {
  const t = useTranslate("de")
  expect(t("ln.search.title")).toBe("Suche")
  expect(t("ln.header.select-language")).toBe("Sprache auswählen")
})
