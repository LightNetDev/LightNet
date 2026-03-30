import {
  type AstroFixturePage as LightNetPage,
  createAstroFixturePage,
  resolveFixturePath,
} from "@internal/e2e-test-utils"
import { test as baseTest } from "@playwright/test"

export { expect, type Locator } from "@playwright/test"

const root = resolveFixturePath(import.meta.url, "./fixtures/basics/")

const test = baseTest.extend<{
  lightnet: (path?: string) => Promise<LightNetPage>
}>({
  lightnet: ({ page }, use) =>
    use(async (path) => {
      const ln = await createAstroFixturePage(root, page)
      await ln.goto(path ?? "/")
      return ln
    }),
})

export { test }
