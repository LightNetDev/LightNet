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

test.each([
  { settings: {}, expected: undefined },
  { settings: { override: {} }, expected: undefined },
  {
    settings: { override: { footer: "./src/components/Footer.astro" } },
    expected: "./src/components/Footer.astro",
  },
  {
    settings: { footerComponent: "./src/components/LegacyFooter.astro" },
    expected: "./src/components/LegacyFooter.astro",
  },
  {
    settings: {
      footerComponent: "./src/components/LegacyFooter.astro",
      override: {},
    },
    expected: "./src/components/LegacyFooter.astro",
  },
  {
    settings: {
      footerComponent: "./src/components/LegacyFooter.astro",
      override: { footer: "./src/components/Footer.astro" },
    },
    expected: "./src/components/Footer.astro",
  },
  {
    settings: {
      footerComponent: "./src/components/LegacyFooter.astro",
      override: { footer: "" },
    },
    expected: "",
  },
])("Should resolve footer override for $settings", ({ settings, expected }) => {
  const config = extendedConfigSchema.parse({
    ...requiredConfig,
    ...settings,
  })

  expect(config.override.footer).toBe(expected)
  expect(config).not.toHaveProperty("footerComponent")
})

test.each([
  { settings: {}, expected: undefined },
  { settings: { inject: {} }, expected: undefined },
  {
    settings: { inject: { head: "./src/components/Head.astro" } },
    expected: "./src/components/Head.astro",
  },
  {
    settings: { headComponent: "./src/components/LegacyHead.astro" },
    expected: "./src/components/LegacyHead.astro",
  },
  {
    settings: {
      headComponent: "./src/components/LegacyHead.astro",
      inject: {},
    },
    expected: "./src/components/LegacyHead.astro",
  },
  {
    settings: {
      headComponent: "./src/components/LegacyHead.astro",
      inject: { head: "./src/components/Head.astro" },
    },
    expected: "./src/components/Head.astro",
  },
  {
    settings: {
      headComponent: "./src/components/LegacyHead.astro",
      inject: { head: "" },
    },
    expected: "",
  },
])("Should resolve head injections for $settings", ({ settings, expected }) => {
  const config = extendedConfigSchema.parse({ ...requiredConfig, ...settings })

  expect(config.inject.head).toBe(expected)
  expect(config).not.toHaveProperty("headComponent")
})

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
