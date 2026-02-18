import { expect, test } from "vitest"

import { resolveInlineTranslation } from "../../src/i18n/inline-translation"

test("Should resolve the localized value for the current locale", () => {
  expect(resolveInlineTranslation({ en: "Hello", de: "Hallo" }, "de")).toBe(
    "Hallo",
  )
})

test("Should throw when locale is missing in label map", () => {
  expect(() => resolveInlineTranslation({ en: "Hello" }, "de")).toThrow(
    /Missing localized translation/,
  )
})
