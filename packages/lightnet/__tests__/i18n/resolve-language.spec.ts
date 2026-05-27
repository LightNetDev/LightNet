import { describe, expect, it } from "vitest"

import { formatLanguageLabel } from "../../src/i18n/resolve-language"

describe("formatLanguageLabel", () => {
  it("adds the US region for plain English", () => {
    expect(formatLanguageLabel("English", "en")).toBe("English (US)")
  })

  it("uses the locale region when present", () => {
    expect(formatLanguageLabel("English", "en-GB")).toBe("English (GB)")
  })

  it("adds a default region for Arabic", () => {
    expect(formatLanguageLabel("العربية", "ar")).toBe("العربية (SA)")
  })

  it("adds a default region for German", () => {
    expect(formatLanguageLabel("Deutsch", "de")).toBe("Deutsch (DE)")
  })

  it("keeps labels unchanged when no region is available", () => {
    expect(formatLanguageLabel("Français", "fr")).toBe("Français")
  })
})
