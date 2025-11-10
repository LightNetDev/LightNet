import { expect } from "@playwright/test"

import { lightnetTest } from "./test-utils"

const test = lightnetTest("./fixtures/basics/")

test.describe("Edit button on details page", () => {
  test("Should not show `Edit` button on details page by default.", async ({
    page,
    startLightnet,
  }) => {
    await startLightnet()

    await page.getByRole("link", { name: "Faithful Freestyle" }).click()
    await expect(
      page.getByRole("heading", { name: "Faithful Freestyle" }),
    ).toBeVisible()

    const editButton = page.locator("#edit-btn")
    await expect(editButton).toBeHidden()
  })

  test("Should show `Edit` button on book details page after visiting `/en/admin/` path.", async ({
    page,
    startLightnet,
  }) => {
    const ln = await startLightnet()

    await page.goto(ln.resolveURL("/en/admin/"))
    await expect(
      page.getByText("Admin features are enabled now.", { exact: true }),
    ).toBeVisible()

    await page.goto(ln.resolveURL("/en/media/faithful-freestyle--en"))
    await expect(
      page.getByRole("heading", { name: "Faithful Freestyle" }),
    ).toBeVisible()

    const editButton = page.locator("#edit-btn")
    await expect(editButton).toBeVisible()
    await expect(editButton).toHaveAttribute(
      "href",
      "/en/admin/media/faithful-freestyle--en",
    )
  })

  test("Should show `Edit` button on video details page after visiting `/en/admin/` path.", async ({
    page,
    startLightnet,
  }) => {
    const ln = await startLightnet()

    await page.goto(ln.resolveURL("/en/admin/"))
    await expect(
      page.getByText("Admin features are enabled now.", { exact: true }),
    ).toBeVisible()

    await page.goto(ln.resolveURL("/en/media/how-to-kickflip--de"))
    await expect(
      page.getByRole("heading", { name: "Kickflip Anleitung" }),
    ).toBeVisible()

    const editButton = page.locator("#edit-btn")
    await expect(editButton).toBeVisible()
    await expect(editButton).toHaveAttribute(
      "href",
      "/en/admin/media/how-to-kickflip--de",
    )
  })

  test("Should show `Edit` button on audio details page after visiting `/en/admin/` path.", async ({
    page,
    startLightnet,
  }) => {
    const ln = await startLightnet()

    await page.goto(ln.resolveURL("/en/admin/"))
    await expect(
      page.getByText("Admin features are enabled now.", { exact: true }),
    ).toBeVisible()

    await page.goto(ln.resolveURL("/en/media/skate-sounds--en"))
    await expect(
      page.getByRole("heading", { name: "Skate Sounds" }),
    ).toBeVisible()

    const editButton = page.locator("#edit-btn")
    await expect(editButton).toBeVisible()
    await expect(editButton).toHaveAttribute(
      "href",
      "/en/admin/media/skate-sounds--en",
    )
  })

  test("Edit button on details page should navigate to media item edit page", async ({
    page,
    startLightnet,
  }) => {
    const ln = await startLightnet()

    await page.goto(ln.resolveURL("/en/admin/"))
    await page.goto(ln.resolveURL("/en/media/faithful-freestyle--en"))

    const editButton = page.locator("#edit-btn")
    await expect(editButton).toBeVisible()

    await editButton.click()
    await expect(page).toHaveURL(
      ln.resolveURL("/en/admin/media/faithful-freestyle--en"),
    )
    await expect(
      page.getByText("Edit media item", { exact: false }),
    ).toBeVisible()
  })
})
