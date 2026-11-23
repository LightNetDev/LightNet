import { createReader } from "@prose-reader/core"
import { gesturesEnhancer } from "@prose-reader/enhancer-gestures"
import { createArchiveFromPdf, pdfEnhancer } from "@prose-reader/enhancer-pdf"
import { generateManifestFromArchive } from "@prose-reader/streamer"
import { GlobalWorkerOptions } from "pdfjs-dist"
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import pdfjsViewerInlineCss from "pdfjs-dist/web/pdf_viewer.css?inline"
import { of } from "rxjs"

import { fetchBook, type OpenBookOptions, type OpenedBook } from "./types"

GlobalWorkerOptions.workerSrc = workerUrl

/**
 * Opens a PDF file with prose reader and pdf.js.
 * This module is loaded on demand and does not include the EPUB engine.
 * PDF pages keep their own colors, so there is no theme support.
 */
export async function openPdf({
  url,
  container,
}: OpenBookOptions): Promise<OpenedBook> {
  const { blob, filename } = await fetchBook(url)
  const archive = await createArchiveFromPdf(blob, filename)
  const manifest = await generateManifestFromArchive(archive)

  // Gestures add swipe and tap navigation for touch screens.
  const reader = pdfEnhancer(gesturesEnhancer(createReader))({
    manifest,
    spreadMode: "never",
    pdf: { pdfjsViewerInlineCss, getArchiveForItem: () => of(archive) },
  })
  reader.mount(container)

  return {
    reader,
    manifest,
    readingDirection: manifest.readingDirection === "rtl" ? "rtl" : "ltr",
    destroy: () => {
      reader.destroy()
      void archive.close()
    },
  }
}
