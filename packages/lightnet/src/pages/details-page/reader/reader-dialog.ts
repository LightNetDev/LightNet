import type { Manifest } from "@prose-reader/core"
import type { Subscription } from "rxjs"

import type { BookFormat } from "../utils/create-content-metadata"
import type { OpenBookOptions, OpenedBook, ReaderTheme } from "./types"

type OpenBook = (options: OpenBookOptions) => Promise<OpenedBook>
type TocItem = NonNullable<Manifest["nav"]>["toc"][number]

/**
 * Each format is its own chunk, loaded only when a book of that format is opened.
 */
const loaders: Record<BookFormat, () => Promise<OpenBook>> = {
  epub: () => import("./open-epub").then(({ openEpub }) => openEpub),
  pdf: () => import("./open-pdf").then(({ openPdf }) => openPdf),
}

const THEME_STORAGE_KEY = "ln.reader.theme"
const FONT_SCALE_STORAGE_KEY = "ln.reader.font-scale"
const FONT_SCALES = [0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2]
const ZOOM_SCALES = [1, 1.5, 2, 3, 4]

const isBookFormat = (value: unknown): value is BookFormat =>
  value === "pdf" || value === "epub"

const readFontScale = () => {
  const stored = Number(localStorage.getItem(FONT_SCALE_STORAGE_KEY))
  return FONT_SCALES.includes(stored) ? stored : 1
}

/**
 * Finds the spine item at a fraction of the book, from 0 to 1.
 * Spine items are weighted by their size when the book provides it.
 * For PDF files every page is a spine item, so this is the page index.
 */
