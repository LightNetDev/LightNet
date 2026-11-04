import { expect, test } from "vitest"

import type { MediaItemEntry } from "../../src/content/schema/media-item"
import type { MediaTypeEntry } from "../../src/content/schema/media-type"
import { createMediaItemJsonLd } from "../../src/pages/details-page/utils/create-media-item-json-ld"

const item: MediaItemEntry["data"] = {
  title: "A work",
  type: { id: "book", collection: "media-types" },
  description: "A **helpful** [resource](https://example.com)",
  authors: ["An author"],
  language: "ar",
  dateCreated: "2026-01-01",
  image: { src: "/cover.jpg", width: 1000, height: 1000, format: "jpg" },
  content: [{ type: "upload", url: "/files/book.pdf" }],
}

function build(
  urls: string[],
  fallbackSchemaType = "CreativeWork",
  schemaType?: MediaTypeEntry["data"]["schemaType"],
) {
  return createMediaItemJsonLd({
    item: { ...item, content: urls.map((url) => ({ type: "link", url })) },
    fallbackSchemaType,
    schemaType,
    canonicalUrl: new URL("https://example.com/en/media/work/"),
    imageUrl: "https://example.com/cover.webp",
    categoryNames: ["Family"],
    contentLabels: ["First file", "Second file"],
  })
}

test.each(["SoftwareApplication", "WebPage"] as const)(
  "Uses the primary resource URL for %s and keeps the LightNet page separate",
  (schemaType) => {
    const result = build(
      ["https://resource.example/app?lang=ar#about", "https://other.example/"],
      "CreativeWork",
      schemaType,
    )
    expect(result).toMatchObject({
      "@type": schemaType,
      "@id": "https://example.com/en/media/work/#work",
      url: "https://resource.example/app?lang=ar#about",
      mainEntityOfPage: "https://example.com/en/media/work/",
      name: item.title,
    })
    expect(result.encoding).toBeUndefined()
    expect(result).not.toHaveProperty("contentUrl")
    expect(result).not.toHaveProperty("downloadUrl")
    expect(result).not.toHaveProperty("installUrl")
  },
)

test.each([
  "javascript:alert(1)",
  "mailto:hello@example.com",
  "https://[invalid",
])(
  "Keeps the detail URL when the primary resource URL is unusable: %s",
  (url) => {
    for (const schemaType of ["SoftwareApplication", "WebPage"] as const) {
      expect(
        build([url, "https://resource.example/"], "CreativeWork", schemaType),
      ).toMatchObject({
        "@type": schemaType,
        url: "https://example.com/en/media/work/",
        mainEntityOfPage: "https://example.com/en/media/work/",
      })
    }
  },
)

test("Does not use an uploaded file as the application URL", () => {
  const result = createMediaItemJsonLd({
    item: {
      ...item,
      content: [
        { type: "upload", url: "/files/app.zip" },
        { type: "link", url: "https://resource.example/app" },
      ],
    },
    fallbackSchemaType: "CreativeWork",
    schemaType: "SoftwareApplication",
    canonicalUrl: new URL("https://example.com/en/media/work/"),
    imageUrl: "https://example.com/cover.webp",
  })
  expect(result.url).toBe("https://example.com/en/media/work/")
  expect(result).not.toHaveProperty("downloadUrl")
})

test("Resolves relative web resource links and preserves supplemental file encodings", () => {
  expect(
    build(["/resource/", "/guide.pdf"], "CreativeWork", "WebPage"),
  ).toMatchObject({
    "@type": "WebPage",
    url: "https://example.com/resource/",
    mainEntityOfPage: "https://example.com/en/media/work/",
    encoding: [
      { "@type": "MediaObject", contentUrl: "https://example.com/guide.pdf" },
    ],
  })
})

test("Describes the work without guessing its type or original publication date", () => {
  const result = build([
    "/files/book.pdf?download=1#page=2",
    "/files/book.epub",
  ])
  expect(result).toMatchObject({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": "https://example.com/en/media/work/#work",
    url: "https://example.com/en/media/work/",
    name: "A work",
    description: "A helpful resource",
    inLanguage: "ar",
    author: [{ name: "An author" }],
    about: [{ "@type": "Thing", name: "Family" }],
    encoding: [
      {
        "@type": "MediaObject",
        name: "First file",
        encodingFormat: "application/pdf",
        contentUrl: "https://example.com/files/book.pdf?download=1#page=2",
      },
      { "@type": "MediaObject", encodingFormat: "application/epub+zip" },
    ],
  })
  expect(result).not.toHaveProperty("dateCreated")
  expect(result).not.toHaveProperty("datePublished")
  expect(result).not.toHaveProperty("uploadDate")
})

