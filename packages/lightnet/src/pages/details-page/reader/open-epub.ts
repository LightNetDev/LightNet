import { createArchiveFromJszip } from "@prose-reader/archive-reader/archives/createArchiveFromJszip"
import { createReader, type Manifest } from "@prose-reader/core"
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

/**
 * Opens an EPUB file with prose reader.
 * This module is loaded on demand and does not include the PDF engine.
 */
export async function openEpub({
  url,
  container,
  theme,
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
  const manifest = (await manifestResponse.json()) as Manifest

  const reader = createReader({
    manifest,
    theme: proseTheme(theme),
    spreadMode: "never",
    getResource: (item) =>
      from(streamer.fetchResource({ resourcePath: item.href })),
  })
  reader.mount(container)

  return {
    reader,
    readingDirection: manifest.readingDirection === "rtl" ? "rtl" : "ltr",
    setTheme: (theme) => reader.settings.update({ theme: proseTheme(theme) }),
    destroy: () => {
      reader.destroy()
      streamer.prune()
    },
  }
}
