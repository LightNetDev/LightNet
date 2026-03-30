import { randomUUID } from "node:crypto"

import { resolveFixturePath } from "@internal/e2e-test-utils"
import { expect } from "@playwright/test"

import { test } from "./admin-fixture"
import { type AdminApp } from "./page-objects/admin-app"

const imagePath = resolveFixturePath(
  import.meta.url,
  "./fixtures/admin-test-repo/src/content/media/images/cover.jpg",
)

const uniqueSlug = (prefix: string) => `${prefix}-${randomUUID().slice(0, 8)}`

const seedLanguages = async (app: AdminApp) => {
  const languages = await app.openCollection("Languages")
  const editor = await languages.openEditor()

  await editor.expectFieldVisible("languages")
  await editor.expectTextVisible("English")
  await editor.cancel()
}

const seedCategory = async (app: AdminApp) => {
  const slug = uniqueSlug("discipleship")
  const categories = await app.openCollection("Categories")
  const editor = await categories.createEntry()

  await editor.getStringFieldByLabel("Slug").fill(slug)
  await editor.getStringFieldByKeyPath("label.en").fill("Discipleship")
  await editor.save()

  const summary = `Discipleship (${slug})`
  await categories.expectEntryVisible(summary)

  return { categories, slug, summary }
}

const seedMediaType = async (app: AdminApp) => {
  const slug = uniqueSlug("book")
  const mediaTypes = await app.openCollection("Media Types")
  const editor = await mediaTypes.createEntry()

  await editor.getStringFieldByLabel("Slug").fill(slug)
  await editor.getStringFieldByKeyPath("label.en").fill("Book")
  await editor.getStringFieldByKeyPath("icon").fill("lucide--book-open")
  await editor.getFieldByKeyPath("coverImageStyle").expectVisible()
  await editor
    .getRelationFieldByLabel("Cover Image Style")
    .selectOption("video")
  await editor
    .getTypedObjectFieldByKeyPath("detailsPage")
    .addTypedItem("Custom")
  await editor
    .getStringFieldByKeyPath("detailsPage.customComponent")
    .fill("src/components/CustomBook.astro")
  await editor.save()

  const summary = `Book (${slug})`
  await mediaTypes.expectEntryVisible(summary)

  return { mediaTypes, slug, summary }
}

const createMediaEntry = async (
  app: AdminApp,
  {
    slug,
    title,
    categorySlug,
    mediaTypeSlug,
  }: {
    categorySlug?: string
    mediaTypeSlug: string
    slug: string
    title: string
  },
) => {
  const mediaItems = await app.openCollection("Media Items")
  const editor = await mediaItems.createEntry()

  await editor.getStringFieldByLabel("Slug").fill(slug)
  await editor.getStringFieldByLabel("Title").fill(title)
  await editor
    .getRelationFieldByLabel("Type")
    .selectOption(`Book (${mediaTypeSlug})`)
  await editor.getRelationFieldByLabel("Language").selectOption("English (en)")
  await editor.getFileFieldByKeyPath("image").uploadFile(imagePath)
  await editor.getListFieldByKeyPath("content").addItem("Link")
  await editor
    .getStringFieldByKeyPath("content.0.url")
    .fill("https://example.com/library-item")
  await editor.getStringFieldByKeyPath("dateCreated").fill("2024-05-20")
  await editor.getStringFieldByKeyPath("commonId").fill(`common-${slug}`)

  if (categorySlug) {
    await editor
      .getRelationFieldByKeyPath("categories")
      .selectOption(categorySlug)
  }

  await editor.save()

  const summary = `${title} (${slug})`
  await mediaItems.expectEntryVisible(summary)

  return { mediaItems, summary }
}

