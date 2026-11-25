import { expect, type Page } from "@playwright/test"

import { test } from "./basics-fixture"

const SITE = "https://lightnet.community"
const optimizedCover = (name: string) =>
  expect.stringMatching(
    new RegExp(`^${SITE}/_astro/${name}\\.[\\w-]+_[\\w-]+\\.webp$`),
  )

const readJsonLd = async (page: Page) => {
  const scripts = page.locator('script[type="application/ld+json"]')
  await expect(scripts).toHaveCount(1)
  return JSON.parse((await scripts.textContent()) ?? "")
}

test("Should not add JSON-LD to pages other than details pages", async ({
  page,
  lightnet,
}) => {
  await lightnet("/en/")
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    0,
  )
})

test("Should describe a media item as CreativeWork by default", async ({
  page,
  lightnet,
}) => {
  await lightnet("/en/media/faithful-freestyle--en/")
  const canonicalUrl = `${SITE}/en/media/faithful-freestyle--en/`

  expect(await readJsonLd(page)).toEqual({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${canonicalUrl}#work`,
    url: canonicalUrl,
    name: "Faithful Freestyle",
    description: expect.stringMatching(
      /^How to: Faithful Freestyle empowers you to express/,
    ),
    image: optimizedCover("cover"),
    inLanguage: "en",
    author: [{ name: "Sk8 Ministries" }],
    about: [{ "@type": "Thing", name: "Christian Living" }],
    encoding: [
      {
        "@type": "MediaObject",
        name: expect.any(String),
        inLanguage: "en",
        contentUrl: `${SITE}/files/example.pdf`,
        encodingFormat: "application/pdf",
      },
    ],
  })
})

test("Should use the canonical URL and translate categories on other locale pages", async ({
  page,
  lightnet,
}) => {
  await lightnet("/de/media/faithful-freestyle--en/")

  expect(await readJsonLd(page)).toMatchObject({
    "@id": `${SITE}/en/media/faithful-freestyle--en/#work`,
    url: `${SITE}/en/media/faithful-freestyle--en/`,
    inLanguage: "en",
    about: [{ "@type": "Thing", name: "Glaube leben" }],
  })
})

test("Should describe video items as VideoObject with an embed URL", async ({
  page,
  lightnet,
}) => {
  await lightnet("/en/media/how-to-kickflip--de/")
  const image = optimizedCover("how-to-kickflip--en")

  expect(await readJsonLd(page)).toMatchObject({
    "@type": "VideoObject",
    "@id": `${SITE}/en/media/how-to-kickflip--de/#work`,
    name: "Kickflip Anleitung",
    inLanguage: "de",
    author: [{ name: "Skiddy Skates" }],
    about: [{ "@type": "Thing", name: "Teens" }],
    embedUrl: "https://www.youtube-nocookie.com/embed/tnpLkUQZODc",
    image,
    thumbnailUrl: image,
  })
})

test("Should describe audio items with several files as AudioObject parts", async ({
  page,
  lightnet,
}) => {
  await lightnet("/en/media/skate-sounds--en/")

  const jsonLd = await readJsonLd(page)
  expect(jsonLd).toMatchObject({
    "@type": "AudioObject",
    "@id": `${SITE}/en/media/skate-sounds--en/#work`,
    name: "Skate Sounds",
    hasPart: [
      {
        "@type": "AudioObject",
        contentUrl: `${SITE}/files/example-audio.mp3`,
        encodingFormat: "audio/mpeg",
      },
      {
        "@type": "AudioObject",
        contentUrl:
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        encodingFormat: "audio/mpeg",
      },
    ],
  })
  expect(jsonLd).not.toHaveProperty("contentUrl")
})

test("Should reference an image that is served by the site", async ({
  page,
  lightnet,
}) => {
  const ln = await lightnet("/en/media/faithful-freestyle--en/")
  const { image } = await readJsonLd(page)

  const response = await page.request.get(
    ln.resolveURL(new URL(image).pathname),
  )
  expect(response.status()).toBe(200)
  expect(response.headers()["content-type"]).toContain("image/webp")
})
