import { afterEach, describe, expect, test, vi } from "vitest"

import { adminConfigSchema } from "../../src/astro-integration/config"

describe("adminConfigSchema", () => {
  test.each(["", "/", "///", "  ", " / ", "/ /"])(
    "Should reject an empty normalized admin path: %j",
    (path) => {
      const result = adminConfigSchema.safeParse({ path })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["path"],
              message: "Admin path must not be empty",
            }),
          ]),
        )
      }
    },
  )

  test("Should apply top-level defaults", () => {
    const config = adminConfigSchema.parse({})

    expect(config).toEqual({
      experimental: {
        useLanguagesCollection: false,
        hideCategoriesCollection: false,
        hideMediaCollectionsCollection: false,
        hideMediaTypesCollection: false,
        hideAuthorsField: false,
        hideCategoriesField: false,
        showContentLabelField: true,
        showDateCreatedField: true,
        showCommonIdField: true,
        showSlugField: true,
      },
      path: "admin",
      maxFileSize: 25,
      siteRootInRepo: "",
    })
  })

  test("Should keep nested experimental defaults aligned with top-level defaults", () => {
    const topLevelDefaults = adminConfigSchema.parse({})
    const nestedExperimentalDefaults = adminConfigSchema.parse({
      experimental: {},
    })

    expect(nestedExperimentalDefaults.experimental).toEqual(
      topLevelDefaults.experimental,
    )
  })

  test("Should keep gitlab backend fields in schema shape", () => {
    const config = adminConfigSchema.parse({
      backend: {
        name: "gitlab",
        repo: "lightnet/community",
        appId: "lightnet-app",
      },
    })

    expect(config.backend).toMatchObject({
      name: "gitlab",
      repo: "lightnet/community",
      appId: "lightnet-app",
      branch: "main",
      authType: "pkce",
    })
  })

  test("Should keep github backend fields in schema shape", () => {
    const config = adminConfigSchema.parse({
      backend: {
        name: "github",
        repo: "lightnet/community",
        baseUrl: "https://ghe.example.com",
      },
    })

    expect(config.backend).toMatchObject({
      name: "github",
      repo: "lightnet/community",
      baseUrl: "https://ghe.example.com",
      branch: "main",
    })
  })

  test("Should allow the internal test-repo backend", () => {
    const config = adminConfigSchema.parse({
      backend: {
        name: "test-repo",
      },
    })

    expect(config.backend).toEqual({
      name: "test-repo",
    })
  })

  test.each([
    ["admin", "admin"],
    ["/admin/", "admin"],
    ["  admin  ", "admin"],
    ["  ///admin///  ", "admin"],
    [" /tools/content/ ", "tools/content"],
  ])("Should normalize valid admin path %j to %j", (path, expected) => {
    expect(adminConfigSchema.parse({ path }).path).toBe(expected)
  })
})

describe("getConfig", () => {
  afterEach(() => {
    vi.resetModules()
  })

  async function loadConfigWithBackend(
    backend:
      | {
          name: "gitlab"
          repo: string
          appId?: string
          branch?: string
          authType?: "pkce"
        }
      | {
          name: "github"
          repo: string
          baseUrl?: string
          branch?: string
        }
      | { name: "test-repo" },
  ) {
    vi.doMock("astro:config/server", () => ({
      site: "https://lightnet.community",
    }))
    vi.doMock("virtual:lightnet/sveltiaAdminConfig", () => ({
      default: adminConfigSchema.parse({
        backend,
      }),
    }))
    vi.doMock("virtual:lightnet/config", () => ({
      default: {
        defaultLocale: "en",
        locales: ["en"],
        languages: [
          {
            code: "en",
            label: {
              en: "English",
            },
          },
        ],
      },
    }))

    const { createConfig } = await import("../../src/sveltia.config")

    return createConfig()
  }

  test("Should transform gitlab backend camelCase fields to snake_case", async () => {
    const config = await loadConfigWithBackend({
      name: "gitlab",
      repo: "lightnet/community",
      appId: "lightnet-app",
    })

    expect(config.backend).toMatchObject({
      name: "gitlab",
      repo: "lightnet/community",
      appId: "lightnet-app",
      app_id: "lightnet-app",
      branch: "main",
      authType: "pkce",
      auth_type: "pkce",
    })
  })

  test("Should transform github backend camelCase fields to snake_case", async () => {
    const config = await loadConfigWithBackend({
      name: "github",
      repo: "lightnet/community",
      baseUrl: "https://ghe.example.com",
    })

    expect(config.backend).toMatchObject({
      name: "github",
      repo: "lightnet/community",
      baseUrl: "https://ghe.example.com",
      base_url: "https://ghe.example.com",
      branch: "main",
    })
  })
})
