import type { Subscription } from "rxjs"

import type { BookFormat } from "../utils/create-content-metadata"
import type { OpenBookOptions, OpenedBook, ReaderTheme } from "./types"

type OpenBook = (options: OpenBookOptions) => Promise<OpenedBook>

/**
 * Each format is its own chunk, loaded only when a book of that format is opened.
 */
const loaders: Record<BookFormat, () => Promise<OpenBook>> = {
  epub: () => import("./open-epub").then(({ openEpub }) => openEpub),
  pdf: () => import("./open-pdf").then(({ openPdf }) => openPdf),
}

const THEME_STORAGE_KEY = "ln.reader.theme"

const isBookFormat = (value: unknown): value is BookFormat =>
  value === "pdf" || value === "epub"

/**
 * Connects all links with a `data-ln-reader` attribute to the reader dialog.
 * Links keep their file url as href, so they still work without JavaScript and
 * can be opened in a new tab.
 */
export function initReaderDialog() {
  const dialog = document.querySelector<HTMLDialogElement>("#ln-reader")
  if (!dialog) {
    return
  }
  const element = <T extends Element>(selector: string) => {
    const result = dialog.querySelector<T>(selector)
    if (!result) {
      throw new Error(`Missing reader element ${selector}`)
    }
    return result
  }
  const container = element<HTMLElement>("[data-reader-container]")
  const status = element<HTMLElement>("[data-reader-status]")
  const progress = element<HTMLElement>("[data-reader-progress]")
  const progressValue = element<HTMLElement>("[data-reader-progress-value]")
  const pageIndicator = element<HTMLElement>("[data-reader-page]")
  const download = element<HTMLAnchorElement>("[data-reader-download]")
  const themeButton = element<HTMLButtonElement>("[data-reader-theme]")
  const leftButton = element<HTMLButtonElement>("[data-reader-left]")
  const rightButton = element<HTMLButtonElement>("[data-reader-right]")
  const labels = dialog.dataset

  let book: OpenedBook | undefined
  let pagination: Subscription | undefined
  let session = 0
  let theme: ReaderTheme =
    localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light"

  const applyTheme = () => {
    dialog.dataset.theme = theme
    const label = theme === "dark" ? labels.lightMode : labels.darkMode
    themeButton.ariaLabel = label ?? null
    themeButton.title = label ?? ""
    book?.setTheme?.(theme)
  }

  const showStatus = (message: string | undefined) => {
    status.textContent = message ?? ""
    status.classList.toggle("hidden", !message)
  }

  const setProgress = (fraction: number) => {
    const percent = Math.round(Math.min(Math.max(fraction, 0), 1) * 100)
    progress.ariaValueNow = `${percent}`
    progressValue.style.width = `${percent}%`
  }

  const setNavigationEnabled = (enabled: boolean) => {
    leftButton.disabled = !enabled
    rightButton.disabled = !enabled
  }

  const open = async (url: string, format: BookFormat) => {
    const currentSession = ++session
    download.href = url
    dialog.dataset.format = format
    themeButton.classList.toggle("hidden", format !== "epub")
    setProgress(0)
    pageIndicator.textContent = ""
    setNavigationEnabled(false)
    showStatus(labels.loading)
    document.documentElement.style.overflow = "hidden"
    dialog.showModal()

    try {
      const openBook = await loaders[format]()
      const opened = await openBook({ url, container, theme })
      if (currentSession !== session) {
        opened.destroy()
        return
      }
      book = opened
      showStatus(undefined)
      setNavigationEnabled(true)

      // Page turns are visual: the left button always turns left.
      // Which direction is "previous" depends on the book's reading direction.
      const isRtl = opened.readingDirection === "rtl"
      leftButton.ariaLabel = (isRtl ? labels.next : labels.previous) ?? null
      rightButton.ariaLabel = (isRtl ? labels.previous : labels.next) ?? null
      // The progress bar fills in the book's reading direction.
      progress.dir = opened.readingDirection

      pagination = opened.reader.pagination.state$.subscribe((state) => {
        setProgress(state.percentageEstimateOfBook)
        const index = state.begin.absolutePageIndex
        pageIndicator.textContent =
          index === undefined
            ? ""
            : (labels.pageOf ?? "")
                .replace("{{current}}", `${index + 1}`)
                .replace("{{total}}", `${state.numberOfTotalPages}`)
      })
    } catch (error) {
      console.error("Could not open book", error)
      if (currentSession === session) {
        showStatus(labels.error)
      }
    }
  }

  dialog.addEventListener("close", () => {
    session++
    pagination?.unsubscribe()
    book?.destroy()
    book = undefined
    pagination = undefined
    container.replaceChildren()
    document.documentElement.style.overflow = ""
  })

  element("[data-reader-close]").addEventListener("click", () => dialog.close())
  themeButton.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark"
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    applyTheme()
  })
  leftButton.addEventListener("click", () => book?.reader.navigation.turnLeft())
  rightButton.addEventListener("click", () =>
    book?.reader.navigation.turnRight(),
  )
  applyTheme()

  for (const link of document.querySelectorAll<HTMLAnchorElement>(
    "a[data-ln-reader]",
  )) {
    const format = link.dataset.lnReader
    if (!isBookFormat(format)) {
      continue
    }
    // Start loading the reader code as soon as a visitor shows interest.
    const warmUp = () => void loaders[format]().catch(() => {})
    link.addEventListener("pointerenter", warmUp, { once: true })
    link.addEventListener("focus", warmUp, { once: true })
    link.addEventListener("click", (event) => {
      const opensElsewhere =
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      if (opensElsewhere) {
        return
      }
      event.preventDefault()
      void open(link.href, format)
    })
  }
}
