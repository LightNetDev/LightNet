import { expect, test } from "vitest"

import { configSchema } from "../../src/astro-integration/config"

const requiredConfig = {
  siteUrl: "https://lightnet.community",
  title: { en: "LightNet" },
  languages: {
    en: {
      label: { en: "English" },
      isDefaultSiteLanguage: true,
    },
  },
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
