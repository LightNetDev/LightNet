import { expect, test } from "vitest"

import { parseLanguageFile } from "../../src/astro-integration/load-config"

const getThrownError = (run: () => void) => {
  try {
    run()
  } catch (error) {
    return error as Error & { hint?: string }
  }
  throw new Error("Expected function to throw")
}

test("Should accept language file with matching code", () => {
  const language = parseLanguageFile({
    fileName: "en.json",
    fileCode: "en",
    language: {
      code: "en",
      label: { en: "English" },
      isDefaultSiteLanguage: true,
    },
  })

  expect(language).toMatchObject({
    code: "en",
  })
})

test("Should reject language file without string code", () => {
  const error = getThrownError(() =>
    parseLanguageFile({
      fileName: "en.json",
      fileCode: "en",
      language: {
        label: { en: "English" },
      },
    }),
  )

  expect(error).toMatchObject({
    message: "Invalid language config in /src/config/languages/en.json",
    hint: expect.stringContaining('Missing required string "code"'),
  })
})

test("Should reject language file when code mismatches file name", () => {
  const error = getThrownError(() =>
    parseLanguageFile({
      fileName: "en.json",
      fileCode: "en",
      language: {
        code: "de",
        label: { en: "Deutsch" },
      },
    }),
  )

  expect(error).toMatchObject({
    message: "Invalid language config in /src/config/languages/en.json",
    hint: expect.stringContaining('expected "en"'),
  })
})
