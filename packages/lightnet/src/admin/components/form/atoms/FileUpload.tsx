import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useRef,
  useState,
} from "react"
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
} from "react-hook-form"
import config from "virtual:lightnet/config"

import Icon from "../../../../components/Icon"
import { useI18n } from "../../../../i18n/react/use-i18n"

type FileType = "image/png" | "image/jpeg" | "image/webp"

export default function FileUpload<TFieldValues extends FieldValues>({
  onChange,
  onBlur,
  acceptedFileTypes,
}: {
  onChange: (file: File) => void
  onBlur?: () => void
  acceptedFileTypes: Readonly<FileType[]>
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const invalidFeedbackTimeout = useRef<number | null>(null)
  const { t } = useI18n()

  const [isDragging, setIsDragging] = useState(false)
  const [invalidFeedbackMessage, setInvalidFeedbackMessage] = useState<
    string | null
  >(null)

  useEffect(() => {
    return () => {
      if (invalidFeedbackTimeout.current !== null) {
        window.clearTimeout(invalidFeedbackTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    const blockBrowserFileOpen = (event: globalThis.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
    }
    window.addEventListener("drop", blockBrowserFileOpen)
    window.addEventListener("dragover", blockBrowserFileOpen)
    return () => {
      window.removeEventListener("drop", blockBrowserFileOpen)
      window.removeEventListener("dragover", blockBrowserFileOpen)
    }
  }, [])

  const triggerInvalidFeedback = (message: string) => {
    setInvalidFeedbackMessage(message)
    if (invalidFeedbackTimeout.current !== null) {
      window.clearTimeout(invalidFeedbackTimeout.current)
    }
    invalidFeedbackTimeout.current = window.setTimeout(() => {
      setInvalidFeedbackMessage(null)
      invalidFeedbackTimeout.current = null
    }, 2000)
  }

  const maxFileSizeBytes =
    (config.experimental?.admin?.maxFileSize ?? 0) * 1024 * 1024

  const onFileSelected = (file?: File) => {
    if (!file) {
      return
    }
    if (!acceptedFileTypes.includes(file.type as any)) {
      triggerInvalidFeedback(t("ln.admin.file-invalid-type"))
      return
    }
    if (maxFileSizeBytes && !(file.size < maxFileSizeBytes)) {
      triggerInvalidFeedback(
        t("ln.admin.file-too-big", {
          limit: config.experimental?.admin?.maxFileSize,
        }),
      )
      return
    }
    onChange(file)
    setInvalidFeedbackMessage(null)
  }

  const onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    onFileSelected(event.dataTransfer.files?.[0])
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFileSelected(event.target.files?.[0])
    // allow selecting the same file twice in a row
    event.target.value = ""
  }

  const colorClass = () => {
    if (invalidFeedbackMessage) {
      return "bg-slate-200 border-rose-800 "
    }
    if (isDragging) {
      return "border-sky-700 bg-sky-50"
    }
    return "bg-slate-200 border-slate-300 hover:bg-sky-50"
  }

  return (
    <>
      <div
        className={`relative flex w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-md border-2 border-dashed ${colorClass()} p-4 transition-colors ease-in-out focus-within:border-sky-700 focus-within:outline-none`}
        role="button"
        tabIndex={0}
        onBlur={onBlur}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        onDragOver={onDragEnter}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <span className="text-sm text-slate-800">
          {t("ln.admin.file-upload-hint")}
        </span>
        <span className="text-xs text-slate-600">
          {t("ln.admin.file-upload-size-limit", {
            limit: config.experimental?.admin?.maxFileSize,
          })}
        </span>
        {invalidFeedbackMessage && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-slate-50/85 text-rose-800"
            role="alert"
            aria-hidden="true"
          >
            <Icon className="mdi--alert-circle-outline" ariaLabel="" />
            <span className="font-semibold">{invalidFeedbackMessage}</span>
          </div>
        )}
      </div>
      <input
        tabIndex={-1}
        ref={(ref) => {
          fileInputRef.current = ref
        }}
        type="file"
        accept={acceptedFileTypes.join(",")}
        className="hidden"
        onChange={onInputChange}
      />
    </>
  )
}
