import { expect, test } from "vitest"

import { formatComments } from "../src/core/export/format-comments"

test("Should include extra values outside site locales", () => {
  expect(
    formatComments(
      {
        type: "built-in",
        key: "ln.title",
        values: {
          de: "Titel",
          en: "Title",
        },
      },
      {
        defaultLocale: "de",
        locales: ["de", "fr"],
      },
    ),
  ).toEqual(["# source: ln.title", "# translations: de=Titel | en=Title"])
})
