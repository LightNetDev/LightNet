import { expect } from "@playwright/test"

import { test } from "./basics-fixture"

test("Search should have heading section and URL", async ({
  page,
  lightnet,
}) => {
  const ln = await lightnet()

  await page.getByLabel("Search").click()
  await expect(page.getByRole("heading", { name: "Search" })).toBeVisible()
  await expect(page).toHaveURL(ln.resolveURL("/en/media"))
})
