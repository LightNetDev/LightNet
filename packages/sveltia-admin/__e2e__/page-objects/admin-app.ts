import type { AstroFixturePage } from "@internal/e2e-test-utils"
import { expect } from "@playwright/test"

import { collectionPaths } from "./collection-entries-page"
import { CollectionsPage } from "./collections-page"
import { GlobalSearch } from "./global-search"

type CollectionLabel = keyof typeof collectionPaths

class AdminApp {
  constructor(private readonly fixture: AstroFixturePage) {}

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

  async enterTestRepository() {
    await this.page
      .getByRole("button", { name: /Work with Test Repository/ })
      .click()
    await expect(this.page).toHaveURL(/#\/collections\/media/)
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
