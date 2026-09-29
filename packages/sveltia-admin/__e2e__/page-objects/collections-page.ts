import { expect, type Page } from "@playwright/test"

import { CollectionPage, collectionPaths } from "./collection-entries-page"

class CollectionsPage {
  constructor(private readonly page: Page) {}

  private sidebarItem(label: string) {
    return this.page.getByRole("treeitem", { name: label })
  }

  async expectVisibleCollections(labels: Array<keyof typeof collectionPaths>) {
    for (const label of labels) {
      await expect(this.sidebarItem(label)).toBeVisible()
    }
  }

  async openCollection(label: keyof typeof collectionPaths) {
    await this.sidebarItem(label).click()

    if (label === "Languages") {
      await expect(this.page).toHaveURL(
        /#\/collections\/_singletons\/entries\/languages/,
      )
      return new CollectionPage(this.page, label, true)
    }

    await expect(this.page).toHaveURL(
      new RegExp(`#\\/collections\\/${collectionPaths[label]}$`),
    )
    return new CollectionPage(this.page, label)
  }
}

export { CollectionsPage }
