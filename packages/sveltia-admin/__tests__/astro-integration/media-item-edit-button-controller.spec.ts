import { afterEach, expect, test, vi } from "vitest"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

test("Should build edit href from root base path", async () => {
  vi.stubEnv("BASE_URL", "/")

  const controller = (
    await import("../../src/astro-integration/media-item-edit-button-controller")
  ).default

  expect(controller.createHref("media/hero image")).toBe(
    "/admin#/collections/media/entries/media%2Fhero%20image",
  )
})

test("Should prefix edit href with Astro base path", async () => {
  vi.stubEnv("BASE_URL", "/docs/")

  const controller = (
    await import("../../src/astro-integration/media-item-edit-button-controller")
  ).default

  expect(controller.createHref("media/hero image")).toBe(
    "/docs/admin#/collections/media/entries/media%2Fhero%20image",
  )
})