const spineItemAt = (manifest: Manifest, fraction: number) => {
  const items = manifest.spineItems
  const weights = items.map((item) => item.progressionWeight ?? 1)
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  let end = 0
  for (const [index, weight] of weights.entries()) {
    end += weight / total
    if (fraction < end) {
      return index
    }
  }
  return items.length - 1
}

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
  const contentsButton = element<HTMLButtonElement>(
    "[data-reader-contents-button]",
  )
  const contentsPopover = element<HTMLElement>("#ln-reader-contents")
  const contentsList = element<HTMLElement>("[data-reader-contents]")
  const displayButton = element<HTMLButtonElement>(
    "[data-reader-display-button]",
  )
  const displayPopover = element<HTMLElement>("#ln-reader-display")
  const smallerTextButton = element<HTMLButtonElement>(
    "[data-reader-smaller-text]",
  )
  const largerTextButton = element<HTMLButtonElement>(
    "[data-reader-larger-text]",
  )
  const textSize = element<HTMLElement>("[data-reader-text-size]")
  const themeButtons = dialog.querySelectorAll<HTMLButtonElement>(
    "[data-reader-theme]",
  )
  const zoomOutButton = element<HTMLButtonElement>("[data-reader-zoom-out]")
  const zoomInButton = element<HTMLButtonElement>("[data-reader-zoom-in]")
  const leftButton = element<HTMLButtonElement>("[data-reader-left]")
  const rightButton = element<HTMLButtonElement>("[data-reader-right]")
  const labels = dialog.dataset
  const percent = new Intl.NumberFormat(document.documentElement.lang, {
    style: "percent",
  })

  let book: OpenedBook | undefined
  let subscriptions: Subscription[] = []
  let session = 0
  let isSeeking = false
  let currentChapterPath: string | undefined
  let theme: ReaderTheme =
    localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light"
  let fontScale = readFontScale()

  const show = (target: HTMLElement, visible: boolean) =>
    target.classList.toggle("hidden", !visible)

  const applyTheme = () => {
    dialog.dataset.theme = theme
    for (const button of themeButtons) {
      button.ariaPressed = `${button.dataset.readerTheme === theme}`
    }
    book?.setTheme?.(theme)
  }

  const applyFontScale = () => {
    const index = FONT_SCALES.indexOf(fontScale)
    smallerTextButton.disabled = index === 0
    largerTextButton.disabled = index === FONT_SCALES.length - 1
    textSize.textContent = percent.format(fontScale)
    book?.setFontScale?.(fontScale)
  }

  const changeFontScale = (step: 1 | -1) => {
    const index = FONT_SCALES.indexOf(fontScale) + step
    fontScale = FONT_SCALES[index] ?? fontScale
    localStorage.setItem(FONT_SCALE_STORAGE_KEY, `${fontScale}`)
    applyFontScale()
  }

  const showStatus = (message: string | undefined) => {
    status.textContent = message ?? ""
    status.classList.toggle("hidden", !message)
  }

  const setProgress = (fraction: number) => {
    const value = Math.round(Math.min(Math.max(fraction, 0), 1) * 100)
    progress.ariaValueNow = `${value}`
    progressValue.style.width = `${value}%`
  }

  const showPage = (pageIndex: number | undefined) => {
    if (pageIndex === undefined) {
      pageIndicator.textContent = ""
      return
    }
    // Only fixed layout books like PDF files know their number of pages.
    // EPUB pages depend on the screen size and text size.
    const total =
      dialog.dataset.format === "pdf"
        ? book?.reader.pagination.state.numberOfTotalPages
        : undefined
    pageIndicator.textContent = total
      ? (labels.pageOf ?? "")
          .replace("{{current}}", `${pageIndex + 1}`)
          .replace("{{total}}", `${total}`)
      : (labels.page ?? "").replace("{{current}}", `${pageIndex + 1}`)
  }

  const setNavigationEnabled = (enabled: boolean) => {
    leftButton.disabled = !enabled
    rightButton.disabled = !enabled
  }

  const renderContents = (toc: TocItem[], depth = 0): HTMLLIElement[] =>
    toc.map((item) => {
      const entry = document.createElement("li")
      const button = document.createElement("button")
      button.type = "button"
      button.textContent = item.title
      button.dataset.path = item.path
      button.className =
        "block w-full cursor-pointer rounded-xl px-3 py-2 text-start text-sm aria-[current=true]:bg-gray-100 aria-[current=true]:font-bold group-data-[theme=dark]:aria-[current=true]:bg-white/10 [@media(hover:hover)]:hover:bg-gray-100 [@media(hover:hover)]:group-data-[theme=dark]:hover:bg-white/10"
      button.style.paddingInlineStart = `${0.75 + depth}rem`
      button.addEventListener("click", () => {
        book?.reader.navigation.goToUrl(item.href)
        contentsPopover.hidePopover()
      })
      entry.append(button)
      if (item.contents.length) {
        const children = document.createElement("ul")
        children.append(...renderContents(item.contents, depth + 1))
        entry.append(children)
      }
      return entry
    })

  const markCurrentChapter = () => {
    for (const button of contentsList.querySelectorAll<HTMLElement>("button")) {
      button.ariaCurrent = `${button.dataset.path === currentChapterPath}`
    }
  }

  const updateZoomButtons = (scale: number) => {
    zoomOutButton.disabled = scale <= 1
    zoomInButton.disabled = scale >= ZOOM_SCALES[ZOOM_SCALES.length - 1]
  }

  const zoom = (step: 1 | -1) => {
    if (!book) {
      return
    }
    const { isZooming, currentScale } = book.reader.zoom.state
    const scale = isZooming ? currentScale : 1
    const next =
      step === 1
        ? ZOOM_SCALES.find((value) => value > scale)
        : ZOOM_SCALES.findLast((value) => value < scale)
    if (next === undefined) {
      return
    }
    if (next <= 1) {
      book.reader.zoom.exit()
    } else if (isZooming) {
      book.reader.zoom.scaleAt(next, { constrain: "within-viewport" })
    } else {
      book.reader.zoom.enter({ scale: next })
    }
  }

  const open = async (url: string, format: BookFormat) => {
    const currentSession = ++session
    dialog.dataset.format = format
    show(contentsButton, false)
    show(displayButton, format === "epub")
    show(zoomOutButton, format === "pdf")
    show(zoomInButton, format === "pdf")
    updateZoomButtons(1)
    setProgress(0)
    pageIndicator.textContent = ""
    setNavigationEnabled(false)
    showStatus(labels.loading)
    document.documentElement.style.overflow = "hidden"
    dialog.showModal()

    try {
      const openBook = await loaders[format]()
      const opened = await openBook({ url, container, theme, fontScale })
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

      const toc = format === "epub" ? (opened.manifest.nav?.toc ?? []) : []
      contentsList.replaceChildren(...renderContents(toc))
      show(contentsButton, toc.length > 0)

      subscriptions = [
        opened.reader.pagination.state$.subscribe((state) => {
          if (isSeeking) {
            return
          }
          setProgress(state.percentageEstimateOfBook)
          showPage(state.begin.absolutePageIndex)
          let chapter = state.begin.chapterInfo
          while (chapter?.subChapter) {
            chapter = chapter.subChapter
          }
          currentChapterPath = chapter?.path
          markCurrentChapter()
        }),
        opened.reader.zoom.state$.subscribe(({ isZooming, currentScale }) =>
          updateZoomButtons(isZooming ? currentScale : 1),
        ),
      ]
    } catch (error) {
      console.error("Could not open book", error)
      if (currentSession === session) {
        showStatus(labels.error)
      }
    }
  }

  dialog.addEventListener("close", () => {
    session++
    for (const subscription of subscriptions) {
      subscription.unsubscribe()
    }
    subscriptions = []
    book?.destroy()
    book = undefined
    container.replaceChildren()
    contentsList.replaceChildren()
    document.documentElement.style.overflow = ""
  })

  // Popovers open below the header, aligned to the end edge of their button
  // and kept inside the screen. They are not rendered yet, so their width
  // comes from their stylesheet.
  const header = element<HTMLElement>("header")
  const popoverMargin = 16
  for (const [button, popover] of [
    [contentsButton, contentsPopover],
    [displayButton, displayPopover],
  ] as const) {
    popover.addEventListener("beforetoggle", (event) => {
      if ((event as ToggleEvent).newState !== "open") {
        return
      }
      const screenWidth = document.documentElement.clientWidth
      const width = Math.min(
        parseFloat(getComputedStyle(popover).width),
        screenWidth - 2 * popoverMargin,
      )
      const rect = button.getBoundingClientRect()
      const isRtl = getComputedStyle(button).direction === "rtl"
      const left = Math.min(
        Math.max(isRtl ? rect.left : rect.right - width, popoverMargin),
        screenWidth - popoverMargin - width,
      )
      const top = header.getBoundingClientRect().bottom + 8
      popover.style.inset = `${top}px auto auto ${left}px`
      popover.style.maxHeight = `calc(100dvh - ${top}px - ${popoverMargin}px)`
    })
  }
  contentsPopover.addEventListener("toggle", (event) => {
    if ((event as ToggleEvent).newState === "open") {
      contentsList
        .querySelector("[aria-current=true]")
        ?.scrollIntoView({ block: "nearest" })
    }
  })

  // Jump to a point in the book by clicking or dragging on the progress bar.
  const fractionAt = (event: PointerEvent) => {
    const rect = progress.getBoundingClientRect()
    const offset =
      progress.dir === "rtl"
        ? rect.right - event.clientX
        : event.clientX - rect.left
    return Math.min(Math.max(offset / rect.width, 0), 1)
  }
  const previewSeek = (fraction: number) => {
    if (!book) {
      return
    }
    setProgress(fraction)
    if (dialog.dataset.format === "pdf") {
      showPage(spineItemAt(book.manifest, fraction))
    }
  }
  progress.addEventListener("pointerdown", (event) => {
    if (!book || event.button !== 0) {
      return
    }
    isSeeking = true
    progress.dataset.seeking = ""
    progress.setPointerCapture(event.pointerId)
    previewSeek(fractionAt(event))
  })
  progress.addEventListener("pointermove", (event) => {
    if (isSeeking) {
      previewSeek(fractionAt(event))
    }
  })
  const endSeek = (event: PointerEvent) => {
    if (!isSeeking) {
      return
    }
    isSeeking = false
    delete progress.dataset.seeking
    if (!book) {
      return
    }
    if (event.type === "pointerup") {
      book.reader.navigation.goToSpineItem({
        indexOrId: spineItemAt(book.manifest, fractionAt(event)),
        animation: false,
      })
      return
    }
    const state = book.reader.pagination.state
    setProgress(state.percentageEstimateOfBook)
    showPage(state.begin.absolutePageIndex)
  }
  progress.addEventListener("pointerup", endSeek)
  progress.addEventListener("pointercancel", endSeek)

  element("[data-reader-close]").addEventListener("click", () => dialog.close())
  for (const button of themeButtons) {
    button.addEventListener("click", () => {
      theme = button.dataset.readerTheme === "dark" ? "dark" : "light"
      localStorage.setItem(THEME_STORAGE_KEY, theme)
      applyTheme()
    })
  }
  smallerTextButton.addEventListener("click", () => changeFontScale(-1))
  largerTextButton.addEventListener("click", () => changeFontScale(1))
  zoomOutButton.addEventListener("click", () => zoom(-1))
  zoomInButton.addEventListener("click", () => zoom(1))
  leftButton.addEventListener("click", () => book?.reader.navigation.turnLeft())
  rightButton.addEventListener("click", () =>
    book?.reader.navigation.turnRight(),
  )
  applyTheme()
  applyFontScale()

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
