import { expect, test, vi } from "vitest"

import lightnetSveltiaAdmin from "../../src/astro-integration/integration"

const MEDIA_ITEM_EDIT_BUTTON_CONTROLLER =
  "virtual:lightnet/components/media-item-edit-button-controller"

const loadMediaItemEditButtonController = (path: string) => {
  const integration = lightnetSveltiaAdmin({ path })
  const setupHook = integration.hooks["astro:config:setup"]!
  const updateConfig = vi.fn()

  setupHook({
    injectRoute: vi.fn(),
    updateConfig,
  } as never)

  const plugin = updateConfig.mock.calls[0][0].vite.plugins[0]
  const resolvedId = plugin.resolveId(MEDIA_ITEM_EDIT_BUTTON_CONTROLLER)

  return plugin.load(resolvedId)
}

test("Should inject media edit button controller when path is exactly 'admin'", () => {
  const source = loadMediaItemEditButtonController("admin")

  expect(source).toContain("media-item-edit-button-controller.ts")
})

test("Should inject undefined when path is '/admin'", () => {
  const source = loadMediaItemEditButtonController("/admin")

  expect(source).toBe("export default undefined;")
})

test("Should inject undefined when path is custom", () => {
  const source = loadMediaItemEditButtonController("/custom-admin")

  expect(source).toBe("export default undefined;")
})

test("Should inject undefined when path is '/admin/'", () => {
  const source = loadMediaItemEditButtonController("/admin/")

  expect(source).toBe("export default undefined;")
})
