import {
  createAstroFixturePage,
  resolveFixturePath,
} from "@internal/e2e-test-utils"
import { expect, type Page } from "@playwright/test"

import { test } from "./basics-fixture"

const searchIndexingRoot = resolveFixturePath(
  import.meta.url,
  "./fixtures/search-indexing/",
)

const expectRobotsNoIndex = async (page: Page) => {
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  )
}

const expectNoRobotsMeta = async (page: Page) => {
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
}

test("Should allow search indexing by default", async ({ page, lightnet }) => {
  await lightnet()

  await expectNoRobotsMeta(page)
})

test("Should disallow search indexing for a single page", async ({
  page,
  lightnet,
}) => {
  const ln = await lightnet()
  await page.goto(ln.resolveURL("/en/search-indexing-disabled"))

  await expectRobotsNoIndex(page)
})

test("Should disallow search indexing for the entire site", async ({
  page,
}) => {
  const ln = await createAstroFixturePage(searchIndexingRoot, page)
  await ln.goto("/en/")

  await expectRobotsNoIndex(page)
})

test("Should allow a single page to override site-wide search indexing", async ({
  page,
}) => {
  const ln = await createAstroFixturePage(searchIndexingRoot, page)
  await ln.goto("/en/search-indexing-enabled")

  await expectNoRobotsMeta(page)
})
