import { randomUUID } from "node:crypto"

import { resolveFixturePath } from "@internal/e2e-test-utils"
import { expect } from "@playwright/test"

import { test } from "./admin-fixture"
import { type AdminApp } from "./page-objects/admin-app"
import { toTestRepositoryPath } from "./test-repo-storage"

const imagePath = resolveFixturePath(
  import.meta.url,
  "./fixtures/admin-test-repo/src/content/media/images/cover.jpg",
)

const mediaItemAssetName = "cover.jpg"
const categoryAssetName = "cover.jpg"

const uniqueSlug = (prefix: string) => `${prefix}-${randomUUID().slice(0, 8)}`

const seedMediaItem = async (
  app: AdminApp,
  {
    slug,
    title,
    contentUrl = "https://example.com/media-item",
  }: {
    contentUrl?: string
    slug: string
    title: string
  },
) => {
  const mediaItems = await app.openCollection("Media Items")
  const editor = await mediaItems.createEntry()

  await editor.getStringFieldByLabel("Slug").fill(slug)
  await editor.getStringFieldByLabel("Title").fill(title)
  await editor.getRelationFieldByLabel("Type").selectOption("Book (book)")
  await editor.getRelationFieldByLabel("Language").selectOption("English (en)")
  await editor.getFileFieldByKeyPath("image").uploadFile(imagePath)
  await editor.getListFieldByKeyPath("content").addItem("Link")
  await editor.getStringFieldByKeyPath("content.0.url").fill(contentUrl)
  await editor.getStringFieldByKeyPath("dateCreated").fill("2024-05-20")
  await editor.save()

  return {
    mediaItems,
    summary: `${title} (${slug})`,
  }
}

test.describe("Sveltia admin fixed regressions", () => {
  test("#704 hides the generated slug field when reopening existing media items", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    const slug = uniqueSlug("regression-media")
    const mediaItems = await app.openCollection("Media Items")
    const editor = await mediaItems.createEntry()

    await editor.getFieldByLabel("Slug").expectVisible()
    await editor.getStringFieldByLabel("Slug").fill(slug)
    await editor.getStringFieldByLabel("Title").fill("Regression Media")
    await editor.getRelationFieldByLabel("Type").selectOption("Book (book)")
    await editor
      .getRelationFieldByLabel("Language")
      .selectOption("English (en)")
    await editor.getFileFieldByKeyPath("image").uploadFile(imagePath)
    await editor.getListFieldByKeyPath("content").addItem("Link")
    await editor
      .getStringFieldByKeyPath("content.0.url")
      .fill("https://example.com/regression-media")
    await editor.getStringFieldByKeyPath("dateCreated").fill("2024-05-20")
    await editor.save()

    const summary = `Regression Media (${slug})`
    await mediaItems.expectEntryVisible(summary)

    const reopened = await mediaItems.openEditor(summary)
    await reopened.getFieldByLabel("Slug").expectHidden()
    await reopened.save()
  })

  test("#690 restores deleted media collection list items through field revert", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    const first = await seedMediaItem(app, {
      slug: uniqueSlug("revert-first"),
      title: "Revert First",
    })
    const second = await seedMediaItem(app, {
      slug: uniqueSlug("revert-second"),
      title: "Revert Second",
    })

    const mediaCollections = await app.openCollection("Media Collections")
    const editor = await mediaCollections.createEntry()
    const collectionSlug = uniqueSlug("revert-collection")

    await editor.getStringFieldByLabel("Slug").fill(collectionSlug)
    await editor.getStringFieldByKeyPath("label.en").fill("Revert Collection")
    await editor.getListFieldByKeyPath("mediaItems").addItem()
    await editor
      .getComboboxFieldByLabel("Media Item", 0)
      .selectOption(first.summary)
    await editor.getListFieldByKeyPath("mediaItems").addItem()
    await editor
      .getComboboxFieldByLabel("Media Item", 1)
      .selectOption(second.summary)
    await editor.save()

    const summary = `Revert Collection (${collectionSlug})`
    const reopened = await mediaCollections.openEditor(summary)

    await reopened
      .getListFieldByKeyPath("mediaItems")
      .removeItemByText(second.summary)
    await reopened.expectTextNotVisible(second.summary)
    await reopened.getFieldByKeyPath("mediaItems").revertChanges()
    await reopened.expectTextVisible(second.summary)
  })

  test("#689 shows existing sibling media assets in the image field browser", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    const mediaItems = await app.openCollection("Media Items")
    const editor = await mediaItems.createEntry()

    await editor.getFileFieldByKeyPath("image").openAssetBrowser()
    await editor.getFileFieldByKeyPath("image").openFieldAssets()
    await editor
      .getFileFieldByKeyPath("image")
      .expectAssetVisible(mediaItemAssetName)
  })

  test("#697 shows existing sibling category assets for ./images fields", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    const categories = await app.openCollection("Categories")
    const editor = await categories.createEntry()

    await editor.getFileFieldByKeyPath("image").openAssetBrowser()
    await editor.getFileFieldByKeyPath("image").openFieldAssets()
    await editor
      .getFileFieldByKeyPath("image")
      .expectAssetVisible(categoryAssetName)
  })

  test("#678 omits empty optional inline translation objects in media item content", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    const slug = uniqueSlug("omit-empty")
    const summary = `Omit Empty (${slug})`
    const mediaItems = await app.openCollection("Media Items")
    const editor = await mediaItems.createEntry()

    await editor.getStringFieldByLabel("Slug").fill(slug)
    await editor.getStringFieldByLabel("Title").fill("Omit Empty")
    await editor.getRelationFieldByLabel("Type").selectOption("Book (book)")
    await editor
      .getRelationFieldByLabel("Language")
      .selectOption("English (en)")
    await editor.getFileFieldByKeyPath("image").uploadFile(imagePath)
    await editor.getListFieldByKeyPath("content").addItem("Link")
    await editor
      .getStringFieldByKeyPath("content.0.url")
      .fill("https://example.com/omit-empty")
    await editor.getStringFieldByKeyPath("dateCreated").fill("2024-05-20")
    await editor.save()

    const savedEntryPath = resolveFixturePath(
      import.meta.url,
      `./fixtures/admin-test-repo/src/content/media/${slug}.json`,
    )

    const saved = JSON.parse(
      await app.readTestRepositoryTextFile(
        toTestRepositoryPath(savedEntryPath),
      ),
    ) as { content: Array<Record<string, unknown>> }

    expect(saved.content[0]).not.toHaveProperty("label")
    await mediaItems.expectEntryVisible(summary)
  })
})
