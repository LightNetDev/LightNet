import { expect } from "@playwright/test"

import { test } from "./admin-fixture"

const faithfulSummary = "Faithful Freestyle (faithful-freestyle--en)"
const skateSoundsSummary = "Skate Sounds (skate-sounds--en)"

test.describe("Sveltia admin global search", () => {
  test("finds seeded items from global search", async ({ admin }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    const search = app.openGlobalSearch()
    await search.search("faithful")
    await search.expectResultVisible(faithfulSummary)
  })

  test("opens an item from search results", async ({ admin, page }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    const search = app.openGlobalSearch()
    await search.search("faithful")
    await search.openResult(faithfulSummary)

    await expect(page).toHaveURL(/#\/collections\/media\/entries\//)
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible()
  })

  test("clears the active search with the x button", async ({ admin }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    const search = app.openGlobalSearch()
    await search.search("faithful")
    await search.expectResultVisible(faithfulSummary)
    await search.clear()
    await search.expectQuery("")
    await search.expectResultVisible(faithfulSummary)
    await search.expectResultVisible(skateSoundsSummary)
  })

  test("does not leave stale results for a no-match query", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    const search = app.openGlobalSearch()
    await search.search("faithful")
    await search.expectResultVisible(faithfulSummary)
    await search.search("no-match-search-token")
    await search.expectResultNotVisible(faithfulSummary)
  })
})
