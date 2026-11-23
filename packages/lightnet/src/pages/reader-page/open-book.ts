import type { Archive } from "@prose-reader/archive-reader"
import type { Manifest } from "@prose-reader/core"

export type BookFormat = "pdf" | "epub"

export type OpenedBook = Awaited<ReturnType<typeof openBook>>

/**
 * Fetches a PDF or EPUB file and mounts a prose reader for it into the container.
 * Reader dependencies are loaded lazily so the PDF engine is only
 * downloaded when a PDF is opened.
 *
 * @param url of the file to open. External files need to be served with CORS headers.
 * @param format of the file.
 * @param container element to mount the reader into.
 * @returns the reader and a destroy function to release all resources.
 */
export async function openBook({
  url,
  format,
  container,
}: {
  url: string
  format: BookFormat
  container: HTMLElement
}) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Could not load ${url}: ${response.status}`)
  }
  const blob = await response.blob()
  const filename =
    new URL(url, window.location.href).pathname.split("/").pop() ||
    `book.${format}`

  const [{ createReader }, { Streamer }, { from }] = await Promise.all([
    import("@prose-reader/core"),
    import("@prose-reader/streamer"),
    import("rxjs"),
  ])
  // pdf.js needs its worker before the pdf archive is created
  const createPdfReader = format === "pdf" ? await loadPdfEnhancer() : undefined

  const streamer = new Streamer({
    getArchive: () => createArchive(blob, filename, format),
    cleanArchiveAfter: 5 * 60 * 1000,
  })
  const manifestResponse = await streamer.fetchManifest()
  if (!manifestResponse.ok) {
    throw new Error(await manifestResponse.text())
  }
  const manifest = (await manifestResponse.json()) as Manifest

  const reader = createPdfReader
    ? createPdfReader(createReader)({
        manifest,
        pdf: {
          pdfjsViewerInlineCss: (
            await import("pdfjs-dist/web/pdf_viewer.css?inline")
          ).default,
          getArchiveForItem: () => streamer.accessArchive(),
        },
      })
    : createReader({
        manifest,
        getResource: (item) =>
          from(streamer.fetchResource({ resourcePath: item.href })),
      })

  reader.mount(container)

  return {
    reader,
    manifest,
    destroy: () => {
      reader.destroy()
      streamer.prune()
    },
  }
}

async function loadPdfEnhancer() {
  const [{ pdfEnhancer }, { GlobalWorkerOptions }, worker] = await Promise.all([
    import("@prose-reader/enhancer-pdf"),
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ])
  GlobalWorkerOptions.workerSrc = worker.default
  return pdfEnhancer
}

async function createArchive(
  blob: Blob,
  filename: string,
  format: BookFormat,
): Promise<Archive> {
  if (format === "pdf") {
    const { createArchiveFromPdf } = await import("@prose-reader/enhancer-pdf")
    return createArchiveFromPdf(blob, filename)
  }
  const [{ default: JSZip }, { createArchiveFromJszip }] = await Promise.all([
    import("jszip"),
    import("@prose-reader/archive-reader/archives/createArchiveFromJszip"),
  ])
  return createArchiveFromJszip(await JSZip.loadAsync(blob), {
    name: filename,
  })
}
