import { expect, type Page } from "@playwright/test"

import { CollectionPage, collectionPaths } from "./collection-entries-page"

class CollectionsPage {
  constructor(private readonly page: Page) {}

  private sidebarOption(label: string) {
    return this.page.getByRole("option", { name: new RegExp(label) }).first()
  }

  private sidebarButton(label: string) {
    return this.page.locator("button").filter({ hasText: label }).first()
  }

  private async clickSidebarItem(label: string) {
    const option = this.sidebarOption(label)

    if ((await option.count()) > 0) {
      await option.click()
      return
    }

    await this.sidebarButton(label).click()
  }

  async expectVisibleCollections(labels: Array<keyof typeof collectionPaths>) {
    for (const label of labels) {
      const option = this.sidebarOption(label)

      if ((await option.count()) > 0) {
        await expect(option).toBeVisible()
        continue
      }

      await expect(this.sidebarButton(label)).toBeVisible()
    }
  }

  async openCollection(label: keyof typeof collectionPaths) {
    await this.clickSidebarItem(label)

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
