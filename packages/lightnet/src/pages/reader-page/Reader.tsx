import ArrowLeftIcon from "lucide-react/icons/arrow-left"
import ChevronLeftIcon from "lucide-react/icons/chevron-left"
import ChevronRightIcon from "lucide-react/icons/chevron-right"
import { useEffect, useMemo, useRef, useState } from "react"

import {
  createI18n,
  type I18nConfig,
  I18nContext,
} from "../../i18n/react/i18n-context"
import { useI18n } from "../../i18n/react/use-i18n"
import { type BookFormat, openBook, type OpenedBook } from "./open-book"

export type ReaderBook = {
  url: string
  format: BookFormat
  title: string
  language: string
  detailsPath: string
}

interface Props {
  i18nConfig: I18nConfig
  /**
   * Files that are allowed to be opened by the reader.
   * Only content of media items can be opened, to avoid the reader
   * being used to show arbitrary files under the site's domain.
   */
  books: ReaderBook[]
}

export default function Reader({ i18nConfig, books }: Props) {
  const i18n = createI18n(i18nConfig)
  return (
    <I18nContext.Provider value={i18n}>
      <ReaderView books={books} />
    </I18nContext.Provider>
  )
}

const normalizeUrl = (url: string) => {
  try {
    return new URL(url, window.location.origin).href
  } catch {
    return undefined
  }
}

function ReaderView({ books }: { books: ReaderBook[] }) {
  const { t, direction } = useI18n()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [opened, setOpened] = useState<OpenedBook>()
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [page, setPage] = useState<{ current: number; total: number }>()

  const book = useMemo(() => {
    const file = new URLSearchParams(window.location.search).get("file")
    const fileUrl = file && normalizeUrl(file)
    return books.find(({ url }) => normalizeUrl(url) === fileUrl)
  }, [books])

  useEffect(() => {
    if (book) {
      document.title = `${book.title} | ${document.title}`
    }
  }, [book])

  useEffect(() => {
    const container = containerRef.current
    if (!book || !container) {
      setStatus("error")
      return
    }
    let isCancelled = false
    let current: OpenedBook | undefined
    openBook({ url: book.url, format: book.format, container })
      .then((result) => {
        if (isCancelled) {
          result.destroy()
          return
        }
        current = result
        setOpened(result)
        setStatus("ready")
      })
      .catch((error) => {
        console.error("Could not open book", error)
        if (!isCancelled) {
          setStatus("error")
        }
      })
    return () => {
      isCancelled = true
      current?.destroy()
    }
  }, [book])

  useEffect(() => {
    if (!opened) {
      return
    }
    const { reader } = opened
    const subscription = reader.pagination.state$.subscribe((state) => {
      const index = state.begin.absolutePageIndex
      setPage(
        index === undefined
          ? undefined
          : { current: index + 1, total: state.numberOfTotalPages },
      )
    })
    // Arrow keys are handled by prose reader's built-in hotkeys.
    return () => subscription.unsubscribe()
  }, [opened])

  // Page turns are visual: the left button always turns left.
  // Which direction is "previous" depends on the book's reading direction.
  const isRtlBook = opened?.manifest.readingDirection === "rtl"
  const leftLabel = isRtlBook ? t("ln.next") : t("ln.previous")
  const rightLabel = isRtlBook ? t("ln.previous") : t("ln.next")

  return (
    <div className="flex h-dvh flex-col bg-gray-50 text-gray-900">
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 md:px-8">
        <a
          href={book?.detailsPath ?? "/"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100"
          aria-label={t("ln.reader.back")}
          title={t("ln.reader.back")}
        >
          <ArrowLeftIcon className="rtl:scale-x-[-1]" />
        </a>
        {book && (
          <h1 className="line-clamp-1 font-bold" lang={book.language}>
            {book.title}
          </h1>
        )}
      </header>

      <div className="relative grow">
        <div className="absolute inset-0">
          {/* prose reader sets its own positioning on the mount element */}
          <div ref={containerRef} className="h-full w-full" />
        </div>
        {status !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-gray-600">
            {status === "loading"
              ? t("ln.reader.loading")
              : t("ln.reader.error")}
          </div>
        )}
      </div>

      <nav
        dir="ltr"
        className="flex h-16 shrink-0 items-center justify-between border-t border-gray-200 bg-white px-4 md:px-8"
      >
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30"
          disabled={status !== "ready"}
          onClick={() => opened?.reader.navigation.turnLeft()}
          aria-label={leftLabel}
          title={leftLabel}
        >
          <ChevronLeftIcon />
        </button>
        <div
          className="text-sm text-gray-600"
          dir={direction}
          aria-live="polite"
        >
          {page &&
            t("ln.reader.page-of", {
              current: page.current,
              total: page.total,
            })}
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30"
          disabled={status !== "ready"}
          onClick={() => opened?.reader.navigation.turnRight()}
          aria-label={rightLabel}
          title={rightLabel}
        >
          <ChevronRightIcon />
        </button>
      </nav>
    </div>
  )
}
