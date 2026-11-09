import { expect, test } from "vitest"

import { availableFilterOptions } from "../../../src/pages/search-page/utils/available-filter-options"

const items = [
  { type: "video", language: "en", categories: ["travel", "family"] },
  { type: "video", language: "fr", categories: ["cooking"] },
  { type: "book", language: "de", categories: ["travel"] },
  { type: "book", language: "en", categories: ["cooking"] },
  { type: "audio", language: "en", categories: null },
]
const options = (ids: string[]) =>
  ids.map((id) => ({ id, labelText: id.toUpperCase() }))
const languages = options(["en", "de", "fr"])
const types = options(["video", "book", "audio"])
const categories = options(["travel", "family", "cooking"])

test("Limits languages by type, preserving translated labels and order", () => {
  expect(
    availableFilterOptions(languages, items, { type: "video" }, "language"),
  ).toEqual([languages[0], languages[2]])
})

test("Combines other filters while ignoring the dropdown's own selection", () => {
  expect(
    availableFilterOptions(
      languages,
      items,
      { type: "video", category: "travel", language: "en" },
      "language",
    ),
  ).toEqual([languages[0]])
  expect(
    availableFilterOptions(
      languages,
      items,
      { type: "video", language: "en" },
      "language",
    ),
  ).toEqual([languages[0], languages[2]])
})

test("Computes type options from language and category", () => {
  expect(
    availableFilterOptions(
      types,
      items,
      { type: "book", language: "en", category: "cooking" },
      "type",
    ),
  ).toEqual([types[1]])
})

test("Computes categories from language and type, supporting multiple categories", () => {
  expect(
    availableFilterOptions(
      categories,
      items,
      { type: "video", language: "en", category: "travel" },
      "category",
    ),
  ).toEqual([categories[0], categories[1]])
  expect(
    availableFilterOptions(categories, items, { type: "audio" }, "category"),
  ).toEqual([])
})

test("Restores options after filters are cleared and ignores search text", () => {
  expect(
    availableFilterOptions(
      languages,
      items,
      { type: "", category: "", search: "no matches" },
      "language",
    ),
  ).toEqual(languages)
})

test("Preserves an incompatible selection so it can be cleared", () => {
  expect(
    availableFilterOptions(
      languages,
      items,
      { type: "video", language: "de" },
      "language",
    ),
  ).toEqual(languages)
})

test("Preserves unknown URL values without mutating the original options", () => {
  expect(
    availableFilterOptions(
      languages,
      items,
      { language: "unknown" },
      "language",
    ),
  ).toEqual([...languages, { id: "unknown", labelText: "unknown" }])
  expect(languages).toHaveLength(3)
})

test("Keeps options while loading but removes unavailable options for an empty index", () => {
  expect(availableFilterOptions(languages, undefined, {}, "language")).toEqual(
    languages,
  )
  expect(availableFilterOptions(languages, [], {}, "language")).toEqual([])
})
