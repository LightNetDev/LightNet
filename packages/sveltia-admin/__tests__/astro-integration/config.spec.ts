import { describe, expect, test } from "vitest"

import { adminConfigSchema } from "../../src/astro-integration/config"

describe("adminConfigSchema", () => {
  test("Should apply top-level defaults", () => {
    const config = adminConfigSchema.parse({})

    expect(config).toEqual({
      path: "admin",
      maxFileSize: 25,
      siteRootInRepo: "",
    })
  })

  test("Should transform gitlab backend camelCase fields to snake_case", () => {
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
      app_id: "lightnet-app",
      branch: "main",
      authType: "pkce",
      auth_type: "pkce",
    })
  })

  test("Should transform github backend camelCase fields to snake_case", () => {
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
      base_url: "https://ghe.example.com",
      branch: "main",
    })
  })
})
