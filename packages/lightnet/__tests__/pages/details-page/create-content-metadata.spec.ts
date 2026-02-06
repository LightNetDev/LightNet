import { expect, test } from "vitest"

import type { LabelValue } from "../../../src/i18n/label"
import { createContentMetadata } from "../../../src/pages/details-page/utils/create-content-metadata"

test("Should create complete content metadata", () => {
  expect(createContentMetadata({ url: "https://some.host/some.pDf" })).toEqual({
    url: "https://some.host/some.pDf",
    canBeOpened: true,
    type: "text",
    target: "_blank",
    label: { type: "fixed", text: "some" },
    isExternal: true,
    extension: "pdf",
  })
})
const cases: {
  url: string
  expected: Record<string, unknown>
  label?: LabelValue
}[] = [
  {
    url: "https://youtube.com/watch?v=k2exixc",
    expected: {
      canBeOpened: true,
      target: "_blank",
      label: { type: "fixed", text: "youtube.com" },
      isExternal: true,
      extension: "",
      type: "link",
    },
  },
  {
    url: "https://wikipedia.org",
    expected: {
      canBeOpened: true,
      target: "_blank",
      label: { type: "fixed", text: "wikipedia.org" },
      isExternal: true,
      extension: "",
      type: "link",
    },
  },
  {
    url: "https://some.host/some.pDf",
    expected: {
      canBeOpened: true,
      type: "text",
      target: "_blank",
      label: { type: "fixed", text: "some" },
      isExternal: true,
      extension: "pdf",
    },
  },
  {
    url: "https://some.host/some.unknown",
    expected: {
      type: "link",
      canBeOpened: false,
      target: "_blank",
      label: { type: "fixed", text: "some" },
      isExternal: true,
      extension: "unknown",
    },
  },
  {
    url: "/files/my.pdf",
    expected: {
      canBeOpened: true,
      type: "text",
      target: "_self",
      label: { type: "fixed", text: "my" },
      isExternal: false,
      extension: "pdf",
    },
  },
  {
    url: "/paths/my-id",
    expected: {
      canBeOpened: true,
      target: "_self",
      label: { type: "fixed", text: "my-id" },
      isExternal: false,
      extension: "",
      type: "link",
    },
  },
  {
    url: "/files/my.unknown",
    expected: {
      canBeOpened: false,
      target: "_self",
      label: { type: "fixed", text: "my" },
      isExternal: false,
      type: "link",
      extension: "unknown",
    },
  },
  {
    url: "/some.zip",
    expected: {
      canBeOpened: false,
      target: "_self",
      label: { type: "fixed", text: "some" },
      isExternal: false,
      extension: "zip",
      type: "package",
    },
  },
  {
    url: "/some.zip",
    label: { type: "fixed", text: "foo" },
    expected: {
      label: { type: "fixed", text: "foo" },
      isExternal: false,
      extension: "zip",
      type: "package",
    },
  },
  {
    url: "/some.zip",
    label: { type: "fixed", text: "" },
    expected: {
      label: { type: "fixed", text: "" },
      isExternal: false,
      extension: "zip",
      type: "package",
    },
  },
]

cases.forEach(({ url, expected, label }) => {
  test(`Should create content metadata for url '${url}' ${label !== undefined ? `and label '${label}'` : ""}`, () => {
    expect(createContentMetadata({ url, label })).toMatchObject(expected)
  })
})

test("Should override name with input", () => {
  expect(
    createContentMetadata({
      url: "/path/to/a.file",
      label: { type: "fixed", text: "My file" },
    }),
  ).toMatchObject({ label: { type: "fixed", text: "My file" } })
})
