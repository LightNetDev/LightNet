import { expect } from "@playwright/test"

import { lightnetTest } from "./test-utils"

const test = lightnetTest("./fixtures/basics/")

test("Should have title set", async ({ page, startLightnet }) => {
  await startLightnet()
  await expect(page).toHaveTitle("Basic Test")
})

test("Should have header title that navigates to home page", async ({
  page,
  startLightnet,
}) => {
  const ln = await startLightnet()
  await page.getByRole("link", { name: "Basic Test" }).click()

  await expect(page).toHaveURL(ln.resolveURL("/en/"))
})

test("Should have item section", async ({ page, startLightnet }) => {
  await startLightnet()
  await expect(page.getByRole("heading", { name: "All items" })).toBeVisible()
})

test("Should navigate to search page from main menu", async ({
  page,
  startLightnet,
}) => {
  const ln = await startLightnet()
  await expect(
    page.getByRole("button", { name: "Open Main Menu" }),
  ).toBeVisible()
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Open Main Menu" })
    .click()
  await page.getByRole("navigation").getByText("Search").click()

  await expect(page).toHaveURL(ln.resolveURL("/en/media"))
  await expect(page.getByRole("heading", { name: "Search" })).toBeVisible()
})

test("Should switch languages", async ({ page, startLightnet }) => {
  const ln = await startLightnet()

  await page.getByLabel("Select language").click()
  await page.getByRole("link", { name: "Deutsch" }).click()
  await expect(page).toHaveURL(ln.resolveURL("/de/"))
  await expect(page.getByRole("heading")).toHaveText("Alle Artikel")

  await page.getByLabel("Sprache auswählen").click()
  await page.getByRole("link", { name: "English" }).click()
  await expect(page).toHaveURL(ln.resolveURL("/en/"))
})

test("Should verify EN Detail media page url and title", async ({
  page,
  startLightnet,
}) => {
  const ln = await startLightnet()

  await page.getByRole("link", { name: "Faithful Freestyle" }).click()
  await expect(
    page.getByRole("heading", { name: "Faithful Freestyle" }),
  ).toBeVisible()
  await expect(page).toHaveURL(
    ln.resolveURL("/en/media/faithful-freestyle--en"),
  )

  await page.goBack()

  await page.getByRole("link", { name: "Kickflip Anleitung" }).click()
  await expect(
    page.getByRole("heading", { name: "Kickflip Anleitung" }),
  ).toBeVisible()
  await expect(page).toHaveURL(ln.resolveURL("/en/media/how-to-kickflip--de"))
})

test("Should verify DE Detail media page url and title", async ({
  page,
  startLightnet,
}) => {
  const ln = await startLightnet()

  await page.getByLabel("Select language").click()
  await page.getByRole("link", { name: "Deutsch" }).click()
  await page.getByRole("link", { name: "Faithful Freestyle" }).click()
  await expect(page).toHaveURL(
    ln.resolveURL("/de/media/faithful-freestyle--en"),
  )

  const lesenLink = page.getByRole("link", { name: "Lesen" })
  await expect(lesenLink).toBeVisible()
  await expect(lesenLink).toBeEnabled()
  // await lesenLink.click()
  // await page.waitForLoadState("networkidle")
  // await page.goBack()

  await expect(page.getByRole("button", { name: "Teilen" })).toBeVisible()
  await expect(page.getByText("Sprache")).toBeVisible()
  await expect(page.getByText("Kategorie")).toBeVisible()
})

test("Should show `Powered by LightNet` in footer", async ({
  page,
  startLightnet,
}) => {
  await startLightnet()

  const footerLink = page
    .getByRole("contentinfo")
    .getByRole("link", { name: /LightNet/ })

  await expect(footerLink).toHaveText("Powered by LightNet")
  await expect(footerLink).toHaveAttribute("href", "https://lightnet.community")

  await page.getByLabel("Select language").click()
  await page.getByRole("link", { name: "Deutsch" }).click()

  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: /LightNet/ }),
  ).toHaveText("Ermöglicht durch LightNet")
})
