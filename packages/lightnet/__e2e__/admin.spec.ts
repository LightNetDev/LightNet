import { expect } from "@playwright/test"

import { test } from "./basics-fixture"

test.describe("Edit button on details page", () => {
  test("Should not show `Edit` button on details page by default.", async ({
    page,
    lightnet,
  }) => {
    await lightnet()

    await page.getByRole("link", { name: "Faithful Freestyle" }).click()
    await expect(
      page.getByRole("heading", { name: "Faithful Freestyle" }),
    ).toBeVisible()

    const editButton = page.locator("#edit-btn")
    await expect(editButton).toBeHidden()
  })
})
