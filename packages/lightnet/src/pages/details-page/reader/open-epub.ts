import { createArchiveFromJszip } from "@prose-reader/archive-reader/archives/createArchiveFromJszip"
import { createReader, type Manifest } from "@prose-reader/core"
import { gesturesEnhancer } from "@prose-reader/enhancer-gestures"
import { Streamer } from "@prose-reader/streamer"
import JSZip from "jszip"
import { from } from "rxjs"

import {
  fetchBook,
  type OpenBookOptions,
  type OpenedBook,
  type ReaderTheme,
} from "./types"

const proseTheme = (theme: ReaderTheme) =>
  theme === "dark" ? "night" : "bright"

type TocItem = NonNullable<Manifest["nav"]>["toc"][number]

/**
 * Without a base url the streamer prefixes spine item hrefs with `file://`,
 * but not the hrefs of the table of contents. Prose reader matches the two
 * to navigate to a chapter and to find the current chapter, so we align them.
 */
const withFileScheme = (item: TocItem): TocItem => ({
  ...item,
  href:
    !item.href || /^[a-z][a-z\d+.-]*:/i.test(item.href)
      ? item.href
      : `file://${item.href}`,
  contents: item.contents.map(withFileScheme),
})

/**
 * Opens an EPUB file with prose reader.
 * This module is loaded on demand and does not include the PDF engine.
 */
export async function openEpub({
  url,
  container,
  theme,
  fontScale,
}: OpenBookOptions): Promise<OpenedBook> {
  const { blob, filename } = await fetchBook(url)
  const streamer = new Streamer({
    getArchive: async () =>
      createArchiveFromJszip(await JSZip.loadAsync(blob), { name: filename }),
    cleanArchiveAfter: 5 * 60 * 1000,
  })
  const manifestResponse = await streamer.fetchManifest()
  if (!manifestResponse.ok) {
    throw new Error(await manifestResponse.text())
  }
  const fetchedManifest = (await manifestResponse.json()) as Manifest
  const manifest: Manifest = {
    ...fetchedManifest,
    nav: fetchedManifest.nav && {
      toc: fetchedManifest.nav.toc.map(withFileScheme),
    },
  }

  // Gestures add swipe and tap navigation for touch screens.
  const reader = gesturesEnhancer(createReader)({
    manifest,
    theme: proseTheme(theme),
    fontScale,
    spreadMode: "never",
    getResource: (item) =>
      from(streamer.fetchResource({ resourcePath: item.href })),
  })
  reader.mount(container)

  return {
    reader,
    manifest,
    readingDirection: manifest.readingDirection === "rtl" ? "rtl" : "ltr",
    setTheme: (theme) => reader.settings.update({ theme: proseTheme(theme) }),
    setFontScale: (fontScale) => reader.settings.update({ fontScale }),
    destroy: () => {
      reader.destroy()
      streamer.prune()
    },
  }
}
