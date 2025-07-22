import { expect } from "@playwright/test"

import { lightnetTest } from "./test-utils"

const test = lightnetTest("./fixtures/basics/")

const pkg = await import("../package.json", {
  assert: { type: "json" },
})

test("Should return lightnet version", async ({ page, startLightnet }) => {
  const ln = await startLightnet()
  const response = await page.goto(ln.resolveURL("/api/versions.json"))
  expect(response?.ok()).toBe(true)
  const data = await response?.json()
  expect(data).toEqual({ lightnet: pkg.default.version })
})
