import { expect, test } from "vitest"

import { useTranslateMap } from "../../../src/i18n/translate-map"
import { createContentMetadata } from "../../../src/pages/details-page/utils/create-content-metadata"

const { tMap } = useTranslateMap("en")
const { tMap: tMapDe } = useTranslateMap("de")

test("Should create complete content metadata", () => {
  expect(createContentMetadata({ url: "https://some.host/some.pDf" })).toEqual({
    url: "https://some.host/some.pDf",
    isDownload: undefined,
    type: "text",
    target: "_blank",
    labelText: "some",
    isExternal: true,
    extension: "pdf",
  })
})
;[
  {
    url: "https://youtube.com/watch?v=k2exixc",
    expected: {
      target: "_blank",
      labelText: "youtube.com",
      isExternal: true,
      extension: "",
      type: "link",
      isDownload: undefined,
    },
  },
  {
    url: "https://wikipedia.org",
    expected: {
      target: "_blank",
      labelText: "wikipedia.org",
      isExternal: true,
      extension: "",
      type: "link",
      isDownload: undefined,
    },
  },
  {
    url: "https://some.host/some.pDf",
    expected: {
      type: "text",
      target: "_blank",
      labelText: "some",
      isExternal: true,
      extension: "pdf",
      isDownload: undefined,
    },
  },
  {
    url: "https://some.host/some.unknown",
    expected: {
      type: "link",
      target: "_blank",
      labelText: "some",
      isExternal: true,
      extension: "unknown",
      isDownload: undefined,
    },
  },
  {
    url: "/files/my.pdf",
    expected: {
      type: "text",
      target: "_self",
      labelText: "my",
      isExternal: false,
      extension: "pdf",
      isDownload: undefined,
    },
  },
  {
    url: "/paths/my-id",
    expected: {
      target: "_self",
      labelText: "my-id",
      isExternal: false,
      extension: "",
      type: "link",
      isDownload: undefined,
    },
  },
  {
    url: "/files/my.unknown",
    expected: {
      target: "_self",
      labelText: "my",
      isExternal: false,
      type: "link",
      extension: "unknown",
      isDownload: undefined,
    },
  },
  {
    url: "/some.zip",
    expected: {
      isDownload: true,
      target: "_self",
      labelText: "some",
      isExternal: false,
      extension: "zip",
      type: "package",
    },
  },
  {
    url: "/some.zip",
    label: { en: "foo" },
    expected: {
      labelText: "foo",
      isExternal: false,
      extension: "zip",
      type: "package",
      isDownload: true,
    },
  },
].forEach(({ url, expected, label }) => {
  test(`Should create content metadata for url '${url}' ${label !== undefined ? `and label '${label}'` : ""}`, () => {
    expect(
      createContentMetadata({
        url,
        labelText: label && tMap(label, { path: ["content", 0, "label"] }),
      }),
    ).toMatchObject(expected)
  })
})

test("Should override name with input", () => {
  expect(
    createContentMetadata({
      url: "/path/to/a.file",
      labelText: tMap({ en: "My file" }, { path: ["content", 0, "label"] }),
    }),
  ).toMatchObject({ labelText: "My file" })
})

test("Should resolve localized content labels by locale", () => {
  const result = createContentMetadata({
    url: "/files/book.pdf",
    labelText: tMapDe(
      { en: "Read", de: "Lesen" },
      { path: ["content", 0, "label"] },
    ),
  })
  expect(result.labelText).toBe("Lesen")
})
