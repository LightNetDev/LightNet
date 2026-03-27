import { expect, test } from "vitest"

import { useInlineTranslate } from "../../src/i18n/inline-translation"

const tInline = useInlineTranslate("de")

test("Should resolve the localized value for the current locale", () => {
  expect(tInline({ en: "Hello", de: "Hallo" }, { path: ["title"] })).toBe(
    "Hallo",
  )
})

test("Should fallback to default locale when current locale is missing", () => {
  expect(tInline({ en: "Hello" }, { path: ["title"] })).toBe("Hello")
})

test("Should include the context path in missing translation errors", () => {
  expect(() =>
    tInline({ fr: "Bonjour" }, { path: ["content", 0, "label"] }),
  ).toThrow('Missing inline translation for "content.0.label"')
})