test("Does not describe unknown links or unsafe protocols as downloadable media", () => {
  const result = build([
    "https://example.org/resource",
    "javascript:alert(1)",
    "https://[invalid",
    "https://example.org/archive.zip",
  ])
  expect(result.encoding).toBeUndefined()
})

test("Describes mixed known files without promoting the whole work to one media type", () => {
  expect(build(["/audio.mp3", "/video.mp4", "/image.avif"])).toMatchObject({
    "@type": "CreativeWork",
    encoding: [
      { "@type": "AudioObject", encodingFormat: "audio/mpeg" },
      { "@type": "VideoObject", encodingFormat: "video/mp4" },
      { "@type": "ImageObject", encodingFormat: "image/avif" },
    ],
  })
})

test("Uses an AudioObject for one track and separate parts for multiple tracks", () => {
  expect(build(["/track.mp3"], "AudioObject")).toMatchObject({
    "@type": "AudioObject",
    name: "A work",
    contentUrl: "https://example.com/track.mp3",
  })
  expect(build(["/one.mp3", "/two.mp3"], "AudioObject")).toMatchObject({
    "@type": "AudioObject",
    hasPart: [
      {
        "@type": "AudioObject",
        name: "First file",
        contentUrl: "https://example.com/one.mp3",
      },
      {
        "@type": "AudioObject",
        name: "Second file",
        contentUrl: "https://example.com/two.mp3",
      },
    ],
  })
})

test.each([
  [
    "https://www.youtube.com/watch?v=abc",
    "https://www.youtube-nocookie.com/embed/abc",
  ],
  ["https://youtu.be/abc?t=10", "https://www.youtube-nocookie.com/embed/abc"],
  [
    "https://www.youtube.com/embed/abc",
    "https://www.youtube-nocookie.com/embed/abc",
  ],
  [
    "https://www.youtube-nocookie.com/embed/abc",
    "https://www.youtube-nocookie.com/embed/abc",
  ],
  ["https://vimeo.com/123", "https://player.vimeo.com/video/123"],
  [
    "https://player.vimeo.com/video/123?h=secret",
    "https://player.vimeo.com/video/123?h=secret",
  ],
])("Uses a player URL for hosted video %s", (url, embedUrl) => {
  const result = build([url], "VideoObject")
  expect(result).toMatchObject({
    "@type": "VideoObject",
    name: "A work",
    embedUrl,
    thumbnailUrl: "https://example.com/cover.webp",
  })
  expect(result).not.toHaveProperty("contentUrl")
})

test("Describes the primary video and preserves alternative encodings", () => {
  const result = build(["/movie.MP4?token=abc", "/other.mp4"], "VideoObject")
  expect(result).toMatchObject({
    "@type": "VideoObject",
    contentUrl: "https://example.com/movie.MP4?token=abc",
    encodingFormat: "video/mp4",
  })
  expect(result).not.toHaveProperty("embedUrl")
  expect(result.encoding).toMatchObject([
    { "@type": "VideoObject", contentUrl: "https://example.com/other.mp4" },
  ])
})

test("Uses the video fallback without assigning an unrecognized primary URL as content", () => {
  const result = build(
    ["https://example.org/watch", "/movie.mp4"],
    "VideoObject",
  )
  expect(result["@type"]).toBe("VideoObject")
  expect(result).not.toHaveProperty("contentUrl")
  expect(result).not.toHaveProperty("embedUrl")
})

test("Accepts a custom fallback and lets the media type override it", () => {
  expect(build(["/book.pdf"], "LearningResource")["@type"]).toBe(
    "LearningResource",
  )
  expect(build(["/book.pdf"], "LearningResource", "Book")["@type"]).toBe("Book")
})

