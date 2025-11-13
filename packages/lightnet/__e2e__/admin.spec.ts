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

test.describe("Media item edit page", () => {
  const recordWriteFile = async (page: Page) => {
    type WriteFileRequest = { url: string; body: unknown }
    let resolveWriteFileRequest: ((value: WriteFileRequest) => void) | null =
      null
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

  const getPublishButton = (page: Page) =>
    page.getByRole("button", { name: "Publish Changes" }).first()

  const expectPublishedMessage = (page: Page) =>
    expect(
      page.getByRole("button", { name: "Published" }).first(),
    ).toBeVisible()

  test("should edit title", async ({ page, startLightnet }) => {
    const ln = await startLightnet()

    const writeFileRequest = await recordWriteFile(page)

    await page.goto(ln.resolveURL("/en/admin/media/faithful-freestyle--en"))

    const updatedTitle = "Faithful Freestyle (Edited)"
    const titleInput = page.getByLabel("Title")
    await expect(titleInput).toHaveValue("Faithful Freestyle")
    await titleInput.fill(updatedTitle)

    const saveButton = getPublishButton(page)
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
    await expectPublishedMessage(page)
  })

  test("Should update media type", async ({ page, startLightnet }) => {
    const ln = await startLightnet()
    const writeFileRequest = await recordWriteFile(page)

    await page.goto(ln.resolveURL("/en/admin/media/faithful-freestyle--en"))

    const typeSelect = page.getByLabel("Type")
    await expect(typeSelect).toHaveValue("book")
    await typeSelect.selectOption("video")

    const saveButton = getPublishButton(page)
    await expect(saveButton).toBeEnabled()
    await saveButton.click()

    const { body } = await writeFileRequest()
    const expectedMediaItem = JSON.parse(
      await readFile(faithfulFreestyleMediaUrl, "utf-8"),
    )
    expect(body).toEqual({
      ...expectedMediaItem,
      type: "video",
    })
    await expectPublishedMessage(page)
  })

  test("Should update author name", async ({ page, startLightnet }) => {
    const ln = await startLightnet()
    const writeFileRequest = await recordWriteFile(page)

    await page.goto(ln.resolveURL("/en/admin/media/faithful-freestyle--en"))

    const authorsFieldset = page.getByRole("group", { name: "Authors" })
    const firstAuthorInput = authorsFieldset.getByRole("textbox").first()
    const updatedAuthor = "Sk8 Ministries International"
    await expect(firstAuthorInput).toHaveValue("Sk8 Ministries")
    await firstAuthorInput.fill(updatedAuthor)

    const saveButton = getPublishButton(page)
    await expect(saveButton).toBeEnabled()
    await saveButton.click()

    const { body } = await writeFileRequest()
    const expectedMediaItem = JSON.parse(
      await readFile(faithfulFreestyleMediaUrl, "utf-8"),
    )
    expect(body).toEqual({
      ...expectedMediaItem,
      authors: [updatedAuthor],
    })
    await expectPublishedMessage(page)
  })

  test("Should add author", async ({ page, startLightnet }) => {
    const ln = await startLightnet()
    const writeFileRequest = await recordWriteFile(page)

    await page.goto(ln.resolveURL("/en/admin/media/faithful-freestyle--en"))

    const authorsFieldset = page.getByRole("group", { name: "Authors" })
    const addAuthorButton = page.getByRole("button", { name: "Add Author" })
    await addAuthorButton.click()
    const newAuthorInput = authorsFieldset.getByRole("textbox").last()
    const additionalAuthor = "Tony Hawk"
    await newAuthorInput.fill(additionalAuthor)

    const saveButton = getPublishButton(page)
    await expect(saveButton).toBeEnabled()
    await saveButton.click()

    const { body } = await writeFileRequest()
    const expectedMediaItem = JSON.parse(
      await readFile(faithfulFreestyleMediaUrl, "utf-8"),
    )
    expect(body).toEqual({
      ...expectedMediaItem,
      authors: ["Sk8 Ministries", additionalAuthor],
    })
    await expectPublishedMessage(page)
  })

  test("Should remove author", async ({ page, startLightnet }) => {
    const ln = await startLightnet()
    const writeFileRequest = await recordWriteFile(page)

    await page.goto(ln.resolveURL("/en/admin/media/faithful-freestyle--en"))

    const authorsFieldset = page.getByRole("group", { name: "Authors" })
    const addAuthorButton = page.getByRole("button", { name: "Add Author" })
    const replacementAuthor = "Skate Evangelists"
    await addAuthorButton.click()
    const addedAuthorInput = authorsFieldset.getByRole("textbox").last()
    await addedAuthorInput.fill(replacementAuthor)

    const removeButtons = authorsFieldset.getByRole("button", {
      name: "Remove",
    })
    await removeButtons.first().click()

    const saveButton = getPublishButton(page)
    await expect(saveButton).toBeEnabled()
    await saveButton.click()

    const { body } = await writeFileRequest()
    const expectedMediaItem = JSON.parse(
      await readFile(faithfulFreestyleMediaUrl, "utf-8"),
    )
    expect(body).toEqual({
      ...expectedMediaItem,
      authors: [replacementAuthor],
    })
    await expectPublishedMessage(page)
  })

  test("should show error message if common id is set empty", async ({
    page,
    startLightnet,
  }) => {
    const ln = await startLightnet()
    await page.goto(ln.resolveURL("/en/admin/media/faithful-freestyle--en"))

    const commonIdInput = page.getByLabel("Common ID")
    await expect(commonIdInput).toHaveValue("faithful-freestyle")

    await commonIdInput.fill("")
    await commonIdInput.blur()

    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "Please enter at least one character." }),
    ).toBeVisible()
  })

  test("should focus invalid field when submitting invalid form data", async ({
    page,
    startLightnet,
  }) => {
    const ln = await startLightnet()
    await page.goto(ln.resolveURL("/en/admin/media/faithful-freestyle--en"))

    const categoriesFieldset = page.getByRole("group", { name: "Categories" })
    await page.getByRole("button", { name: "Add Category" }).click()
    const newCategorySelect = categoriesFieldset.getByRole("combobox").last()
    await expect(newCategorySelect).toHaveValue("")

    // move focus away so the submission handler needs to return focus
    await page.getByLabel("Title").click()

    const saveButton = getPublishButton(page)
    await saveButton.click()

    await expect(
      page.getByRole("alert").filter({ hasText: "This field is required." }),
    ).toBeVisible()
    await expect(newCategorySelect).toBeFocused()
  })

  test("should not allow assigning duplicate categories", async ({
    page,
    startLightnet,
  }) => {
    const ln = await startLightnet()
    await page.goto(ln.resolveURL("/en/admin/media/faithful-freestyle--en"))

    const categoriesFieldset = page.getByRole("group", { name: "Categories" })
    await page.getByRole("button", { name: "Add Category" }).click()

    const categorySelects = categoriesFieldset.getByRole("combobox")
    const firstCategoryValue = await categorySelects.first().inputValue()
    const duplicateCategorySelect = categorySelects.last()
    await duplicateCategorySelect.selectOption(firstCategoryValue)

    const publishButton = getPublishButton(page)
    await publishButton.click()

    const duplicateCategoryError = categoriesFieldset
      .getByRole("alert")
      .filter({ hasText: "Each entry needs a unique value." })
    await expect(duplicateCategoryError).toBeVisible()
    await expect(duplicateCategorySelect).toHaveAttribute(
      "aria-invalid",
      "true",
    )
  })
})
