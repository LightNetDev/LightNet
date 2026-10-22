import { expect, test } from "vitest"

import { findStaleTranslationOverrides } from "../../src/i18n/translations"

test("Finds stale ln.* overrides in every file, preserving filenames and ignoring valid overrides and custom keys", async () => {
  const overrides = await findStaleTranslationOverrides(
    { "ln.search.title": "Search", "ln.unused": "Unused" },
    {
      "/src/translations/de.yml": async () => `
ln.search.title: Suche
ln.unused: Nicht verwendet
ln.removed: Alt
custom.title: Titel
`,
      "/src/translations/zz.yaml": async () => `
ln.removed: Old
ln.another-removed: Also old
`,
    },
  )

  expect(overrides).toEqual([
    { key: "ln.removed", path: "src/translations/de.yml" },
    { key: "ln.removed", path: "src/translations/zz.yaml" },
    { key: "ln.another-removed", path: "src/translations/zz.yaml" },
  ])
})

test("Produces an empty manifest when stale overrides are removed", async () => {
  expect(
    await findStaleTranslationOverrides(
      { "ln.search.title": "Search" },
      { "/src/translations/de.yml": async () => "ln.search.title: Suche" },
    ),
  ).toEqual([])
  expect(await findStaleTranslationOverrides({}, {})).toEqual([])
})
