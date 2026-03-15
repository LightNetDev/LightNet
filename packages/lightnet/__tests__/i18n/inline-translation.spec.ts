import { expect, test } from "vitest"

import { resolveInlineTranslation } from "../../src/i18n/inline-translation"

test("Should resolve the localized value for the current locale", () => {
  expect(
    resolveInlineTranslation({ en: "Hello", de: "Hallo" }, "de", "en"),
  ).toBe("Hallo")
})

test("Should fallback to default locale when current locale is missing", () => {
  expect(resolveInlineTranslation({ en: "Hello" }, "de", "en")).toBe("Hello")
})

test("Should throw when current and default locales are missing in label map", () => {
  expect(() => resolveInlineTranslation({ fr: "Bonjour" }, "de", "en")).toThrow(
    /Missing localized translation/,
  )
})
