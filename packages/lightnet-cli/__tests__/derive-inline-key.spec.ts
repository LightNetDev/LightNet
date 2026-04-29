import { expect, test } from "vitest"

import { deriveInlineKey } from "../src/core/export/derive-inline-key"

test("Should derive inline key from source file and object path", () => {
  expect(
    deriveInlineKey({
      type: "inline",
      key: "label",
      sourceFile: "src/content/categories/children.json",
      objectPath: ["label"],
      values: { en: "Children" },
    }),
  ).toBe("ln.inline.content.categories.children.label")
})

test("Should map astro config files to config namespace", () => {
  expect(
    deriveInlineKey({
      type: "inline",
      key: "title",
      sourceFile: "astro.config.mjs",
      objectPath: ["title"],
      values: { en: "Site" },
    }),
  ).toBe("ln.inline.config.title")
})