test.each(["CreativeWork", "Book", "Article", "DigitalDocument"] as const)(
  "Uses explicit %s classification while preserving document encodings",
  (schemaType) => {
    expect(
      build(["/book.pdf", "/book.epub"], "CreativeWork", schemaType),
    ).toMatchObject({
      "@type": schemaType,
      encoding: [
        { "@type": "MediaObject", encodingFormat: "application/pdf" },
        { "@type": "MediaObject", encodingFormat: "application/epub+zip" },
      ],
    })
  },
)

test.each(["CreativeWork", "Book", "Article", "DigitalDocument"] as const)(
  "Keeps explicit %s classification over audio and video fallbacks",
  (schemaType) => {
    const audio = build(["/talk.mp3"], "AudioObject", schemaType)
    expect(audio).toMatchObject({
      "@type": schemaType,
      encoding: [
        { "@type": "AudioObject", contentUrl: "https://example.com/talk.mp3" },
      ],
    })
    expect(audio).not.toHaveProperty("contentUrl")

    const video = build(["https://youtu.be/abc"], "VideoObject", schemaType)
    expect(video).toMatchObject({
      "@type": schemaType,
      encoding: [
        {
          "@type": "VideoObject",
          embedUrl: "https://www.youtube-nocookie.com/embed/abc",
        },
      ],
    })
    expect(video).not.toHaveProperty("embedUrl")
  },
)

test("Preserves explicit work classification with multiple audio encodings", () => {
  expect(build(["/one.mp3", "/two.mp3"], "AudioObject", "Book")).toMatchObject({
    "@type": "Book",
    encoding: [
      { "@type": "AudioObject", contentUrl: "https://example.com/one.mp3" },
      { "@type": "AudioObject", contentUrl: "https://example.com/two.mp3" },
    ],
  })
})

test.each(["CreativeWork", "AudioObject", "VideoObject"] as const)(
  "Attaches explicit media object file and player URLs independently of the %s fallback",
  (fallbackSchemaType) => {
    expect(
      build(["/talk.mp3"], fallbackSchemaType, "AudioObject"),
    ).toMatchObject({
      "@type": "AudioObject",
      name: item.title,
      contentUrl: "https://example.com/talk.mp3",
      encodingFormat: "audio/mpeg",
    })
    expect(
      build(["https://youtu.be/abc"], fallbackSchemaType, "VideoObject"),
    ).toMatchObject({
      "@type": "VideoObject",
      embedUrl: "https://www.youtube-nocookie.com/embed/abc",
      thumbnailUrl: "https://example.com/cover.webp",
    })
    expect(
      build(["/photo.jpg"], fallbackSchemaType, "ImageObject"),
    ).toMatchObject({
      "@type": "ImageObject",
      contentUrl: "https://example.com/photo.jpg",
      encodingFormat: "image/jpeg",
    })
  },
)

test("Keeps explicit multi-track audio as parts with the default fallback", () => {
  const result = build(["/one.mp3", "/two.mp3"], "CreativeWork", "AudioObject")
  expect(result).toMatchObject({
    "@type": "AudioObject",
    hasPart: [
      { contentUrl: "https://example.com/one.mp3" },
      { contentUrl: "https://example.com/two.mp3" },
    ],
  })
  expect(result).not.toHaveProperty("contentUrl")
})

test("Preserves alternative image encodings and does not use the cover as the content", () => {
  expect(
    build(["/photo.jpg", "/photo.webp"], "CreativeWork", "ImageObject"),
  ).toMatchObject({
    "@type": "ImageObject",
    contentUrl: "https://example.com/photo.jpg",
    encoding: [
      { "@type": "ImageObject", contentUrl: "https://example.com/photo.webp" },
    ],
  })
  const unknown = build(
    ["https://example.org/view"],
    "CreativeWork",
    "ImageObject",
  )
  expect(unknown["@type"]).toBe("ImageObject")
  expect(unknown).not.toHaveProperty("contentUrl")
})

test("Does not assign an unrelated primary file URL to an explicit media object", () => {
  const result = build(["/notes.pdf"], "AudioObject", "AudioObject")
  expect(result["@type"]).toBe("AudioObject")
  expect(result).not.toHaveProperty("contentUrl")
  expect(result.encoding).toMatchObject([
    { "@type": "MediaObject", encodingFormat: "application/pdf" },
  ])
})
