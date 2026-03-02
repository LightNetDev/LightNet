import { expect, test } from "vitest"

import {
  configSchema,
  extendedConfigSchema,
} from "../../src/astro-integration/config"

const requiredConfig = {
  site: "https://lightnet.community",
  title: { en: "LightNet" },
  siteLanguages: ["en"],
  defaultSiteLanguage: "en",
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

test("Should reject invalid BCP-47 site language code", () => {
  expect(() =>
    configSchema.parse({
      ...requiredConfig,
      siteLanguages: ["en_US"],
    }),
  ).toThrowError(/Invalid BCP-47 language code/)
})

test("Should reject duplicate site language codes", () => {
  expect(() =>
    configSchema.parse({
      ...requiredConfig,
      siteLanguages: ["en", "en"],
    }),
  ).toThrowError(/Duplicate site language code/)
})

test("Should reject object-based siteLanguages config", () => {
  expect(() =>
    configSchema.parse({
      ...requiredConfig,
      siteLanguages: {
        en: true,
      },
    }),
  ).toThrowError(/Expected array, received object/)
})

test("Should allow defaultSiteLanguage outside siteLanguages", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    siteLanguages: ["en", "de"],
    defaultSiteLanguage: "fr",
    title: {
      fr: "LightNet",
    },
  })

  expect(parsed.success).toBe(true)
  if (!parsed.success) return
  expect(parsed.data.locales).toEqual(["fr", "en", "de"])
  expect(parsed.data.defaultLocale).toBe("fr")
})

test("Should reject fallbackLanguages key missing from siteLanguages", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    siteLanguages: ["en", "de"],
    fallbackLanguages: {
      fr: ["en"],
    },
  })

  expect(parsed.success).toBe(false)
  if (parsed.success) {
    return
  }

  expect(parsed.error.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: 'fallbackLanguages key "fr" must be included in siteLanguages',
        path: ["fallbackLanguages", "fr"],
      }),
    ]),
  )
})

test("Should allow fallbackLanguages values outside siteLanguages", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    siteLanguages: ["en", "de"],
    fallbackLanguages: {
      de: ["fr"],
    },
  })

  expect(parsed.success).toBe(true)
})

test("Should accept missing non-default locale in title inline translation", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    siteLanguages: ["en", "de"],
    defaultSiteLanguage: "en",
    title: {
      en: "LightNet",
    },
  })

  expect(parsed.success).toBe(true)
})

test("Should reject missing default locale in nested inline translation", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    siteLanguages: ["en", "de"],
    defaultSiteLanguage: "en",
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

test("Should reject unsupported locale in inline translation", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    siteLanguages: ["en", "de"],
    defaultSiteLanguage: "en",
    title: {
      en: "LightNet",
      fr: "LumiereNet",
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
        path: ["title", "fr"],
      }),
    ]),
  )
})

test("Should accept config when inline translations define default locale", () => {
  const config = configSchema.parse({
    ...requiredConfig,
    siteLanguages: ["en", "de"],
    defaultSiteLanguage: "en",
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
    fallbackLanguages: {
      de: ["en"],
    },
  })

  expect(config).toBeDefined()
})
