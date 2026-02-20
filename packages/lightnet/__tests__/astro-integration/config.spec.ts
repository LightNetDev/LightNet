import { expect, test } from "vitest"

import {
  configSchema,
  extendedConfigSchema,
} from "../../src/astro-integration/config"

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

test("Should reject missing locale in title inline translation", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    languages: [
      requiredConfig.languages[0],
      {
        code: "de",
        label: {
          en: "German",
          de: "Deutsch",
        },
        isSiteLanguage: true,
      },
    ],
    title: {
      en: "LightNet",
    },
  })

  expect(parsed.success).toBe(false)
  if (parsed.success) {
    return
  }

  expect(parsed.error.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: 'Missing translation for locale "de"',
        path: ["title", "de"],
      }),
    ]),
  )
})

test("Should reject missing locale in nested inline translation", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    languages: [
      {
        code: "en",
        label: { en: "English", de: "Englisch" },
        isDefaultSiteLanguage: true,
      },
      {
        code: "de",
        label: { en: "German", de: "Deutsch" },
        isSiteLanguage: true,
      },
    ],
    title: {
      en: "LightNet",
      de: "LichtNet",
    },
    mainMenu: [
      {
        href: "/about",
        label: {
          en: "About",
        },
        requiresLocale: true,
      },
    ],
  })

  expect(parsed.success).toBe(false)
  if (parsed.success) {
    return
  }

  expect(parsed.error.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: 'Missing translation for locale "de"',
        path: ["mainMenu", 0, "label", "de"],
      }),
    ]),
  )
})

test("Should reject missing locale in language label inline translation", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    languages: [
      {
        code: "en",
        label: { en: "English" },
        isDefaultSiteLanguage: true,
      },
      {
        code: "de",
        label: { en: "German", de: "Deutsch" },
        isSiteLanguage: true,
      },
    ],
    title: {
      en: "LightNet",
      de: "LichtNet",
    },
  })

  expect(parsed.success).toBe(false)
  if (parsed.success) {
    return
  }

  expect(parsed.error.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: 'Missing translation for locale "de"',
        path: ["languages", 0, "label", "de"],
      }),
    ]),
  )
})

test("Should accept config when inline translations cover all site locales", () => {
  const config = configSchema.parse({
    ...requiredConfig,
    languages: [
      {
        code: "en",
        label: { en: "English", de: "Englisch" },
        isDefaultSiteLanguage: true,
      },
      {
        code: "de",
        label: { en: "German", de: "Deutsch" },
        isSiteLanguage: true,
      },
    ],
    title: {
      en: "LightNet",
      de: "LichtNet",
    },
    logo: {
      src: "/src/assets/logo.png",
      alt: {
        en: "LightNet logo",
        de: "LightNet Logo",
      },
    },
    mainMenu: [
      {
        href: "/about",
        label: {
          en: "About",
          de: "Uber",
        },
        requiresLocale: true,
      },
    ],
  })

  expect(config).toBeDefined()
})