test.describe("Sveltia admin content flows", () => {
  test("edits languages and categories with reopen and cancel coverage", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    await seedLanguages(app)

    const slug = uniqueSlug("discipleship")
    const categories = await app.openCollection("Categories")
    const editor = await categories.createEntry()

    await editor.getStringFieldByLabel("Slug").fill(slug)
    await editor.getStringFieldByKeyPath("label.en").fill("Discipleship")
    await editor.save()

    let summary = `Discipleship (${slug})`
    await categories.expectEntryVisible(summary)

    const reopened = await categories.openEditor(summary)
    await reopened
      .getStringFieldByKeyPath("label.en")
      .fill("Discipleship Updated")
    await reopened.save()

    summary = `Discipleship Updated (${slug})`
    await categories.expectEntryVisible(summary)

    const reopenedAgain = await categories.openEditor(summary)
    await reopenedAgain.cancel()
    await categories.expectEntryVisible(summary)
  })

  test("configures media type details page variants", async ({ admin }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()
    const { mediaTypes, summary } = await seedMediaType(app)

    const reopened = await mediaTypes.openEditor(summary)
    const detailsText = await reopened.getFieldByKeyPath("detailsPage").text()
    expect(detailsText).toContain("Custom")
  })

  test("creates, edits, and deletes media items while covering relation fields", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    await seedLanguages(app)
    const { slug: categorySlug } = await seedCategory(app)
    const { slug: mediaTypeSlug } = await seedMediaType(app)

    const slug = uniqueSlug("media")
    const { mediaItems, summary } = await createMediaEntry(app, {
      categorySlug,
      mediaTypeSlug,
      slug,
      title: "Library Item",
    })

    const reopened = await mediaItems.openEditor(summary)
    await reopened.getStringFieldByLabel("Title").fill("Library Item Updated")
    await reopened.save()

    const updatedSummary = `Library Item Updated (${slug})`
    await mediaItems.expectEntryVisible(updatedSummary)

    await mediaItems.deleteSelectedEntry(updatedSummary)
    await mediaItems.expectEntryNotVisible(updatedSummary)
  })

  test("shows both link and upload content shells for media items", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()
    const mediaItems = await app.openCollection("Media Items")
    const editor = await mediaItems.createEntry()

    await editor.getListFieldByKeyPath("content").addItem("Link")
    await editor
      .getStringFieldByKeyPath("content.0.url")
      .fill("https://example.com/another-link")
    await editor.expectFieldVisible("content.0.url")

    await editor.getListFieldByKeyPath("content").addItem("File Upload")
    await editor
      .getFileFieldByKeyPath("content.1.url")
      .expectUploadShellVisible()
    const contentText = await editor.getFieldByKeyPath("content").text()
    expect(contentText).toContain("File Upload")
    expect(contentText).toContain("Link")
  })

  test("stores media collection item order", async ({ admin }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    await seedLanguages(app)
    await seedCategory(app)
    const { slug: mediaTypeSlug } = await seedMediaType(app)

    const firstSlug = uniqueSlug("first")
    const first = await createMediaEntry(app, {
      mediaTypeSlug,
      slug: firstSlug,
      title: "First Lesson",
    })
    const secondSlug = uniqueSlug("second")
    const second = await createMediaEntry(app, {
      mediaTypeSlug,
      slug: secondSlug,
      title: "Second Lesson",
    })

    const mediaCollections = await app.openCollection("Media Collections")
    const editor = await mediaCollections.createEntry()
    const collectionSlug = uniqueSlug("course")

    await editor.getStringFieldByLabel("Slug").fill(collectionSlug)
    await editor.getStringFieldByKeyPath("label.en").fill("Starter Course")
    await editor.getListFieldByKeyPath("mediaItems").addItem()
    await editor
      .getComboboxFieldByLabel("Media Item", 0)
      .selectOption(first.summary)
    await editor.getListFieldByKeyPath("mediaItems").addItem()
    await editor
      .getComboboxFieldByLabel("Media Item", 1)
      .selectOption(second.summary)
    await editor.save()

    const summary = `Starter Course (${collectionSlug})`
    await mediaCollections.expectEntryVisible(summary)

    const reopened = await mediaCollections.openEditor(summary)
    const mediaItemsField = reopened.getListFieldByKeyPath("mediaItems")
    const firstPosition = await mediaItemsField.getItemTextYPosition(
      first.summary,
    )
    const secondPosition = await mediaItemsField.getItemTextYPosition(
      second.summary,
    )
    expect(firstPosition).toBeLessThan(secondPosition)
  })
})
