import { expect, test } from "vitest"

import {
  configSchema,
  extendedConfigSchema,
} from "../../src/astro-integration/config"

const requiredConfig = {
  title: { en: "LightNet" },
  languages: [
    {
      code: "en",
      label: { en: "English" },
      isDefaultSiteLanguage: true,
    },
  ],
}

test("Should default credits to false when omitted", () => {
  const config = configSchema.parse(requiredConfig)

  expect(config.credits).toBe(false)
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
  ).toThrow(/Invalid BCP-47 language code/)
})

test("Should reject invalid BCP-47 fallback language code", () => {
  expect(() =>
    configSchema.parse({
      ...requiredConfig,
      languages: [
        requiredConfig.languages[0],
        {
          code: "de",
          label: { en: "German" },
          isSiteLanguage: true,
          fallbackLanguages: ["es_MX"],
        },
      ],
    }),
  ).toThrow(/Invalid BCP-47 language code/)
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
  ).toThrow(/Duplicate language code/)
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
  ).toThrow(/expected array, received object/i)
})

test("Should reject languages without a default", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    languages: [
      {
        code: "en",
        label: { en: "English" },
        isSiteLanguage: true,
      },
      {
        code: "de",
        label: { en: "German" },
        isSiteLanguage: true,
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
        message: "Exactly one language must define isDefaultSiteLanguage: true",
      }),
    ]),
  )
})

test("Should reject multiple default site languages", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    languages: [
      requiredConfig.languages[0],
      {
        code: "de",
        label: { en: "German" },
        isDefaultSiteLanguage: true,
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
        message: "Exactly one language must define isDefaultSiteLanguage: true",
      }),
    ]),
  )
})

test("Should set isSiteLanguage when language is default", () => {
  const parsed = extendedConfigSchema.parse(requiredConfig)

  expect(parsed.languages[0].isSiteLanguage).toBe(true)
  expect(parsed.locales).toEqual(["en"])
})

test("Should allow fallback values outside configured site languages", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    languages: [
      requiredConfig.languages[0],
      {
        code: "de",
        label: { en: "German" },
        isSiteLanguage: true,
        fallbackLanguages: ["fr"],
      },
    ],
  })

  expect(parsed.success).toBe(true)
})

test("Should derive locales and defaultLocale", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    title: {
      de: "LightNet",
    },
    languages: [
      {
        code: "en",
        label: { de: "Englisch" },
      },
      {
        code: "de",
        label: { de: "Deutsch" },
        isDefaultSiteLanguage: true,
        fallbackLanguages: ["es"],
      },
      {
        code: "fr",
        label: { de: "Franzosisch" },
      },
    ],
  })

  expect(parsed.success).toBe(true)
  if (!parsed.success) {
    return
  }

  expect(parsed.data.locales).toEqual(["de"])
  expect(parsed.data.defaultLocale).toBe("de")
})

test("Should accept missing non-default locale in title inline translation", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    languages: [
      requiredConfig.languages[0],
      {
        code: "de",
        label: { en: "German" },
        isSiteLanguage: true,
      },
    ],
    title: {
      en: "LightNet",
    },
  })

  expect(parsed.success).toBe(true)
})

test("Should accept config when inline translations define default locale", () => {
  const config = configSchema.parse({
    ...requiredConfig,
    languages: [
      requiredConfig.languages[0],
      {
        code: "de",
        label: { en: "German" },
        isSiteLanguage: true,
        fallbackLanguages: ["fr"],
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
