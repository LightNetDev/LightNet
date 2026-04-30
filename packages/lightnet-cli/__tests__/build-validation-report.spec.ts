import { expect, test } from "vitest"

import { buildValidationReport } from "../src/core/validate/build-validation-report"

const metadata = {
  defaultLocale: "en",
  locales: ["en", "de"],
}

test("Should count missing translations for every locale", () => {
  const result = buildValidationReport({
    includeBuiltIns: true,
    metadata,
    records: [
      {
        type: "user",
        key: "hello",
        values: { en: "Hello", de: undefined },
      },
      {
        type: "built-in",
        key: "ln.title",
        values: { en: undefined, de: "Titel" },
      },
    ],
  })

  expect(result.missingCounts).toEqual({ en: 1, de: 1 })
  expect(result.hasMissingTranslations).toBe(true)
})

test("Should ignore built-in translations when requested", () => {
  const result = buildValidationReport({
    includeBuiltIns: false,
    metadata,
    records: [
      {
        type: "built-in",
        key: "ln.title",
        values: { en: undefined, de: undefined },
      },
    ],
  })

  expect(result.missingCounts).toEqual({ en: 0, de: 0 })
  expect(result.hasMissingTranslations).toBe(false)
})
