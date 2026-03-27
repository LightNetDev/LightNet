import { expect, test } from "vitest"

import { useInlineTranslate } from "../../../src/i18n/inline-translation"
import { createContentMetadata } from "../../../src/pages/details-page/utils/create-content-metadata"

const tInline = useInlineTranslate("en")
const tInlineDe = useInlineTranslate("de")

test("Should create complete content metadata", () => {
  expect(
    createContentMetadata({ url: "https://some.host/some.pDf" }, tInline, {
      path: ["content", 0],
    }),
  ).toEqual({
    url: "https://some.host/some.pDf",
    canBeOpened: true,
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
      canBeOpened: true,
      target: "_blank",
      labelText: "youtube.com",
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
      labelText: "wikipedia.org",
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
      labelText: "some",
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
      labelText: "some",
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
      labelText: "my",
      isExternal: false,
      extension: "pdf",
    },
  },
  {
    url: "/paths/my-id",
    expected: {
      canBeOpened: true,
      target: "_self",
      labelText: "my-id",
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
      labelText: "my",
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
    },
  },
].forEach(({ url, expected, label }) => {
  test(`Should create content metadata for url '${url}' ${label !== undefined ? `and label '${label}'` : ""}`, () => {
    expect(
      createContentMetadata({ url, label }, tInline, {
        path: ["content", 0],
      }),
    ).toMatchObject(expected)
  })
})

test("Should override name with input", () => {
  expect(
    createContentMetadata(
      { url: "/path/to/a.file", label: { en: "My file" } },
      tInline,
      { path: ["content", 0] },
    ),
  ).toMatchObject({ labelText: "My file" })
})

test("Should resolve localized content labels by locale", () => {
  const result = createContentMetadata(
    {
      url: "/files/book.pdf",
      label: { en: "Read", de: "Lesen" },
    },
    tInlineDe,
    { path: ["content", 0] },
  )
  expect(result.labelText).toBe("Lesen")
})
