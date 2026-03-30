import { expect, type Page } from "@playwright/test"

class GlobalSearch {
  constructor(private readonly page: Page) {}

  private trigger() {
    return this.page.getByRole("button", { name: /search/i }).first()
  }

  private dialog() {
    return this.page.getByRole("dialog").first()
  }

  private resultsRegion() {
    return this.page
      .getByRole("group", { name: /search results/i })
      .or(this.page.getByRole("grid", { name: /entries/i }))
      .first()
  }

  private searchbox() {
    return this.page
      .getByRole("searchbox")
      .or(this.dialog().getByRole("textbox", { name: /search/i }))
      .first()
  }

  private result(summary: string) {
    return this.page
      .getByRole("row", {
        name: new RegExp(summary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      })
      .or(this.resultsRegion().getByText(summary, { exact: true }))
      .first()
  }

  private clearButton() {
    return this.page.getByRole("button", { name: /clear|reset/i }).first()
  }

  async open() {
    if (
      await this.searchbox()
        .isVisible()
        .catch(() => false)
    ) {
      return
    }

    await this.trigger().click()
    await expect(this.searchbox()).toBeVisible()
  }

  async search(query: string) {
    await this.open()
    await this.searchbox().fill(query)
    await expect(this.searchbox()).toHaveValue(query)
  }

  expectQuery(query: string) {
    return expect(this.searchbox()).toHaveValue(query)
  }

  expectResultVisible(summary: string) {
    return expect(this.result(summary)).toBeVisible()
  }

  expectResultNotVisible(summary: string) {
    return expect(this.result(summary)).toBeHidden()
  }

  async openResult(summary: string) {
    await this.result(summary).click()
  }

  async clear() {
    await this.clearButton().click()
    await expect(this.searchbox()).toHaveValue("")
  }
}

export { GlobalSearch }
