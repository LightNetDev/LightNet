import type { createReader } from "@prose-reader/core"

export type ReaderTheme = "light" | "dark"

export type OpenBookOptions = {
  /** Url of the file. External files need to be served with CORS headers. */
  url: string
  /** Element to mount the reader into. */
  container: HTMLElement
  theme: ReaderTheme
}

export type OpenedBook = {
  reader: ReturnType<typeof createReader>
  readingDirection: "ltr" | "rtl"
  /** Undefined when the format keeps its own colors, like PDF pages. */
  setTheme?: (theme: ReaderTheme) => void
  destroy: () => void
}

/**
 * Fetches a book file and derives a file name from its url.
 */
export async function fetchBook(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Could not load ${url}: ${response.status}`)
  }
  const filename =
    new URL(url, window.location.href).pathname.split("/").pop() || "book"
  return { blob: await response.blob(), filename }
}
