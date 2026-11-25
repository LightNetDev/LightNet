import { access } from "node:fs/promises"
import { join } from "node:path"

import {
  type AstroFixturePage,
  createAstroFixturePage,
  resolveFixturePath,
} from "@internal/e2e-test-utils"
import { expect, type Page } from "@playwright/test"
import sharp from "sharp"

import { test } from "./basics-fixture"

const SITE = "https://lightnet.community"
const ITEM_PATH = "/en/media/faithful-freestyle--en/"
const OPEN_GRAPH_IMAGE_URL = `${SITE}${ITEM_PATH}open-graph.png`

const basicsRoot = resolveFixturePath(import.meta.url, "./fixtures/basics/")
const disabledRoot = resolveFixturePath(
  import.meta.url,
  "./fixtures/open-graph-disabled/",
)
const coverPath = join(basicsRoot, "src/content/media/images/cover.jpg")

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

  test("Should render the cover, title, and authors into the image", async ({
    lightnet,
  }) => {
    const ln = await lightnet(ITEM_PATH)
    const png = await fetchShareImage(ln)

    const { data, info } = await sharp(png)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    expect(info).toMatchObject({ width: 1200, height: 630 })
    const pixel = (x: number, y: number) => {
      const offset = (y * info.width + x) * 3
      return [...data.subarray(offset, offset + 3)]
    }

    // The cover is scaled to fit a 432 × 502 box at (64, 64) for LTR items.
    const cover = await sharp(coverPath)
      .resize(432, 502, { fit: "inside" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const coverLeft = 64 + Math.floor((432 - cover.info.width) / 2)
    const coverTop = 64 + Math.floor((502 - cover.info.height) / 2)
    // Compare the inner area to stay clear of rounded corners and the
    // book spine.
    let difference = 0
    let samples = 0
    for (
      let y = Math.floor(cover.info.height * 0.1);
      y < cover.info.height * 0.9;
      y++
    ) {
      for (
        let x = Math.floor(cover.info.width * 0.1);
        x < cover.info.width * 0.9;
        x++
      ) {
        const offset = (y * cover.info.width + x) * 3
        const expected = cover.data.subarray(offset, offset + 3)
        const actual = pixel(coverLeft + x, coverTop + y)
        difference +=
          Math.abs(expected[0] - actual[0]) +
          Math.abs(expected[1] - actual[1]) +
          Math.abs(expected[2] - actual[2])
        samples += 3
      }
    }
    expect(difference / samples).toBeLessThan(2)

    // Title (#111827) is rendered above the authors (#4b5563) in the text
    // column that starts at x = 560.
    const titleRows: number[] = []
    const authorRows: number[] = []
    for (let y = 0; y < info.height; y++) {
      for (let x = 560; x < 1136; x++) {
        const [r, g, b] = pixel(x, y)
        if (r === 0x11 && g === 0x18 && b === 0x27) titleRows.push(y)
        if (r === 0x4b && g === 0x55 && b === 0x63) authorRows.push(y)
      }
    }
    expect(titleRows.length).toBeGreaterThan(100)
    expect(authorRows.length).toBeGreaterThan(50)
    expect(Math.max(...titleRows)).toBeLessThan(Math.min(...authorRows))
    // Nothing is drawn into the text column outside the title and authors.
    expect(Math.min(...titleRows)).toBeGreaterThan(64)
    expect(Math.max(...authorRows)).toBeLessThan(566)
  })

  test("Should render item specific images", async ({ lightnet }) => {
    const ln = await lightnet(ITEM_PATH)
    const freestyle = await fetchShareImage(ln)
    await ln.goto("/en/media/skate-sounds--en/")
    const skateSounds = await fetchShareImage(ln)

    // Both items share the same cover and authors but have different titles.
    expect(Buffer.compare(freestyle, skateSounds)).not.toBe(0)
  })
})

test.describe("Open Graph images disabled", () => {
  test("Should not build open-graph.png", async ({ page }) => {
    const ln = await createAstroFixturePage(disabledRoot, page)
    await ln.goto(ITEM_PATH)

    expect(
      await fileExists(join(disabledRoot, "dist", ITEM_PATH, "open-graph.png")),
    ).toBe(false)
    const response = await page.request.get(
      ln.resolveURL(`${ITEM_PATH}open-graph.png`),
    )
    expect(response.status()).toBe(404)
  })

  test("Should fall back to an optimized PNG of the cover image", async ({
    page,
  }) => {
    const ln = await createAstroFixturePage(disabledRoot, page)
    await ln.goto(ITEM_PATH)

    const { width, height } = await sharp(coverPath).metadata()
    // Astro's image service emits hashed assets into /_astro/.
    const optimizedCover = new RegExp(
      `^${SITE}/_astro/cover\\.[\\w-]+_[\\w-]+\\.png$`,
    )
    await expectShareImage(page, { url: optimizedCover, width, height })
    expect(await meta(page, "twitter:image")).toBe(await meta(page, "og:image"))

    const png = await fetchShareImage(ln)
    expect(await sharp(png).metadata()).toMatchObject({
      format: "png",
      width,
      height,
    })
  })
})
