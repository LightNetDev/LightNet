import { expect, test } from "vitest"

import { mergeDiscoveryRecords } from "../src/core/discovery/merge-discovery-records.js"

test("Should merge duplicate built-in keys", () => {
  expect(
    mergeDiscoveryRecords([
      {
        type: "built-in",
        key: "ln.title",
        values: { en: "Title" },
      },
      {
        type: "built-in",
        key: "ln.title",
        values: { de: "Titel" },
      },
    ]),
  ).toEqual([
    {
      type: "built-in",
      key: "ln.title",
      values: { en: "Title", de: "Titel" },
    },
  ])
})

test("Should prefer source-backed inline records over fallback callsites", () => {
  expect(
    mergeDiscoveryRecords([
      {
        type: "inline",
        key: "label",
        sourceFile: "src/content/media-collections/learn-skateboarding.json",
        objectPath: ["label"],
        values: { en: "Learn Skateboarding" },
      },
      {
        type: "inline",
        key: "media-collections.learn-skateboarding.label",
        objectPath: ["media-collections", "learn-skateboarding", "label"],
        callsite: "dist/.prerender/chunks/file.mjs:1:1",
        values: { de: "Skateboarden lernen" },
      },
    ]),
  ).toEqual([
    {
      type: "inline",
      key: "label",
      sourceFile: "src/content/media-collections/learn-skateboarding.json",
      objectPath: ["label"],
      callsite: "dist/.prerender/chunks/file.mjs:1:1",
      values: {
        en: "Learn Skateboarding",
        de: "Skateboarden lernen",
      },
    },
  ])
})
