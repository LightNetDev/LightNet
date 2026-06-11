import { expect, test } from "vitest"

import { formatFooterText } from "../../../src/layouts/components/footer/format-footer-text"

test("Should replace year placeholder with current year", () => {
  expect(formatFooterText("Copyright {{year}} LightNet", 2026)).toBe(
    "Copyright 2026 LightNet",
  )
})

test("Should replace multiple year placeholders", () => {
  expect(formatFooterText("{{year}}/{{year}}", 2026)).toBe("2026/2026")
})

test("Should preserve footer text without year placeholder", () => {
  expect(formatFooterText("LightNet", 2026)).toBe("LightNet")
})
