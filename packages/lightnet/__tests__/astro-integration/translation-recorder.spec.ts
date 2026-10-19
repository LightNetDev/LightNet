import {
  recordingEnabled,
  recordTranslation,
} from "virtual:lightnet/translation-recorder"
import { expect, test } from "vitest"

import { vitePluginLightnetConfig } from "../../src/astro-integration/vite-plugin-lightnet-config"

type Environment = { name: string; mode: "build" | "dev" }

function loadRecorder(environment: Environment) {
  const plugin = vitePluginLightnetConfig(
    {} as Parameters<typeof vitePluginLightnetConfig>[0],
    { root: new URL("file:///site/") },
    {} as Parameters<typeof vitePluginLightnetConfig>[2],
  ) as {
    load(this: { environment: Environment }, id: string): string
  }
  return plugin.load.call(
    { environment },
    "\0virtual:lightnet/translation-recorder",
  )
}

test("prerender builds use the filesystem-backed translation recorder", () => {
  const source = loadRecorder({ name: "prerender", mode: "build" })
  expect(source).toContain("recordingEnabled = true")
  expect(source).toContain("/i18n/record-translation.ts")
})

test.each([
  { name: "ssr", mode: "build" },
  { name: "client", mode: "build" },
  { name: "astro", mode: "build" },
  { name: "prerender", mode: "dev" },
  { name: "ssr", mode: "dev" },
] as const)(
  "$name in $mode excludes the filesystem recorder",
  (environment) => {
    const source = loadRecorder(environment)
    expect(source).toContain("recordingEnabled = false")
    expect(source).not.toMatch(/\bimport\b|\bfrom\b/)
  },
)

test("runtime recording is disabled and remains safe to call", async () => {
  expect(recordingEnabled).toBe(false)
  await expect(
    recordTranslation({ type: "user", key: "title", values: { en: "Title" } }),
  ).resolves.toBeUndefined()
})
