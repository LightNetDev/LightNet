import { expect, test, vi } from "vitest"

vi.mock("virtual:lightnet/config", () => ({
  default: {
    defaultLocale: "en",
    locales: ["en", "de"],
    languages: [
      {
        code: "en",
        label: { en: "English" },
      },
      {
        code: "de",
        label: { en: "German" },
      },
    ],
  },
}))

vi.mock("virtual:lightnet/sveltiaAdminConfig", () => ({
  default: {
    maxFileSize: 25,
    siteRootInRepo: "",
  },
}))

import { mediaItemCollection } from "../../src/sveltia/collections/content/media-items"
import { inlineTranslation } from "../../src/sveltia/utils/inline-translation"

test("Should require only default locale in inline translation fields", () => {
  const field = inlineTranslation({ name: "label" }) as {
    fields: Array<{ name: string; required: boolean }>
  }

  expect(field.fields).toEqual([
    expect.objectContaining({ name: "en", required: true }),
    expect.objectContaining({ name: "de", required: false }),
  ])
})

test("Should expose optional inline label for media content upload and link items", () => {
  const contentField = mediaItemCollection.fields.find(
    (field) => "name" in field && field.name === "content",
  ) as {
    types: Array<{
      name: string
      fields?: Array<{ name: string; required?: boolean }>
    }>
  }

  const uploadType = contentField.types.find((type) => type.name === "upload")
  const linkType = contentField.types.find((type) => type.name === "link")

  expect(uploadType?.fields).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: "label", required: false }),
    ]),
  )
  expect(linkType?.fields).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: "label", required: false }),
    ]),
  )
})
