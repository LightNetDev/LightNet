import { afterEach, describe, expect, test, vi } from "vitest"

import { adminConfigSchema } from "../../src/astro-integration/config"

describe("adminConfigSchema", () => {
  test("Should apply top-level defaults", () => {
    const config = adminConfigSchema.parse({})

    expect(config).toEqual({
      experimental: {
        useLanguagesCollection: false,
        useCategoriesCollection: true,
        useMediaCollectionsCollection: true,
        useMediaTypesCollection: true,
        useContentLabelField: true,
        useDateCreatedField: true,
        useCommonIdField: true,
        useCategoriesField: true,
        useSlugField: false,
        useAuthorsField: true,
      },
      path: "admin",
      maxFileSize: 25,
      siteRootInRepo: "",
    })
  })

  test("Should keep use* field defaults aligned with experimental object defaults", () => {
    const topLevelDefaults = adminConfigSchema.parse({})
    const nestedExperimentalDefaults = adminConfigSchema.parse({
      experimental: {},
    })

    const useFieldDefaults = Object.fromEntries(
      Object.entries(nestedExperimentalDefaults.experimental).filter(([key]) =>
        key.startsWith("use"),
      ),
    )

    expect(useFieldDefaults).toEqual(topLevelDefaults.experimental)
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

  test("Should normalize admin paths with leading and trailing slashes", () => {
    const config = adminConfigSchema.parse({
      path: "/admin/",
    })

    expect(config.path).toBe("admin")
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
