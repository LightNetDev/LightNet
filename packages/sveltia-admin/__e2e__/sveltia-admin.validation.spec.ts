import { randomUUID } from "node:crypto"

import { test } from "./admin-fixture"

const uniqueSlug = (prefix: string) => `${prefix}-${randomUUID().slice(0, 8)}`

test.describe("Sveltia admin validation", () => {
  test("requires the default locale translation for categories", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()
    const categories = await app.openCollection("Categories")
    const editor = await categories.createEntry()

    await editor.getStringFieldByLabel("Slug").fill(uniqueSlug("category"))
    await editor.attemptSave()
    await editor
      .getFieldByKeyPath("label.en")
      .expectValidationMessage("This field is required.")
  })

  test("validates media type icon names", async ({ admin }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()
    const mediaTypes = await app.openCollection("Media Types")
    const editor = await mediaTypes.createEntry()

    await editor.getStringFieldByLabel("Slug").fill(uniqueSlug("media-type"))
    await editor.getStringFieldByKeyPath("label.en").fill("Broken Icon")
    await editor.getStringFieldByKeyPath("icon").fill("book-open")
    await editor.attemptSave()
    await editor
      .getFieldByKeyPath("icon")
      .expectValidationMessage("Icon name must start with mdi-- or lucide--")
  })

  test("shows BCP 47 guidance in the languages singleton", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()
    const languages = await app.openCollection("Languages")
    const editor = await languages.openEditor()

    await editor.getListFieldByKeyPath("languages").addItem()
    await editor.expectFieldVisible("languages")
    await editor.expectTextVisible(/Enter a valid IETF BCP 47 language tag/)
  })

  test("validates required media titles and link urls", async ({ admin }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()
    const mediaItems = await app.openCollection("Media Items")
    const editor = await mediaItems.createEntry()

    await editor.getStringFieldByLabel("Slug").fill(uniqueSlug("media"))
    await editor.getListFieldByKeyPath("content").addItem("Link")
    await editor
      .getStringFieldByKeyPath("content.0.url")
      .fill("example.com/watch")
    await editor.attemptSave()
    await editor
      .getFieldByKeyPath("title")
      .expectValidationMessage("This field is required.")
    await editor
      .getFieldByKeyPath("content.0.url")
      .expectValidationMessage("Link must start with http(s)://")
  })
})
