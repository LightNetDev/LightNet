import { expect, test, vi } from "vitest"

import tailwind from "../../src/astro-integration/tailwind"

test("Should preserve inline PostCSS options when injecting Tailwind", async () => {
  const existingPlugin = {
    postcssPlugin: "existing-plugin",
    Once: () => {},
  }
  const updateConfig = vi.fn()

  await tailwind().hooks["astro:config:setup"]?.({
    config: {
      root: new URL("file:///tmp/lightnet"),
      vite: {
        css: {
          postcss: {
            map: { inline: false },
            parser: "sugarss",
            plugins: [existingPlugin],
          },
        },
      },
    } as never,
    updateConfig,
  } as never)

  const viteConfig = updateConfig.mock.calls[0][0].vite

  expect(viteConfig.css.postcss).toMatchObject({
    map: { inline: false },
    parser: "sugarss",
  })
  expect(viteConfig.css.postcss.plugins).toHaveLength(3)
  expect(viteConfig.css.postcss.plugins[0]).toBe(existingPlugin)
})
