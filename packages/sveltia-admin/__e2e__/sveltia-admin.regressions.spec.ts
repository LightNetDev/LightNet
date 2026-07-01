import { randomUUID } from "node:crypto"
import { readFile } from "node:fs/promises"

import { resolveFixturePath } from "@internal/e2e-test-utils"
import { expect } from "@playwright/test"

import { test } from "./admin-fixture"
import { type AdminApp } from "./page-objects/admin-app"
import { toTestRepositoryPath } from "./test-repo-storage"

const imagePath = resolveFixturePath(
  import.meta.url,
  "./fixtures/admin-test-repo/src/content/media/images/cover.jpg",
)
const nonConflictingImagePath = resolveFixturePath(
  import.meta.url,
  "./fixtures/admin-test-repo/src/assets/logo.png",
)
const replacementFilePath = resolveFixturePath(
  import.meta.url,
  "./fixtures/uploads/example.pdf",
)
const existingFilePath = resolveFixturePath(
  import.meta.url,
  "./fixtures/admin-test-repo/public/files/example.pdf",
)

const mediaItemAssetName = "cover.jpg"
const categoryAssetName = "cover.jpg"

const uniqueSlug = (prefix: string) => `${prefix}-${randomUUID().slice(0, 8)}`
const readBase64 = async (path: string) =>
  (await readFile(path)).toString("base64")

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
  await editor.getRelationFieldByLabel("Media Type").selectOption("Book (book)")
  await editor
    .getRelationFieldByLabel("Content Language")
    .selectOption("English (en)")
  await editor.getFileFieldByKeyPath("image").uploadFile(imagePath)
  await editor.getListFieldByKeyPath("content").addItem("Link")
  await editor.getStringFieldByKeyPath("content.0.url").fill(contentUrl)
  await editor.getStringFieldByKeyPath("dateCreated").fill("2024-05-20")
  await editor.save()

  return {
    mediaItems,
    summary: title,
    relationSummary: `${title} (${slug})`,
  }
}

const seedMediaItemWithUploadedFile = async (
  app: AdminApp,
  {
    duplicateAction,
    slug,
    title,
  }: {
    duplicateAction: "keep" | "replace"
    slug: string
    title: string
  },
) => {
  const mediaItems = await app.openCollection("Media Items")
  const editor = await mediaItems.createEntry()

  await editor.getStringFieldByLabel("Slug").fill(slug)
  await editor.getStringFieldByLabel("Title").fill(title)
  await editor.getRelationFieldByLabel("Media Type").selectOption("Book (book)")
  await editor
    .getRelationFieldByLabel("Content Language")
    .selectOption("English (en)")
  await editor
    .getFileFieldByKeyPath("image")
    .uploadFile(nonConflictingImagePath)
  await editor.getListFieldByKeyPath("content").addItem("File Upload")
  await editor
    .getFileFieldByKeyPath("content.0.url")
    .uploadFile(replacementFilePath, { duplicateAction })
  await editor.getStringFieldByKeyPath("dateCreated").fill("2024-05-20")
  await editor.save()

  const savedEntryPath = resolveFixturePath(
    import.meta.url,
    `./fixtures/admin-test-repo/src/content/media/${slug}.json`,
  )
  const saved = JSON.parse(
    await app.readTestRepositoryTextFile(toTestRepositoryPath(savedEntryPath)),
  ) as { content: Array<{ url: string }> }

  return { mediaItems, saved }
}

test.describe("Sveltia admin fixed regressions", () => {
  test("#704 keeps the ID generation field value when reopening existing media items", async ({
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
    await editor
      .getRelationFieldByLabel("Media Type")
      .selectOption("Book (book)")
    await editor
      .getRelationFieldByLabel("Content Language")
      .selectOption("English (en)")
    await editor.getFileFieldByKeyPath("image").uploadFile(imagePath)
    await editor.getListFieldByKeyPath("content").addItem("Link")
    await editor
      .getStringFieldByKeyPath("content.0.url")
      .fill("https://example.com/regression-media")
    await editor.getStringFieldByKeyPath("dateCreated").fill("2024-05-20")
    await editor.save()

    const savedEntryPath = resolveFixturePath(
      import.meta.url,
      `./fixtures/admin-test-repo/src/content/media/${slug}.json`,
    )
    const summary = "Regression Media"
    await mediaItems.expectEntryVisible(summary)

    const reopened = await mediaItems.openEditor(summary)
    await reopened.getFieldByLabel("Title").expectVisible()
    await reopened.save()

    const saved = JSON.parse(
      await app.readTestRepositoryTextFile(
        toTestRepositoryPath(savedEntryPath),
      ),
    ) as { title: string }

    expect(saved.title).toBe("Regression Media")
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
      .selectOption(first.relationSummary)
    await editor.getListFieldByKeyPath("mediaItems").addItem()
    await editor
      .getComboboxFieldByLabel("Media Item", 1)
      .selectOption(second.relationSummary)
    await editor.save()

    const summary = "Revert Collection"
    const reopened = await mediaCollections.openEditor(summary)

    await reopened
      .getListFieldByKeyPath("mediaItems")
      .removeItemByText(second.relationSummary)
    await reopened.expectTextNotVisible(second.relationSummary)
    await reopened.getFieldByKeyPath("mediaItems").revertChanges()
    await reopened.expectTextVisible(second.relationSummary)
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
    const summary = "Omit Empty"
    const mediaItems = await app.openCollection("Media Items")
    const editor = await mediaItems.createEntry()

    await editor.getStringFieldByLabel("Slug").fill(slug)
    await editor.getStringFieldByLabel("Title").fill("Omit Empty")
    await editor
      .getRelationFieldByLabel("Media Type")
      .selectOption("Book (book)")
    await editor
      .getRelationFieldByLabel("Content Language")
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

  test("replaces duplicated upload files when requested", async ({ admin }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    const existingFileRepoPath = toTestRepositoryPath(existingFilePath)
    const originalFile =
      await app.readTestRepositoryBase64File(existingFileRepoPath)
    const replacementFile = await readBase64(replacementFilePath)

    expect(originalFile).not.toBe(replacementFile)

    const { saved } = await seedMediaItemWithUploadedFile(app, {
      duplicateAction: "replace",
      slug: uniqueSlug("replace-file"),
      title: "Replace File",
    })

    await expect
      .poll(() => app.readTestRepositoryBase64File(existingFileRepoPath))
      .toBe(replacementFile)
    expect(saved.content[0].url).toBe("/files/example.pdf")
  })

  test("keeps both duplicated upload files when requested", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    const existingFileRepoPath = toTestRepositoryPath(existingFilePath)
    const renamedFileRepoPath = existingFileRepoPath.replace(
      /example\.pdf$/,
      "example-1.pdf",
    )
    const originalFile =
      await app.readTestRepositoryBase64File(existingFileRepoPath)
    const replacementFile = await readBase64(replacementFilePath)

    const { saved } = await seedMediaItemWithUploadedFile(app, {
      duplicateAction: "keep",
      slug: uniqueSlug("keep-file"),
      title: "Keep File",
    })

    await expect
      .poll(() => app.readTestRepositoryBase64File(existingFileRepoPath))
      .toBe(originalFile)
    await expect
      .poll(() => app.readTestRepositoryBase64File(renamedFileRepoPath))
      .toBe(replacementFile)
    expect(saved.content[0].url).toBe("/files/example-1.pdf")
  })
})
