import type { AstroFixturePage } from "@internal/e2e-test-utils"
import { expect } from "@playwright/test"

import {
  readTestRepositoryTextFile,
  seedTestRepository,
  type TestRepoSeedFile,
} from "../test-repo-storage"
import { collectionPaths } from "./collection-entries-page"
import { CollectionsPage } from "./collections-page"
import { GlobalSearch } from "./global-search"

type CollectionLabel = keyof typeof collectionPaths
type AdminAppOptions = {
  testRepoSeedManifest?: TestRepoSeedFile[]
}

class AdminApp {
  private testRepositoryPrepared = false

  constructor(
    private readonly fixture: AstroFixturePage,
    private readonly options: AdminAppOptions = {},
  ) {}

  get page() {
    return this.fixture.page
  }

  private get collections() {
    return new CollectionsPage(this.page)
  }

  private get globalSearch() {
    return new GlobalSearch(this.page)
  }

  async goto(path = "/admin/index.html") {
    await this.fixture.goto(path)
    await expect(
      this.page.getByText("LightNet Admin", { exact: true }),
    ).toBeVisible()
  }

  async prepareTestRepository() {
    if (
      this.testRepositoryPrepared ||
      !this.options.testRepoSeedManifest?.length
    ) {
      return
    }

    await seedTestRepository(this.page, this.options.testRepoSeedManifest)
    this.testRepositoryPrepared = true
  }

  async enterTestRepository() {
    await this.prepareTestRepository()
    await this.page
      .getByRole("button", { name: /Work with Test Repository/ })
      .click()
    await expect(this.page).toHaveURL(/#\/collections\/media/)
  }

  readTestRepositoryTextFile(path: string) {
    return readTestRepositoryTextFile(this.page, path)
  }

  openCollection(label: CollectionLabel) {
    return this.collections.openCollection(label)
  }

  openGlobalSearch() {
    return this.globalSearch
  }

  expectVisibleCollections(labels: CollectionLabel[]) {
    return this.collections.expectVisibleCollections(labels)
  }

  async expectLocalRepositoryEntrance() {
    await expect(
      this.page.getByRole("button", { name: /Work with Local Repository/ }),
    ).toBeVisible()
    await expect(this.page.getByText(/local-repository/)).toBeVisible()
    await expect(
      this.page.getByRole("button", { name: /^Sign In with GitHub$/ }),
    ).toBeVisible()
    await expect(
      this.page.getByRole("button", {
        name: /Sign In with GitHub Using Token/,
      }),
    ).toBeVisible()
  }
}

export { AdminApp, type CollectionLabel }
