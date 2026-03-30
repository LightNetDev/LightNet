import {
  createAstroFixturePage,
  resolveFixturePath,
} from "@internal/e2e-test-utils"
import { test as baseTest } from "@playwright/test"

import { AdminApp } from "./page-objects/admin-app"

export { expect, type Locator } from "@playwright/test"

type AdminBackend = "local-repo" | "test-repo"

const fixtureRoots: Record<AdminBackend, string> = {
  "local-repo": resolveFixturePath(
    import.meta.url,
    "./fixtures/admin-local-repo/",
  ),
  "test-repo": resolveFixturePath(
    import.meta.url,
    "./fixtures/admin-test-repo/",
  ),
}

const test = baseTest.extend<{
  admin: (backend?: AdminBackend) => Promise<AdminApp>
}>({
  admin: ({ page }, use) =>
    use(async (backend = "test-repo") => {
      const fixture = await createAstroFixturePage(fixtureRoots[backend], page)

      const app = new AdminApp(fixture)
      await app.goto()
      return app
    }),
})

export { type AdminBackend, test }
