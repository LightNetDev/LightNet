import { test } from "./admin-fixture"

test.describe("Sveltia admin smoke", () => {
  test("boots the test-repo admin with the expected collections", async ({
    admin,
  }) => {
    const app = await admin("test-repo")
    await app.enterTestRepository()

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
