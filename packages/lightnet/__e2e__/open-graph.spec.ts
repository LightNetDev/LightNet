import { access } from "node:fs/promises"
import { join } from "node:path"

import {
  type AstroFixturePage,
  createAstroFixturePage,
  resolveFixturePath,
} from "@internal/e2e-test-utils"
import { expect, type Page } from "@playwright/test"

import { test } from "./basics-fixture"

const SITE = "https://lightnet.community"
const ITEM_PATH = "/en/media/faithful-freestyle--en/"
const OPEN_GRAPH_IMAGE_URL = `${SITE}${ITEM_PATH}open-graph.png`

const basicsRoot = resolveFixturePath(import.meta.url, "./fixtures/basics/")
const disabledFeaturesRoot = resolveFixturePath(
  import.meta.url,
  "./fixtures/disabled-features/",
)

const fileExists = (path: string) =>
  access(path).then(
    () => true,
    () => false,
  )

const meta = (page: Page, key: string) =>
  page
    .locator(`meta[property="${key}"], meta[name="${key}"]`)
    .getAttribute("content")

const expectShareImage = async (
  page: Page,
  {
    url,
    width,
    height,
  }: { url: string | RegExp; width: number; height: number },
) => {
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    url,
  )
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    url,
  )
  await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute(
    "content",
    "image/png",
  )
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
    "content",
    String(width),
  )
  await expect(
    page.locator('meta[property="og:image:height"]'),
  ).toHaveAttribute("content", String(height))
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  )
}

/** Fetches an absolute site URL from the local preview server. */
const fetchFromPreview = async (ln: AstroFixturePage, url: string) => {
  const response = await ln.page.request.get(
    ln.resolveURL(new URL(url).pathname),
  )
  expect(response.status(), url).toBe(200)
  return response
}

const fetchShareImage = async (ln: AstroFixturePage) => {
  const url = await meta(ln.page, "og:image")
  expect(url).not.toBeNull()
  const response = await fetchFromPreview(ln, url!)
  expect(response.headers()["content-type"]).toContain("image/png")
  return response.body()
}

test.describe("Open Graph images enabled (default)", () => {
  test("Should add Open Graph and Twitter metadata to details pages", async ({
    page,
    lightnet,
  }) => {
    await lightnet(ITEM_PATH)

    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
      "content",
      "website",
    )
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "Faithful Freestyle",
    )
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
      "content",
      "Faithful Freestyle",
    )
    await expect(
      page.locator('meta[property="og:description"]'),
    ).toHaveAttribute(
      "content",
      /^How to: Faithful Freestyle empowers you to express/,
    )
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
      "content",
      "Basic Test",
    )
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      `${SITE}${ITEM_PATH}`,
    )
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
      "content",
      "Faithful Freestyle",
    )
    await expectShareImage(page, {
      url: OPEN_GRAPH_IMAGE_URL,
      width: 1200,
      height: 630,
    })
  })

  test("Should share the default locale image on other locale pages", async ({
    page,
    lightnet,
  }) => {
    await lightnet("/de/media/faithful-freestyle--en/")

    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      `${SITE}/de/media/faithful-freestyle--en/`,
    )
    await expectShareImage(page, {
      url: OPEN_GRAPH_IMAGE_URL,
      width: 1200,
      height: 630,
    })
  })

  test("Should build one open-graph.png per media item in the default locale", async ({
    lightnet,
  }) => {
    await lightnet()

    for (const id of [
      "faithful-freestyle--en",
      "how-to-kickflip--de",
      "skate-sounds--en",
    ]) {
      expect(
        await fileExists(
          join(basicsRoot, "dist/en/media", id, "open-graph.png"),
        ),
      ).toBe(true)
      expect(
        await fileExists(
          join(basicsRoot, "dist/de/media", id, "open-graph.png"),
        ),
      ).toBe(false)
    }
  })

  test("Should serve a PNG image for each media item", async ({ lightnet }) => {
    const ln = await lightnet(ITEM_PATH)
    const freestyle = await fetchShareImage(ln)
    await ln.goto("/en/media/skate-sounds--en/")
    const skateSounds = await fetchShareImage(ln)

    // Both items share the same cover and authors but have different titles.
    expect(freestyle.equals(skateSounds)).toBe(false)
  })
})

test.describe("Open Graph images disabled", () => {
  test("Should not build open-graph.png", async ({ page }) => {
    const ln = await createAstroFixturePage(disabledFeaturesRoot, page)
    await ln.goto(ITEM_PATH)

    expect(
      await fileExists(
        join(disabledFeaturesRoot, "dist", ITEM_PATH, "open-graph.png"),
      ),
    ).toBe(false)
    const response = await page.request.get(
      ln.resolveURL(`${ITEM_PATH}open-graph.png`),
    )
    expect(response.status()).toBe(404)
  })

  test("Should fall back to an optimized PNG of the cover image", async ({
    page,
  }) => {
    const ln = await createAstroFixturePage(disabledFeaturesRoot, page)
    await ln.goto(ITEM_PATH)

    // Astro's image service emits hashed assets into /_astro/.
    const optimizedCover = new RegExp(
      `^${SITE}/_astro/cover\\.[\\w-]+_[\\w-]+\\.png$`,
    )
    await expectShareImage(page, {
      url: optimizedCover,
      width: 104,
      height: 144,
    })
    expect(await meta(page, "twitter:image")).toBe(await meta(page, "og:image"))

    await fetchShareImage(ln)
  })
})
