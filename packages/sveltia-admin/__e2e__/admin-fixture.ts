import {
  createAstroFixturePage,
  resolveFixturePath,
} from "@internal/e2e-test-utils"
import { test as baseTest } from "@playwright/test"

import { AdminApp } from "./page-objects/admin-app"
import {
  buildTestRepoSeedManifest,
  type TestRepoSeedFile,
} from "./test-repo-storage"

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

const testRepoSeedManifests = new Map<string, Promise<TestRepoSeedFile[]>>()

const getTestRepoSeedManifest = (fixtureRoot: string) => {
  let manifest = testRepoSeedManifests.get(fixtureRoot)

  if (!manifest) {
    manifest = buildTestRepoSeedManifest(fixtureRoot)
    testRepoSeedManifests.set(fixtureRoot, manifest)
  }

  return manifest
}

const test = baseTest.extend<{
  admin: (backend?: AdminBackend) => Promise<AdminApp>
}>({
  admin: ({ page }, use) =>
    use(async (backend = "test-repo") => {
      const fixtureRoot = fixtureRoots[backend]
      const fixture = await createAstroFixturePage(fixtureRoot, page)
      const testRepoSeedManifest =
        backend === "test-repo"
          ? await getTestRepoSeedManifest(fixtureRoot)
          : undefined

      const app = new AdminApp(fixture, {
        testRepoSeedManifest,
      })
      await app.goto()
      return app
    }),
})

export { type AdminBackend, test }
