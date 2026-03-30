import { expect, test } from "./admin-fixture"

test.describe("Sveltia admin smoke", () => {
  test("seeds the test repository before entering the admin flow", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    const initialStorageEntries = await app.page.evaluate(async () => {
      const rootHandle = await navigator.storage.getDirectory()
      const entries = []

      for await (const [name] of rootHandle.entries()) {
        entries.push(name)
      }

      return entries
    })

    expect(initialStorageEntries).toEqual([])

    await app.enterTestRepository()
    await app.expectVisibleCollections([
      "Media Items",
      "Categories",
      "Media Collections",
      "Media Types",
      "Languages",
    ])
  })

  test("boots the test-repo admin with the expected collections", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

    await app.page
      .getByRole("alert")
      .filter({ hasText: /There were errors while parsing entry files/ })
      .waitFor({ state: "detached" })

    await app.expectVisibleCollections([
      "Media Items",
      "Categories",
      "Media Collections",
      "Media Types",
      "Languages",
    ])

    const languages = await app.openCollection("Languages")
    const editor = await languages.openEditor()
    await editor.expectFieldVisible("languages")
  })

  test("shows the local repository workflow entrance", async ({ admin }) => {
    const app = await admin("local-repo")
    await app.expectLocalRepositoryEntrance()
  })
})
