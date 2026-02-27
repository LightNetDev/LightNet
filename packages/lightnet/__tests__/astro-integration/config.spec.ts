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

test("Should accept missing non-default locale in title inline translation", () => {
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

  expect(parsed.success).toBe(true)
})

test("Should reject missing default locale in nested inline translation", () => {
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
          de: "Uber",
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
        message: 'Missing translation for default locale "en"',
        path: ["mainMenu", 0, "label", "en"],
      }),
    ]),
  )
})

test("Should reject missing default locale in language label inline translation", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    languages: [
      {
        code: "en",
        label: { de: "Englisch" },
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
        message: 'Missing translation for default locale "en"',
        path: ["languages", 0, "label", "en"],
      }),
    ]),
  )
})

test("Should reject unsupported locale in inline translation", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    languages: [
      {
        code: "en",
        label: { en: "English", fr: "Anglais" },
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
        message:
          'Invalid locale "fr". Inline translations only support configured site locales: en, de',
        path: ["languages", 0, "label", "fr"],
      }),
    ]),
  )
})

test("Should accept config when inline translations define default locale", () => {
  const config = configSchema.parse({
    ...requiredConfig,
    languages: [
      {
        code: "en",
        label: { en: "English" },
        isDefaultSiteLanguage: true,
      },
      {
        code: "de",
        label: { en: "German" },
        isSiteLanguage: true,
      },
    ],
    title: {
      en: "LightNet",
    },
    logo: {
      src: "/src/assets/logo.png",
      alt: {
        en: "LightNet logo",
      },
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

  expect(config).toBeDefined()
})
