import { expect, test } from "vitest"

import {
  configSchema,
  extendedConfigSchema,
} from "../../src/astro-integration/config"

const requiredConfig = {
  site: "https://lightnet.community",
  title: { en: "LightNet" },
  siteLanguages: [{ code: "en", isDefault: true }],
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
      siteLanguages: [{ code: "en_US", isDefault: true }],
    }),
  ).toThrowError(/Invalid BCP-47 language code/)
})

test("Should reject invalid BCP-47 fallback language code", () => {
  expect(() =>
    configSchema.parse({
      ...requiredConfig,
      siteLanguages: [
        { code: "en", isDefault: true },
        { code: "de", fallback: ["es_MX"] },
      ],
    }),
  ).toThrowError(/Invalid BCP-47 language code/)
})

test("Should reject duplicate site language codes", () => {
  expect(() =>
    configSchema.parse({
      ...requiredConfig,
      siteLanguages: [{ code: "en", isDefault: true }, { code: "en" }],
    }),
  ).toThrowError(/Duplicate site language code/)
})

test("Should reject string-based siteLanguages config", () => {
  expect(() =>
    configSchema.parse({
      ...requiredConfig,
      siteLanguages: ["en"],
    }),
  ).toThrowError(/Expected object, received string/)
})

test("Should reject siteLanguages without a default", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    siteLanguages: [{ code: "en" }, { code: "de" }],
  })

  expect(parsed.success).toBe(false)
  if (parsed.success) {
    return
  }

  expect(parsed.error.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: "Exactly one site language must define isDefault: true",
      }),
    ]),
  )
})

test("Should reject multiple default site languages", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    siteLanguages: [
      { code: "en", isDefault: true },
      { code: "de", isDefault: true },
    ],
  })

  expect(parsed.success).toBe(false)
  if (parsed.success) {
    return
  }

  expect(parsed.error.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        message: "Exactly one site language must define isDefault: true",
      }),
    ]),
  )
})

test("Should allow fallback values outside configured site languages", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    siteLanguages: [
      { code: "en", isDefault: true },
      { code: "de", fallback: ["fr"] },
    ],
  })

  expect(parsed.success).toBe(true)
})

test("Should derive locales, defaultLocale and fallbackLanguages", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    title: {
      de: "LightNet",
    },
    siteLanguages: [
      { code: "en", fallback: ["fr"] },
      { code: "de", isDefault: true, fallback: ["es"] },
    ],
  })

  expect(parsed.success).toBe(true)
  if (!parsed.success) {
    return
  }

  expect(parsed.data.locales).toEqual(["en", "de"])
  expect(parsed.data.defaultLocale).toBe("de")
  expect(parsed.data.fallbackLanguages).toEqual({
    en: ["fr"],
    de: ["es"],
  })
})

test("Should accept missing non-default locale in title inline translation", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    siteLanguages: [{ code: "en", isDefault: true }, { code: "de" }],
    title: {
      en: "LightNet",
    },
  })

  expect(parsed.success).toBe(true)
})

test("Should reject missing default locale in nested inline translation", () => {
  const parsed = extendedConfigSchema.safeParse({
    ...requiredConfig,
    siteLanguages: [{ code: "en", isDefault: true }, { code: "de" }],
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
    siteLanguages: [{ code: "en", isDefault: true }, { code: "de" }],
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
    siteLanguages: [
      { code: "en", isDefault: true },
      { code: "de", fallback: ["fr"] },
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
