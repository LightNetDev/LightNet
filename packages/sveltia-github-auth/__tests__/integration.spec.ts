import cloudflare from "@astrojs/cloudflare"
import type { APIContext, AstroIntegration } from "astro"
import { afterEach, describe, expect, test, vi } from "vitest"

import sveltiaGithubAuth from "../src/astro-integration/integration"
import { GET, prerender } from "../src/test"

vi.mock("@astrojs/cloudflare", () => ({
  default: vi.fn((options) => ({ name: "@astrojs/cloudflare", options })),
}))

afterEach(() => vi.restoreAllMocks())

function configure(adapter?: AstroIntegration) {
  const integration = sveltiaGithubAuth()
  const setup = integration.hooks["astro:config:setup"]!
  const injectRoute = vi.fn()
  const updateConfig = vi.fn()
  const run = () =>
    setup({
      config: { adapter },
      injectRoute,
      updateConfig,
    } as unknown as Parameters<typeof setup>[0])
  return { run, injectRoute, updateConfig }
}

describe("Cloudflare integration", () => {
  test("enables Cloudflare and registers an on-demand endpoint", async () => {
    const { run, injectRoute, updateConfig } = configure()
    await run()
    expect(updateConfig).toHaveBeenCalledWith({
      adapter: {
        name: "@astrojs/cloudflare",
        options: { prerenderEnvironment: "node" },
      },
      integrations: [
        {
          name: "@astrojs/cloudflare",
          options: { prerenderEnvironment: "node" },
        },
      ],
    })
    expect(injectRoute).toHaveBeenCalledExactlyOnceWith({
      pattern: "/api/sveltia-github-auth/test",
      entrypoint: "@lightnet/sveltia-github-auth/test.ts",
      prerender: false,
    })
  })

  test("preserves an explicitly configured Cloudflare adapter", async () => {
    const { run, injectRoute, updateConfig } = configure({
      name: "@astrojs/cloudflare",
      hooks: {},
    })
    await run()
    expect(updateConfig).not.toHaveBeenCalled()
    expect(injectRoute).toHaveBeenCalledOnce()
  })

  test("rejects a different adapter", () => {
    const { run, injectRoute, updateConfig } = configure({
      name: "@astrojs/node",
      hooks: {},
    })
    expect(run).toThrow("Invalid Sveltia GitHub auth adapter")
    expect(updateConfig).not.toHaveBeenCalled()
    expect(injectRoute).not.toHaveBeenCalled()
  })

  test("passes an explicit Wrangler configuration to Cloudflare", async () => {
    const setup = sveltiaGithubAuth({ configPath: "../../wrangler.json" })
      .hooks["astro:config:setup"]!
    await setup({
      config: {},
      injectRoute: vi.fn(),
      updateConfig: vi.fn(),
    } as unknown as Parameters<typeof setup>[0])
    expect(cloudflare).toHaveBeenLastCalledWith({
      configPath: "../../wrangler.json",
      prerenderEnvironment: "node",
    })
  })
})

test("GET generates a new uncached JSON response for each request", async () => {
  const random = vi.spyOn(Math, "random")
  random.mockReturnValueOnce(0.125).mockReturnValueOnce(0.875)
  expect(prerender).toBe(false)

  for (const expected of [0.125, 0.875]) {
    const response = await GET({} as APIContext)
    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toContain("application/json")
    expect(response.headers.get("Cache-Control")).toBe("no-store")
    expect(await response.json()).toEqual({ random: expected })
  }
  expect(random).toHaveBeenCalledTimes(2)
})
