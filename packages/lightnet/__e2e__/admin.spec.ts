import { readFile } from "node:fs/promises"

import { expect, type Page } from "@playwright/test"

import { lightnetTest } from "./test-utils"

const test = lightnetTest("./fixtures/basics/")
const faithfulFreestyleMediaUrl = new URL(
  "./fixtures/basics/src/content/media/faithful-freestyle--en.json",
  import.meta.url,
)

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

const recordWriteFile = async (page: Page) => {
  type WriteFileRequest = { url: string; body: unknown }
  let resolveWriteFileRequest: ((value: WriteFileRequest) => void) | null = null
  const writeFileRequestPromise = new Promise<WriteFileRequest>((resolve) => {
    resolveWriteFileRequest = resolve
  })
  await page.route("**/api/internal/fs/write-file?*", async (route) => {
    const request = route.request()
    resolveWriteFileRequest?.({
      url: request.url(),
      body: JSON.parse(request.postData() ?? ""),
    })
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "ok" }),
    })
  })
  return () => writeFileRequestPromise
}

test.describe("Media item edit page", () => {
  test("should edit title", async ({ page, startLightnet }) => {
    const ln = await startLightnet()

    const writeFileRequest = await recordWriteFile(page)

    await page.goto(ln.resolveURL("/en/admin/media/faithful-freestyle--en"))

    const updatedTitle = "Faithful Freestyle (Edited)"
    const titleInput = page.getByLabel("Title")
    await expect(titleInput).toHaveValue("Faithful Freestyle")
    await titleInput.fill(updatedTitle)

    const saveButton = page.getByRole("button", { name: "Save" })
    await expect(saveButton).toBeEnabled()
    await saveButton.click()

    const { url, body } = await writeFileRequest()
    expect(url).toContain(
      "/api/internal/fs/write-file?path=src%2Fcontent%2Fmedia%2Ffaithful-freestyle--en.json",
    )

    const expectedMediaItem = JSON.parse(
      await readFile(faithfulFreestyleMediaUrl, "utf-8"),
    )
    expect(body).toEqual({
      ...expectedMediaItem,
      title: updatedTitle,
    })
    await expect(page.getByRole("button", { name: "Saved" })).toBeVisible()
  })
})
