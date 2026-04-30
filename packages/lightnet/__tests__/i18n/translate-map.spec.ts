import { expect, test } from "vitest"

import { useTranslateMap } from "../../src/i18n/translate-map"
import { setTranslationProvenance } from "../../src/i18n/translation-provenance"

const tMap = useTranslateMap("de")

test("Should resolve the localized value for the current locale", () => {
  expect(tMap({ en: "Hello", de: "Hallo" }, { path: ["title"] })).toBe("Hallo")
})

test("Should fallback to default locale when current locale is missing", () => {
  expect(tMap({ en: "Hello" }, { path: ["title"] })).toBe("Hello")
})

test("Should include the context path in missing translation errors", () => {
  expect(() =>
    tMap({ fr: "Bonjour" }, { path: ["content", 0, "label"] }),
  ).toThrow('Missing translation map value for "content.0.label"')
})

test("Should prefer provenance over legacy path context", () => {
  const translationMap = setTranslationProvenance(
    { fr: "Bonjour" },
    {
      sourceFile: "src/content/categories/children.json",
      objectPath: ["label"],
    },
  )

  expect(() => tMap(translationMap, { path: ["content", 0, "label"] })).toThrow(
    'Missing translation map value for "label"',
  )
})
