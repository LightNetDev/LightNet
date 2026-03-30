import { expect, type Page } from "@playwright/test"

import { EntryEditor } from "./entry-editor"

const collectionPaths = {
  Categories: "categories",
  Languages: "languages",
  "Media Collections": "media-collections",
  "Media Items": "media",
  "Media Types": "media-types",
} as const

class CollectionPage {
  constructor(
    private readonly page: Page,
    private readonly label: keyof typeof collectionPaths,
    private readonly singleton = false,
  ) {}

  private get collectionPath() {
    return collectionPaths[this.label]
  }

  private entrySummary(summary: string) {
    return this.page.getByText(summary, { exact: true }).first()
  }

  private createEntryButton() {
    return this.page.getByRole("button", { name: /Create New Entry/ }).first()
  }

  async createEntry() {
    if (this.singleton) {
      throw new Error(
        `Cannot create entries in singleton collection "${this.label}"`,
      )
    }

    await this.createEntryButton().click()
    await expect(this.page).toHaveURL(
      new RegExp(`#\\/collections\\/${this.collectionPath}\\/new$`),
    )
    await expect(this.page.getByRole("button", { name: "Save" })).toBeVisible()
    return new EntryEditor(this.page)
  }

  async expectEmptyState() {
    await expect(
      this.page.getByText("This collection has no entries yet."),
    ).toBeVisible()
  }

  async expectEntryVisible(summary: string) {
    await expect(this.entrySummary(summary)).toBeVisible()
  }

  async expectEntryNotVisible(summary: string) {
    await expect(this.entrySummary(summary)).toBeHidden()
  }

  async openEditor(summary?: string) {
    if (this.singleton) {
      await expect(this.page).toHaveURL(
        new RegExp(
          `#\\/collections\\/_singletons\\/entries\\/${this.collectionPath}$`,
        ),
      )
      await expect(
        this.page.getByRole("button", { name: "Save" }),
      ).toBeVisible()
      return new EntryEditor(this.page)
    }

    if (!summary) {
      throw new Error(
        `A summary is required to open an entry in "${this.label}"`,
      )
    }

    await this.entrySummary(summary).click()
    await expect(this.page).toHaveURL(
      new RegExp(`#\\/collections\\/${this.collectionPath}\\/entries\\/`),
    )
    await expect(this.page.getByRole("button", { name: "Save" })).toBeVisible()
    return new EntryEditor(this.page)
  }

  async selectEntry(summary: string) {
    const rowCheckbox = this.entrySummary(summary)
      .locator('xpath=ancestor::*[.//input[@type="checkbox"]][1]')
      .getByRole("checkbox")
      .first()

    if ((await rowCheckbox.count()) > 0) {
      await rowCheckbox.check()
      return
    }

    await this.page.getByRole("checkbox").nth(1).check()
  }

  async deleteSelectedEntry(summary?: string) {
    if (summary) {
      await this.selectEntry(summary)
    }

    await this.page
      .getByRole("button", { name: /Delete Selected Entr/ })
      .click()
    await expect(
      this.page.getByText("Delete Entry", { exact: true }),
    ).toBeVisible()
    await this.page.getByRole("button", { name: "Delete", exact: true }).click()
    await expect(
      this.page
        .getByRole("alert")
        .filter({ hasText: "Entry has been deleted." }),
    ).toBeVisible()
  }
}

export { CollectionPage, collectionPaths }
