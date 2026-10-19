import reactRenderer from "@astrojs/react/server.js"
import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { expect, test } from "vitest"

import VideoPlayer from "../../src/components/VideoPlayer.astro"
import { useTranslate } from "../../src/i18n/translate"

async function renderVideo(url: string) {
  const container = await AstroContainer.create()
  container.addServerRenderer({
    name: "@astrojs/react",
    renderer: reactRenderer,
  })
  return container.renderToString(VideoPlayer, {
    props: { url, title: "Example video" },
    locals: { i18n: { t: await useTranslate("en") } } as App.Locals,
  })
}

test.each([
  // GitHub-backed uploads in public/files use the /files public folder.
  "/files/video.mp4",
  "video.mp4",
  "./video.mp4",
  "../files/video.mp4",
  "/files/video.mp4?download=1",
  "/files/video.mp4#t=10",
  "/files/video.mp4?download=1#t=10",
  "video.mp4?download=1#t=10",
  "https://example.com/video.mp4",
  "https://example.com/video.mp4?download=1",
  "https://example.com/video.mp4#t=10",
  "https://example.com/video.mp4?download=1#t=10",
  // R2 uploads use the configured public URL, including custom domains/prefixes.
  "https://pub-example.r2.dev/uploads/video.mp4",
  "https://media.example.com/uploads/video.mp4?download=1#t=10",
])("renders MP4 source without rewriting %s", async (url) => {
  const html = await renderVideo(url)
  expect(html).toContain("<video ")
  expect(html).toContain(`<source src="${url}" type="video/mp4"`)
  expect(html).not.toContain("External link")
})

test.each([
  [
    "https://www.youtube.com/watch?v=abc123",
    "https://www.youtube-nocookie.com/embed/abc123",
  ],
  [
    "https://www.youtube.com/embed/abc123",
    "https://www.youtube-nocookie.com/embed/abc123",
  ],
  ["https://youtu.be/abc123", "https://www.youtube-nocookie.com/embed/abc123"],
  [
    "https://www.youtube-nocookie.com/embed/abc123",
    "https://www.youtube-nocookie.com/embed/abc123",
  ],
  ["https://vimeo.com/12345678", "https://player.vimeo.com/video/12345678"],
  [
    "https://player.vimeo.com/video/12345678",
    "https://player.vimeo.com/video/12345678",
  ],
])("preserves embedded player for %s", async (url, src) => {
  const html = await renderVideo(url)
  expect(html).toContain("<iframe ")
  expect(html).toContain(`src="${src}"`)
  expect(html).not.toContain("<video ")
})

test.each([
  "/files/document.pdf",
  "document.pdf",
  "/files/video.mp4.txt",
  "/files/document?file=video.mp4",
  "/files/document#video.mp4",
  "https://example.com/watch",
  "https://example.com/watch?file=video.mp4",
])("preserves external-link fallback for %s", async (url) => {
  const html = await renderVideo(url)
  expect(html).toContain(`href="${url}"`)
  expect(html).toContain("External link")
  expect(html).not.toContain("<video ")
  expect(html).not.toContain("<iframe ")
})
