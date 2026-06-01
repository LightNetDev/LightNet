import { describe, expect, it } from "vitest"

import { formatLanguageLabel } from "../../src/i18n/resolve-language"

describe("formatLanguageLabel", () => {
  it("keeps the label unchanged for plain English", () => {
    expect(formatLanguageLabel("English", "en")).toBe("English")
  })

  it("keeps labels unchanged for regioned locales too", () => {
    expect(formatLanguageLabel("English", "en-GB")).toBe("English")
    expect(formatLanguageLabel("Français", "fr")).toBe("Français")
  })
})
