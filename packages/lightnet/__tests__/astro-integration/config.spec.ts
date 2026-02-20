import { expect, test } from "vitest"

import { configSchema } from "../../src/astro-integration/config"

const requiredConfig = {
  site: "https://lightnet.community",
  title: { en: "LightNet" },
  languages: [
    {
      code: "en",
      label: { en: "English" },
      isDefaultSiteLanguage: true,
    },
  ],
}

test("Should default credits to true when omitted", () => {
  const config = configSchema.parse(requiredConfig)

  expect(config.credits).toBe(true)
})

test("Should preserve explicit credits false", () => {
  const config = configSchema.parse({
    ...requiredConfig,
    credits: false,
  })

  expect(config.credits).toBe(false)
})

test("Should reject invalid BCP-47 language code", () => {
  expect(() =>
    configSchema.parse({
      ...requiredConfig,
      languages: [
        {
          ...requiredConfig.languages[0],
          code: "en_US",
        },
      ],
    }),
  ).toThrowError(/Invalid BCP-47 language code/)
})

test("Should reject duplicate language codes", () => {
  expect(() =>
    configSchema.parse({
      ...requiredConfig,
      languages: [
        requiredConfig.languages[0],
        {
          ...requiredConfig.languages[0],
          isDefaultSiteLanguage: false,
          isSiteLanguage: true,
        },
      ],
    }),
  ).toThrowError(/Duplicate language code/)
})

test("Should reject object-based language config", () => {
  expect(() =>
    configSchema.parse({
      ...requiredConfig,
      languages: {
        en: {
          label: { en: "English" },
          isDefaultSiteLanguage: true,
        },
      },
    }),
  ).toThrowError(/Expected array, received object/)
})
